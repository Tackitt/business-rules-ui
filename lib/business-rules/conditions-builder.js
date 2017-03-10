(function ($) {
  $.fn.conditionsBuilder = function (options) {
    if (options == "data") {
      var builder = $(this).eq(0).data("conditionsBuilder");
      return builder.collectData();
    } else {
      return $(this).each(function () {
        var builder = new ConditionsBuilder(this, options);
        $(this).data("conditionsBuilder", builder);
      });
    }
  };

  ConditionsBuilder = function (element, options) {
    this.element = $(element);
    this.options = options || {};
    this.init();
  }

  ConditionsBuilder.prototype = {
    init: function () {
      this.fields = this.denormalizeOperators(
          this.options.variables, this.options.variable_type_operators);
      this.data = this.options.data || {"all": []};
      var rules = this.buildRules(this.data);
      this.element.html(rules);
    },

    denormalizeOperators: function (variablesData, operators) {
      return $.map(variablesData, function (variable) {
        variable.operators = operators[variable.field_type];
        return variable;
      });
    },

    collectData: function () {
      return this.collectDataFromNode(this.element.find("> .conditional"));
    },

    collectDataFromNode: function (element) {
      var klass = null;
      var _this = this;
      if (element.is(".conditional")) {
        klass = element.find("> .all-any-wrapper > .all-any").val();
      }

      if (klass) {
        var out = {};
        out[klass] = [];
        element.find("> .conditional, > .rule").each(function () {
          out[klass].push(_this.collectDataFromNode($(this)));
        });
        return out;
      }
      else {
        var valueField = element.find(".value");
        var value = valueField.val();
        if (valueField.hasClass('numberInput')) {
          value = Number(value);
        }
        var rule = {
          name: element.find(".field").val(),
          operator: element.find(".operator").val(),
          value: value
        };
        var subfields = element.find("> .subfields > .field");
        if (subfields.length > 0) {
          rule.params = _this.collectParams(subfields);
        }
        return rule;
      }
    },

    collectParams: function (params) {
      var out = {};
      params.each(function () {
        var input = $(this).find(':input');
        var value = input.val();
        if (input.hasClass('numeric')) {
          value = Number(value);
        }
        out[input.attr('name')] = value;
      });
      return out;
    },

    buildRules: function (ruleData) {
      return this.buildConditional(ruleData) || this.buildRule(ruleData);
    },

    buildConditional: function (ruleData) {
      var kind;
      if (ruleData.all) {
        kind = "all";
      }
      else if (ruleData.any) {
        kind = "any";
      }
      if (!kind) {
        return;
      }

      var div = $("<div>", {"class": "conditional " + kind});
      var selectWrapper = $("<div>", {"class": "all-any-wrapper"});
      var select = $("<select>", {"class": "all-any"});
      select.append($("<option>", {"value": "all", "text": "All", "selected": kind == "all"}));
      select.append($("<option>", {"value": "any", "text": "Any", "selected": kind == "any"}));
      selectWrapper.append(select);
      selectWrapper.append($("<h4>", {text: "of the following conditions:"}));
      div.append(selectWrapper);

      var addRuleLink = $("<a>", {"href": "#", "class": "add-rule", "text": "Add Condition"});
      var _this = this;
      addRuleLink.click(function (e) {
        e.preventDefault();
        var f = _this.fields[0];
        var newField = {name: f.value, operator: f.operators[0], value: null};
        div.append(_this.buildRule(newField));
      });
      div.append(addRuleLink);

      var addConditionLink = $("<a>", {"href": "#", "class": "add-condition", "text": "Add Sub-Condition"});
      addConditionLink.click(function (e) {
        e.preventDefault();
        var f = _this.fields[0];
        var newField = {"all": [{name: f.value, operator: f.operators[0], value: null}]};
        div.append(_this.buildConditional(newField));
      });
      div.append(addConditionLink);

      var removeLink = $("<a>", {"class": "remove", "href": "#", "text": "Remove This Sub-Condition"});
      removeLink.click(function (e) {
        e.preventDefault();
        div.remove();
      });
      div.append(removeLink);

      var rules = ruleData[kind];
      for (var i = 0; i < rules.length; i++) {
        div.append(this.buildRules(rules[i]));
      }
      return div;
    },

    buildRule: function (ruleData) {
      var ruleDiv = $("<div>", {"class": "rule"});
      var fieldSelect = getFieldSelect(this.fields, ruleData);
      var operatorSelect = getOperatorSelect();
      var subfields = $("<div>", {"class": "subfields"});
      fieldSelect.change(onFieldSelectChanged.call(this, operatorSelect, subfields, ruleData));

      ruleDiv.append(fieldSelect);
      ruleDiv.append(operatorSelect);
      ruleDiv.append(subfields);
      ruleDiv.append(removeLink());

      fieldSelect.change();
      ruleDiv.find("> .value").val(ruleData.value);

      // Add values to params
      if (ruleData.params) {
        for (var key in ruleData.params) {
          ruleDiv.find('.subfields .field :input[name=' + key + ']').val(ruleData.params[key]);
        }
      }
      return ruleDiv;
    },

    buildField: function (field) {
      var div = $("<div>", {"class": "field"});
      var label = $("<label>", {"text": field.label});
      div.append(label);

      switch (field.field_type) {
        case "text":
          div.append($("<input>", {"type": "text", "name": field.name}));
          break;
        case "numeric":
          div.append($("<input>", {"type": "text", "name": field.name, "class": "numeric"}));
          break;
        case "select":
          var select = $("<select>", {"name": field.name});
          for (var i = 0; i < field.options.length; i++) {
            var optionData = field.options[i];
            var option = $("<option>", {"text": optionData.label, "value": optionData.name});
            option.data("optionData", optionData);
            select.append(option);
          }
          div.append(select);
          break;
        case "select_multiple":
          var selectLength = field.options.length > 10 ? 10 : field.options.length;
          var select = $("<select class='value' multiple size='" + selectLength + "''></select>");
          for (var i = 0; i < field.options.length; i++) {
            var optionData = field.options[i];
            var option = $("<option>", {"text": optionData.label, "value": optionData.name});
            option.data("optionData", optionData);
            select.append(option);
          }
          div.append(select);
          break;
      }
      return div;
    },

    operatorsFor: function (fieldName) {
      for (var i = 0; i < this.fields.length; i++) {
        var field = this.fields[i];
        if (field.name == fieldName) {
          return field.operators;
        }
      }
    },

    paramsFor: function (fieldName) {
      for (var i = 0; i < this.fields.length; i++) {
        var field = this.fields[i];
        if (field.name == fieldName) {
          return field.params || [];
        }
      }
    }
  };

  function getFieldSelect(fields, ruleData) {
    var select = $("<select>", {"class": "field"});
    for (var i = 0; i < fields.length; i++) {
      var field = fields[i];
      var option = $("<option>", {
        text: field.label,
        value: field.name,
        selected: ruleData.name == field.name
      });
      option.data("options", field.options);
      select.append(option);
    }
    return select;
  }

  function getOperatorSelect() {
    var select = $("<select>", {"class": "operator"});
    select.change(onOperatorSelectChange);
    return select;
  }

  function removeLink() {
    var removeLink = $("<a>", {"class": "remove", "href": "#", "text": "Remove"});
    removeLink.click(onRemoveLinkClicked);
    return removeLink;
  }

  function onRemoveLinkClicked(e) {
    e.preventDefault();
    $(this).parents(".rule").remove();
  }

  function onFieldSelectChanged(operatorSelect, subfields, ruleData) {
    var builder = this;
    return function (e) {
      var operators = builder.operatorsFor($(e.target).val());
      operatorSelect.empty();
      for (var i = 0; i < operators.length; i++) {
        var operator = operators[i];
        var option = $("<option>", {
          text: operator.label || operator.name,
          value: operator.name,
          selected: ruleData.operator == operator.name
        });
        option.data("field_type", operator.input_type);
        operatorSelect.append(option);
      }
      operatorSelect.change();

      var params = builder.paramsFor($(e.target).val());
      subfields.empty();
      for (var i = 0; i < params.length; i++) {
        var param = params[i];
        subfields.append(builder.buildField(param));
      }
    }
  }

  function onOperatorSelectChange(e) {
    var $this = $(this);
    var option = $this.find("> :selected");
    var container = $this.parents(".rule");
    var fieldSelect = container.find(".field");
    var currentValue = container.find(".value");
    var val = currentValue.val();

    // Clear errorMessages when switching between operator types
    $this.nextAll().each(function (index) {
      if ($(this).attr('class') == 'errorMessage') {
        $(this).remove();
      }
    });
    switch (option.data("field_type")) {
      case "none":
        $this.after($("<input>", {"type": "hidden", "class": "value"}));
        break;
      case "text":
        $this.after($("<label class='errorMessage'></label>"));
        $this.after($("<input>", {"class": "value textInput"}));
        break;
      case "numeric":
        $this.after($("<label class='errorMessage'></label>"));
        $this.after($("<input>", {"type": "number", "class": "value numberInput"}));
        break;
      case "time":
        $this.after($("<label class='errorMessage'></label>"));
        $this.after($("<input>", {"type": "time", "class": "value timeInput"}));
      case "date":
        $this.after($("<label class='errorMessage'></label>"));
        $this.after($("<input>", {"type": "date", "class": "value dateInput"}));
        break;
      case "datetime":
        $this.after($("<label class='errorMessage'></label>"));
        $this.after($("<input>", {"type": "datetime-local", "class": "value datetimeInput"}));
        break;
      case "select":
        var select = $("<select>", {"class": "value"});
        var options = fieldSelect.find("> :selected").data("options");
        for (var i = 0; i < options.length; i++) {
          var opt = options[i];
          select.append($("<option>", {"text": opt, "value": opt}));
        }
        $this.after(select);
        break;
      case "select_multiple":
        var options = fieldSelect.find("> :selected").data("options");
        var selectLength = options.length > 10 ? 10 : options.length;
        var select = $("<select class='value' multiple size='" + selectLength + "''></select>");
        for (var i = 0; i < options.length; i++) {
          var opt = options[i];
          select.append($("<option>", {"text": opt, "value": opt}));
        }
        $this.after(select);
        break;
      default:
        console.error("Unknown field_date ", option.data("field_type"));
    }
    currentValue.remove();
  }

})($);
