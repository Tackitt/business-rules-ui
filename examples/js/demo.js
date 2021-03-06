var conditions, actions, nameField, ageField, occupationField, submit, allData;
(function($) {
  var occupationOptions = [ "Software Engineer", "Biz Dev", "Marketing" ];

  function onReady() {
    conditions = $("#conditions");
    actions = $("#actions");
    nameField = $("#nameField");
    occupationField = $("#occupationField");
    ageField = $("#ageField");
    submit = $("#submit");

    $.getJSON('/rule-data.json')
        .done(initializeConditions)
        .done(initializeActions)
        .done(initializeForm);
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
      var rule = {conditions: conditions.conditionsBuilder("data"), actions: actions.actionsBuilder("data")};
      var rules = [rule];
      console.log(JSON.stringify(rules, null, 2));
      var rules_to_post = JSON.stringify(rules);
      var settings = {
        "async": true,
        "url": "/rule",
        "method": "POST",
        "headers": {
          "content-type": "application/json",
          "cache-control": "no-cache"
        },
        "processData": false,
        "data": rules_to_post
      };

      $.ajax(settings).done(function (response) {
        console.log(response);
      });
    });
  }
  $(onReady);
})(jQuery);
