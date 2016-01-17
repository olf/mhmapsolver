"use strict";

String.prototype.capitalise = function() {
    return this.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
};

function CSVToArray(strData, strDelimiter) {
    // Check to see if the delimiter is defined. If not,
    // then default to comma.
    strDelimiter = ",";

    // Create a regular expression to parse the CSV values.
    var objPattern = new RegExp(
    (
    // Delimiters.
    "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

    // Quoted fields.
    "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

    // Standard fields.
    "([^\"\\" + strDelimiter + "\\r\\n]*))"),
        "gi");


    // Create an array to hold our data. Give the array
    // a default empty first row.
    var arrData = [
        []
    ];

    // Create an array to hold our individual pattern
    // matching groups.
    var arrMatches = null;


    // Keep looping over the regular expression matches
    // until we can no longer find a match.
    while (arrMatches = objPattern.exec(strData)) {

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


        // Now that we have our delimiter out of the way,
        // let's check to see which kind of value we
        // captured (quoted or unquoted).
        if (arrMatches[2]) {

            // We found a quoted value. When we capture
            // this value, unescape any double quotes.
            var strMatchedValue = arrMatches[2].replace(
                new RegExp("\"\"", "g"),
                "\"");

        } else {

            // We found a non-quoted value.
            var strMatchedValue = arrMatches[3];

        }


        // Now that we have our value string, let's add
        // it to the data array.
        arrData[arrData.length - 1].push(strMatchedValue);
    }

    // Return the parsed data.
    return (arrData);
}

Object.size = function(obj) {
    var size = 0;
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};






var pop = new XMLHttpRequest();
pop.open("get", "https://dl.dropboxusercontent.com/u/14589881/populations2.csv", true);
pop.onreadystatechange = function() {
	if (pop.readyState == 4) {
		processPop();
	}
}
pop.send();

var popCSV = new Array();
var popArray = new Array();
function processPop() {
	var popText = pop.responseText;

	popCSV = CSVToArray(popText);
	//console.log(popCSV);
	var popCSVLength = Object.size(popCSV);
	//console.log(popCSVLength);
		
	//Creating popArray
	for(var i=1; i<popCSVLength; i++) {
		var row = popCSV[i];
		var location = row[0];
		var phase = row[1];
		var cheese = row[2];
		var charm = row[3];
		var mouseName = row[4];
		mouseName = mouseName.capitalise();
		var population = row[5];

		if (popArray[mouseName] == undefined) popArray[mouseName] = new Array(); //If mouse doesn't exist in array
		if (popArray[mouseName][location] == undefined) popArray[mouseName][location] = new Array();
		if (popArray[mouseName][location][phase] == undefined) popArray[mouseName][location][phase] = new Array();
		if (popArray[mouseName][location][phase][cheese] == undefined) popArray[mouseName][location][phase][cheese] = new Array();
		popArray[mouseName][location][phase][cheese][charm] = population;
	}

	loadMouseDropdown();
}




function loadMouseDropdown() {
	var popArrayLength = Object.size(popArray);
	var suggests = [];

	for (var i=0; i<popArrayLength; i++) {
		suggests.push(Object.keys(popArray)[i]);
		suggests.push(Object.keys(popArray)[i].toLowerCase());
	}
	
	$("#map").asuggest(suggests);

}


window.onload = function () {
	/*document.getElementById("map").onchange = function () {
    	var mapText = document.getElementById("map").value;
	    //console.log(mapText);
	    processMap(mapText);
	};*/

	document.getElementById("map").onkeyup = function () {
    	var mapText = document.getElementById("map").value;
	    //console.log(mapText);
	    processMap(mapText);
	};
}

function processMap(mapText) {
	var mouseArray = mapText.split("\n");
	var mouseArrayLength = Object.size(mouseArray);
	
	var interpretedAs = document.getElementById("interpretedAs");
	var mouseList = document.getElementById("mouseList");

	var interpretedAsText = "Rectify:</b><br>";
	var mouseListText = '';
	
	var bestLocationArray = new Array();
	
	for (var i=0; i<mouseArrayLength; i++) {
		var mouseName = mouseArray[i];
		mouseName = mouseName.capitalise();
		mouseName = mouseName.trim();
		var indexOfMouse = mouseName.indexOf(" Mouse");
		if (indexOfMouse >= 0) {
			mouseName = mouseName.slice(0,indexOfMouse);
		}
		
		if (popArray[mouseName] == undefined) { //Mouse name not recognised
			interpretedAsText += "<div class='invalid'>" + mouseName+"</div>";
			mouseListText += "<tr><td><b>" + mouseName + "</b></td></tr>";
		} else {			
		
			var mouseLocationCheese = new Array();
			
			
			mouseListText += "<tr><td><b>" + mouseName + "</b></td>";

			var mouseLocation = Object.keys(popArray[mouseName]);
			var noLocations = Object.size(popArray[mouseName]); //console.log(noLocations);
			var mouseListTextRow2 = '<tr><td></td>';


			for (var j=0; j<noLocations; j++) {
				var locationName = mouseLocation[j];
				
				var mousePhase = Object.keys(popArray[mouseName][locationName]);
				var noPhases = Object.size(popArray[mouseName][locationName]);
				
				for (var k=0; k<noPhases; k++) {
					var phaseName = mousePhase[k];

					var mouseCheese = Object.keys(popArray[mouseName][locationName][phaseName]);
					var noCheeses = Object.size(popArray[mouseName][locationName][phaseName]);

					for (var l=0; l<noCheeses; l++) {
						var cheeseName = mouseCheese[l];

						var mouseCharm = Object.keys(popArray[mouseName][locationName][phaseName][cheeseName]);
						var noCharms = Object.size(popArray[mouseName][locationName][phaseName][cheeseName]);

						for (var m=0; m<noCharms; m++) {
							var charmName = mouseCharm[m]

							var locationPhaseCheeseCharm = locationName;
							
							var URLString = 'best_setup.html?';
							//Replace apostrophes with %27
							URLString+= "location="+locationName;

							if (phaseName != "-") locationPhaseCheeseCharm += " (" + phaseName + ")";
							if (cheeseName.indexOf("/") < 0) locationPhaseCheeseCharm += " " + cheeseName;
							if (charmName != "-") locationPhaseCheeseCharm += " " + charmName;
							
							var attractionRate = parseFloat(popArray[mouseName][locationName][phaseName][cheeseName][charmName]);

							if (bestLocationArray[locationPhaseCheeseCharm] == undefined) {
								bestLocationArray[locationPhaseCheeseCharm] = attractionRate;
								
							} else {
								bestLocationArray[locationPhaseCheeseCharm] += attractionRate;
							}
							
							mouseLocationCheese[locationPhaseCheeseCharm] = attractionRate;


						}
					}
				}
			}
			
			var sortedMLC = sortBestLocation (mouseLocationCheese); //console.log(sortedMLC);
			var sortedMLCLength = Object.size(sortedMLC);
			
			for (var l=0; l<sortedMLCLength; l++) {
					mouseListText += "<td>" + sortedMLC[l][0] + "</td>";// console.log(l);
					mouseListTextRow2 += "<td>" + sortedMLC[l][1] + "</td>";

			}
			
			mouseListText += "</tr>";
			mouseListTextRow2 += "</tr>";
			mouseListText += mouseListTextRow2;
		}
	}
	
	interpretedAs.innerHTML = interpretedAsText;
	mouseList.innerHTML = mouseListText;
	
	var sortedLocation = sortBestLocation (bestLocationArray);
	printBestLocation(sortedLocation);
}



function sortBestLocation (bestLocationArray) {


	var sortedLocation = new Array();
	
	var bLALength = Object.size(bestLocationArray);
	var bLAKeys = Object.keys(bestLocationArray);
	
	for (var i=0; i<bLALength; i++) {
		var locationCheese = bLAKeys[i];
		//sortedLocation[bestLocationArray[locationCheese]] = locationCheese;
		sortedLocation.push([locationCheese, bestLocationArray[locationCheese]])
	}
	
	
	sortedLocation.sort(function(a,b) {return b[1]-a[1]});
	
	return sortedLocation;
}

function printBestLocation (sortedLocation) {

	var bestLocation = document.getElementById("bestLocation");
	var bestLocationHTML = '';
	
	var sortedLocationLength = Object.size(sortedLocation);
	
	for (var i=0; i<sortedLocationLength; i++) {
		bestLocationHTML += "<tr><td><b>" + sortedLocation[i][0] + "</b></td><td>" + sortedLocation[i][1].toFixed(2) + "</td></tr>";
	}
	
	bestLocation.innerHTML = bestLocationHTML;
	
}