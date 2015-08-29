(function() {
  model.playerColors = ko.computed(function () {
      return {
          primaries: _.pluck(model.players(), 'primary_color'),
          secondaries: _.pluck(model.players(), 'secondary_color'),
          names: _.pluck(model.players(), 'name'),
          ids: _.pluck(model.players(), 'id')
      };
  });
  model.playerColors.subscribe((function () {
      var hash = '';

      return function (value) {
          var new_hash = JSON.stringify(value);
          if (hash !== new_hash) {
              api.Panel.message('unit_hover_info', 'player_colors', value);
          }
          hash = new_hash;
      };
  })());

  handlers.request_player_colors = function() {
    api.Panel.message('unit_hover_info', 'player_colors', model.playerColors());
  }
})()
