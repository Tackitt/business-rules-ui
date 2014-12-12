var conditions, actions, nameField, ageField, occupationField, submit, allData;
(function($) {
  var occupationOptions = [ "Software Engineer", "Biz Dev", "Marketing" ];

  function getInitialData() {
    return {"variables": [
            { "name": "expiration_days",
              "label": "Days until expiration",
              "field_type": "numeric",
              "options": [],
              "params": []},
            { "name": "current_month",
              "label": "Current Month",
              "field_type": "string",
              "options": [],
              "params": []},
            { "name": "goes_well_with",
              "label": "Goes Well With",
              "field_type": "select",
              "options": ["Eggnog", "Cookies", "Beef Jerkey"],
              "params": []},
            { "name": "orders_sold_in_last_x_days",
              "label": "Orders Sold In Last X Days",
              "field_type": "numeric",
              "options": [],
              "params": [{"field_type": "numeric", "name": "days", "label": "Days"}]},
            { "name": "select_multiple_rule",
              "label": "Select Multiple Rule",
              "field_type": "select_multiple",
              "options": ["Foo", "Bar", "Foobar"],
              "params": [{"field_type": "select",
                          "name": "select_param",
                          "label": "Select Param",
                          "options": [
                            {"label": "Available", "name": "available"},
                            {"label": "Last items", "name": "last_items"},
                            {"label": "Out of stock", "name": "out_of_stock"}
                        ]}]}
          ],
          "actions": [
            { "name": "put_on_sale",
              "label": "Put On Sale",
              "params": [{name: "sale_percentage", label: "Sale Percentage", fieldType : "numeric"}]},
            { "name": "order_more",
              "label": "Order More",
              "params": [{name: "number_to_order", label: "Number To Order", fieldType : "numeric"}]}
          ],
          "variable_type_operators": {
            "numeric": [ {"name": "equal_to",
                          "label": "Equal To",
                          "input_type": "numeric"},
                         {"name": "less_than",
                          "label": "Less Than",
                          "input_type": "numeric"},
                         {"name": "greater_than",
                          "label": "Greater Than",
                          "input_type": "numeric"}],
            "string": [ { "name": "equal_to",
                          "label": "Equal To",
                          "input_type": "text"},
                        { "name": "non_empty",
                          "label": "Non Empty",
                          "input_type": "none"}],
            "select": [ { "name": "contains",
                          "label": "Contains",
                          "input_type": "select"},
                        { "name": "does_not_contain",
                          "label": "Does Not Contain",
                          "input_type": "select"}],
            "select_multiple": [ { "name": "contains_all",
                                   "label": "Contains All",
                                   "input_type": "select_multiple"}]
          }
    };
  };

  function getInitialConditions() {
    return {
      "all": [
        { "name": "expiration_days",
          "operator": "greater_than",
          "value": 3},
        { "name": "select_multiple_rule",
          "operator": "equal_to",
          "value": ["Foo", "Foobar"]},
        {"name": "orders_sold_in_last_x_days",
         "operator": "greater_than",
         "value": 10,
         "params": {"days":5}}
      ]
    };
  };

  function getInitialActions() {
    return [
      { "name": "sale_percentage",
        "value": 10
      },
    ]
  };

  function onReady() {
    conditions = $("#conditions");
    actions = $("#actions");
    nameField = $("#nameField");
    occupationField = $("#occupationField");
    ageField = $("#ageField");
    submit = $("#submit");
    allData = getInitialData();

    allData.data = getInitialConditions();
    initializeConditions(allData);

    allData.data = getInitialActions();
    initializeActions(allData);
    initializeForm();
  }

  function initializeConditions(data) {
    conditions.conditionsBuilder(data)
  }

  function initializeActions(data) {
    actions.actionsBuilder(data);
  }

  function initializeForm() {
    for(var i=0; i < occupationOptions.length; i++) {
      var o = occupationOptions[i];
      occupationField.append($("<option>", {value: o.name, text: o.label}));
    }

    submit.click(function(e) {
      e.preventDefault();
      console.log("CONDITIONS");
      console.log(JSON.stringify(conditions.conditionsBuilder("data")));
      console.log("ACTIONS");
      console.log(JSON.stringify(actions.actionsBuilder("data")));
    });
  }
  $(onReady);
})(jQuery);
