/* eslint-env jquery */
var populationData = [];

$(document).ready(function () {
  var mouseList = getMouseListFromURL(window.location.search.match(/mice=([^&]*)/));

  if (mouseList.length === 0) {
    var cookie = $.cookie('mouselist');
    if (cookie !== undefined) {
      $('#map').val($.cookie('mouselist'));
    }
  } else {
    $('#map').val(mouseList);
  }

  var ajax = new XMLHttpRequest();

  // attractionrates.csv is the (hidden) attraction rates
  // sheet from http://goo.gl/y17T4q (MH Calculator) saved as CSV
  //ajax.open('get', 'http://localhost:3000/data/attractionrates.csv', true);
  ajax.open('get', 'https://olf.github.io/mhmapsolver/data/attractionrates.csv', true);

  ajax.onreadystatechange = function () {
    if (ajax.readyState == 4) {
      var csv = csvToArray(ajax.responseText);
      processPopulationData(csv);
      processMap($('#map').val());
    }
  };
  ajax.send();

  $('#map').keyup(function () {
    var mouselist = $('#map').val();
    processMap(mouselist);
    $.cookie('mouselist', mouselist, {
      expires: 14
    });
  });
});

String.prototype.capitalise = function () {
  return this.replace(/(?:^|\s)\S/g, function (a) {
    return a.toUpperCase();
  });
};

function getMouseListFromURL(parameters) {
  if (parameters) {
    parameters = decodeURI(parameters[1]);

    return parameters
      .split('/')
      .join('\n');
  } else {
    return [];
  }
}

function csvToArray(strData, strDelimiter) {
  // Check to see if the delimiter is defined. If not,
  // then default to comma.
  strDelimiter = ',';

  // Create a regular expression to parse the CSV values.
  var objPattern = new RegExp(
    (
      // Delimiters.
      '(\\' + strDelimiter + '|\\r?\\n|\\r|^)' +

      // Quoted fields.
      '(?:"([^"]*(?:""[^"]*)*)"|' +

      // Standard fields.
      '([^"\\' + strDelimiter + '\\r\\n]*))'),
    'gi');


  // Create an array to hold our data. Give the array
  // a default empty first row.
  var arrData = [
    []
  ];

  // Create an array to hold our individual pattern
  // matching groups.
  var arrMatches = objPattern.exec(strData);


  // Keep looping over the regular expression matches
  // until we can no longer find a match.
  while (arrMatches) {

    // Get the delimiter that was found.
    var strMatchedDelimiter = arrMatches[1];

    // Check to see if the given delimiter has a length
    // (is not the start of string) and if it matches
    // field delimiter. If id does not, then we know
    // that this delimiter is a row delimiter.
    if (
      strMatchedDelimiter.length &&
      (strMatchedDelimiter != strDelimiter)) {

      // Since we have reached a new row of data,
      // add an empty row to our data array.
      arrData.push([]);

    }

    var strMatchedValue;

    // Now that we have our delimiter out of the way,
    // let's check to see which kind of value we
    // captured (quoted or unquoted).
    if (arrMatches[2]) {

      // We found a quoted value. When we capture
      // this value, unescape any double quotes.
      strMatchedValue = arrMatches[2].replace(
        new RegExp('""', 'g'),
        '"');

    } else {

      // We found a non-quoted value.
      strMatchedValue = arrMatches[3];

    }


    // Now that we have our value string, let's add
    // it to the data array.
    arrData[arrData.length - 1].push(strMatchedValue);

    arrMatches = objPattern.exec(strData);
  }

  // Return the parsed data.
  return (arrData);
}

function processPopulationData(csv) {
  for (var row in csv) {
    var data = csv[row];
    var attractionRate = parseFloat(data[4]);

    if (attractionRate > 0.0) {
      var mouseName = data[5].capitalise();
      var location = data[0];
      if (data[1].length > 1) {
        location += ' - ' + data[1];
      }
      var cheese = data[2];
      var charm = (data[3].length > 1 ? data[3] : '');

      if (populationData[mouseName] === undefined) populationData[mouseName] = []; //If mouse doesn't exist in array
      if (populationData[mouseName][location] === undefined) populationData[mouseName][location] = [];
      if (populationData[mouseName][location][cheese] === undefined) populationData[mouseName][location][cheese] = [];
      populationData[mouseName][location][cheese][charm] = attractionRate;
    }
  }

  loadMouseDropdown();
}

function loadMouseDropdown() {
  var suggests = [];
  for (var mouse in populationData) {
    suggests.push(mouse);
    suggests.push(mouse.toLowerCase());
  }

  $('#map').asuggest(suggests);
}

function amendMouseName(name) {
  name = name.capitalise().trim();

  if (name.indexOf(' Mouse') >= 0) {
    name = name.slice(0, name.indexOf(' Mouse'));
  }

  return name;
}

function processMap(mapText) {
  var mouseList = mapText
    .split('\n')
    .map(amendMouseName)
    .filter(function (v) {
      return v.length > 0;
    })
    .sort();
  mouseList = jQuery.unique(mouseList);

  var mouseLocations = [];
  var bestLocations = [];
  var unknownMice = [];

  for (var i = 0; i < mouseList.length; i++) {
    var mouseName = mouseList[i];

    if (populationData[mouseName] === undefined) { //Mouse name not recognised
      unknownMice.push(mouseName);
    } else {
      var mouseLocationCheese = [];

      for (var locationName in populationData[mouseName]) {
        for (var cheeseName in populationData[mouseName][locationName]) {
          for (var charmName in populationData[mouseName][locationName][cheeseName]) {
            var locationCheeseCharm = locationName;

            if (cheeseName !== '') locationCheeseCharm += '#' + cheeseName;
            if (charmName !== '') locationCheeseCharm += '#' + charmName;

            var attractionRate = populationData[mouseName][locationName][cheeseName][charmName];

            var mouse = {
              name: mouseName,
              rate: attractionRate
            };

            if (bestLocations[locationCheeseCharm] === undefined) {
              bestLocations[locationCheeseCharm] = {
                location: locationName,
                cheese: cheeseName,
                charm: charmName,
                totalRate: attractionRate,
                mice: [mouse]
              };
            } else {
              bestLocations[locationCheeseCharm].totalRate += attractionRate;
              bestLocations[locationCheeseCharm].mice.push(mouse);
            }

            mouseLocationCheese[locationCheeseCharm] = attractionRate;
          }
        }
      }

      mouseLocations.push({
        name: mouseName,
        locations: sortMouseLocations(mouseLocationCheese)
      });
    }
  }

  printUnknownMice(unknownMice);
  printBestLocations(sortBestLocations(bestLocations));
  printMouseLocations(mouseLocations);

  $('#mousecount').text((mouseList.length - unknownMice.length) + ' mice');
}

function sortBestLocations(locations) {
  var sortedLocation = [];

  for (var location in locations) {
    sortedLocation.push(locations[location]);
  }

  sortedLocation.sort(function (a, b) {
    return b.totalRate - a.totalRate;
  });

  return sortedLocation;
}

function sortMouseLocations(locations) {
  var sortedLocation = [];

  for (var location in locations) {
    sortedLocation.push([location, locations[location]]);
  }

  sortedLocation.sort(function (a, b) {
    return b[1] - a[1];
  });

  return sortedLocation;
}

function printUnknownMice(mice) {
  if (mice.length > 0) {
    $('#unknownmice').html(
      mice.reduce(function (p, c) {
        return p + '<p>' + c + '</p>';
      }, '')
    );
    $('#unknownmicecontainer').show();
  } else {
    $('#unknownmice').html('');
    $('#unknownmicecontainer').hide();
  }
}

function printMouseLocations(mice) {
  var mouseListText = '';

  mice.sort(function (a, b) {
    return b.locations[0][1] - a.locations[0][1];
  });

  for (var i in mice) {
    var mouse = mice[i];
    mouseListText += '<tr><td rowspan="2" class="mousename">' + mouse.name + '</td>';

    var mouseListTextRow2 = '<tr>';

    var maxMLC = (mouse.locations.length > 10 ? 10 : mouse.locations.length);
    for (var n = 0; n < maxMLC; n++) {
      var textLines = mouse.locations[n][0].split('#');
      mouseListText +=
        '<td class="text">' +
        '<p><strong>' + textLines[0] + '</strong></p>' +
        '<p>' + textLines.slice(1).map(strikethrough).join('</p><p>') + '</p>' +
        '</td>';
      mouseListTextRow2 += '<td class="rate">' + mouse.locations[n][1].toFixed(2) + '%</td>';
    }

    if (mouse.locations.length > 10) {
      mouseListText += '<td class="text">(' + (mouse.locations.length - 10) + ' more)</td>';
      mouseListTextRow2 += '<td class="rate"></td>';
    } else {
      mouseListText += '<td class="padding" rowspan="2" colspan="' + (11 - mouse.locations.length) + '"></td>';
    }

    mouseListText += '</tr>';
    mouseListTextRow2 += '</tr>';
    mouseListText += mouseListTextRow2;
  }

  $('#mouselist tbody').html(mouseListText);
  $('#mouselistcontainer').toggle(mouseListText.length > 0);
}

function strikethrough(text) {
  if (text.toLowerCase().indexOf('not') > -1) {
    return text.replace(/not (.*)/i, '<strike>$1</strike>');
  } else {
    return text;
  }
}

function printBestLocations(locations) {
  var bestLocationHTML = '';

  bestLocationHTML = locations.reduce(function (p, c) {
    return p +
      '<tr>' +
      '<td data-value="' + c.totalRate.toFixed(2) + '">' +
      '<p>' +
      '<strong>' + c.location + '</strong>' +
      ' (' + c.totalRate.toFixed(2) + '%)' +
      '</p>' +
      (c.cheese.length > 0 ? '<p>' + strikethrough(c.cheese) + '</p>' : '') +
      (c.charm.length > 0 ? '<p>' + strikethrough(c.charm) + '</p>' : '') +
      '</td>' +
      '<td data-value="' + c.mice.length + '">' +
      c.mice
        .sort(function (a, b) {
          return b.rate - a.rate;
        })
        .reduce(function (txt, mouse) {
          return txt + '<p>' + mouse.name + ' (' + mouse.rate.toFixed(2) + '%)</p>';
        }, '') +
      '</td>' +
      '</tr>';
  }, '');

  $('#bestlocations tbody').html(bestLocationHTML);
  $('#bestlocationscontainer').toggle(bestLocationHTML.length > 0);
}
