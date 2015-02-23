(function() {
  // ---------- Get colors from live game --------
  var rgb = function(c) {
    return 'rgb('+c[0]+','+c[1]+','+c[2]+')'
  }
  model.playerColors = ko.observable({
    names: [],
    primaries: [],
    secondaries: [],
  })
  model.colorNameTable = ko.observable({})
  handlers.player_colors = function(payload) {
    model.playerColors(payload)
    var obj = {}
    for (var i = 0;i < payload.names.length;i++) {
      var key = rgb(payload.primaries[i])+rgb(payload.secondaries[i])
      obj[key] = payload.names[i]
    }
    model.colorNameTable(payload)
  }

  api.Panel.message(api.Panel.parentId, 'request_player_colors');

  // - Hover colors have be gamma adjusted in scene shadow, and are imprecises
  var getComponents = function(color) {
    var parts = color.match(/rgb\((.+)\)/)[1].split(',')
    return parts.map(function(s) {return parseInt(s, 10)})
  }

  var sumOfSquares = function(a, b) {
    return Math.pow(a[0]-b[0], 2) +
           Math.pow(a[1]-b[1], 2) +
           Math.pow(a[2]-b[2], 2)
  }

  var lookupName = function(primary, secondary) {
    var pri = getComponents(primary)
    var sec = getComponents(secondary)
    var bestScore = Math.pow(255, 2)*3
    var bestName = ''
    var score
    var armies = model.playerColors()
    for (var i = 0;i < armies.names.length;i++) {
      score = sumOfSquares(armies.primaries[i], pri) +
        sumOfSquares(armies.secondaries[i], sec)
      if (score < bestScore) {
        bestScore = score
        bestName = armies.names[i]
      }
    }
    return bestName
  }

  // ------------- template hooks -------------
  model.playerNameFor = function(primary, secondary) {
    var p = primary()
    var s = secondary()
    if (p == '' && s == '') return ''

    if (model.colorNameTable()[p+s]) {
      return model.colorNameTable()[p+s].slice(0,10)
    } else {
      return model.colorNameTable()[p+s] = lookupName(p, s).slice(0,10)
    }
  }

  $(".div_army_color_fill").append('<p class="army_name" data-bind="text: $root.playerNameFor(primaryColor, secondaryColor)"></p>')

  // --- engine continuously sends hover updates, even when no change -----
  model.worldHoverState = ko.observable('')
  var vanillaHover = handlers.hover
  handlers.hover = function(payload) {
    var ps = JSON.stringify(payload)
    if (model.worldHoverState() != ps) {
      model.worldHoverState(ps)
      vanillaHover(payload)
    }
  }

})()
