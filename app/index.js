import clock from "clock";
import document from "document";
import {
	preferences,
	units
} from "user-settings";
import {
	battery
} from "power";
import {
	charger
} from "power";
import * as tools from './tools.js';
import {
	HeartRateSensor
} from "heart-rate";
import {
	today
} from 'user-activity';

clock.granularity = "seconds";

// Get a handle on the <text> element
const time = document.getElementById('time');
const batteryText = document.getElementById('battery').getElementById("text");
const batteryIcon = document.getElementById('battery').getElementById("icon");
const date = document.getElementById('date');
const steps = document.getElementById('steps').getElementById("text");
const heartRate = document.getElementById('heartRate').getElementById('text');
const heartRateSensor = new HeartRateSensor();
const distance = document.getElementById('distance').getElementById('text');
const stairs = document.getElementById('stairs').getElementById('text');
const calories = document.getElementById('calories').getElementById('text');
bindEvents()
bindAllStatClickEvents();


clock.ontick = (evt) => {
	heartRateSensor.start();
	let currentDate = evt.date;
	let hours = currentDate.getHours();
	if (preferences.clockDisplay === '12h') {
		hours = hours % 12 || 12;
	} else {
		hours = zeroPad(hours);
	}

	date.text = `${dayOfWeek(currentDate.getDay())} ${currentDate.getMonth()+1}/${currentDate.getDate()}/${currentDate.getFullYear().toString().substring(2)}`;
	time.text = `${monoDigits(hours)}:${monoDigits(tools.zeroPad(currentDate.getMinutes()))}:${ monoDigits(tools.zeroPad(currentDate.getSeconds()))}`;
	batteryText.text = `${Math.floor(battery.chargeLevel)}%`;

	if (charger.connected) {
		batteryIcon.href = './resourses/images/gauntlet-gold.png';
	} else {
		batteryIcon.href = './resources/images/gauntlet-silver.png';
	}
	if (today.local.steps > 10000) {
		steps.text = (Math.round((today.local.steps / 100)) / 10) + 'k';
	} else {
		steps.text = steps.zoomedDisplay;
	}
	document.getElementById('steps').getElementById('zoomedDisplay').value = today.local.steps;

	distance.text = getDistance(today).pretty;

	stairs.text = addCommas(today.adjusted.elevationGain || 0);
	document.getElementById('stairs').getElementById('zoomedDisplay').value = today.adjusted.elevationGain;

	if (today.local.calories > 10000) {
		calories.text = (Math.round((today.local.calories / 100)) / 10) + 'k';
	} else {
		calories.text = today.adjusted.calories || 0;
	}
	document.getElementById('calories').getElementById('zoomedDisplay').value = today.local.calories;
}

heartRateSensor.onreading = function () {
	heartRate.text = heartRateSensor.heartRate || 0;
	heartRateSensor.stop();
}

/** @function zoomIn
 * Zooms Out of a stat
 * @param {stat} stat Stat widget
 */
function zoomIn(stat) {
	let zoomed = document.getElementById('zoomed');

	zoomed.getElementById('icon').href = stat.getElementById('icon').href;
	console.log(`stat: ${stat.getElementById('zoomedDisplay').value}`);

	if (stat.getElementById('zoomedDisplay') == null || typeof stat.getElementById('zoomedDisplay').value === "undefined" || stat.getElementById('zoomedDisplay').value == "0") {
		zoomed.getElementById('text').text = stat.getElementById('text').text;
	} else {
		zoomed.getElementById('text').text = stat.getElementById('zoomedDisplay').value;
	}
	zoomed.getElementById('text').text = addCommas(zoomed.getElementById('text').text || 0);
	zoomed.getElementById('description').text = stat.getElementById('description').text;
	zoomed.style.display = "inline";
}

/** @function zoomOut
 * Zooms Out of a stat... Really just hides the zoom widget.
 */
function zoomOut() {
	document.getElementById('zoomed').style.display = "none";
}

/** @function bindEvents
 * Binds all of the events
 */
function bindEvents() {
	let zoomed = document.getElementById('zoomed');
	zoomed.getElementById('icon').onclick = zoomOut;
	zoomed.getElementById('text').onclick = zoomOut;
	zoomed.getElementById('description').onclick = zoomOut;
	bindAllStatClickEvents();
}

/** @function bindAllStatClickEvents
 * Calls bindStatClickEvent for all of the stat wdigets
 */
function bindAllStatClickEvents() {
	bindStatClickEvent(document.getElementById('battery'));
	bindStatClickEvent(document.getElementById('heartRate'));
	bindStatClickEvent(document.getElementById('stairs'));
	bindStatClickEvent(document.getElementById('distance'));
	bindStatClickEvent(document.getElementById('steps'));
	bindStatClickEvent(document.getElementById('calories'));
}

/** @function bindStatClickEvent
 * Binds the onclick of the text and icon
 */
function bindStatClickEvent(stat) {
	stat.getElementById('text').onclick = function () {
		zoomIn(stat)
	};
	stat.getElementById('icon').onclick = function () {
		zoomIn(stat)
	};
}


/*
 * Got from https://github.com/Fitbit/sdk-moment/blob/master/app/simple/activity.js
 */
function getDistance(today) {
	let val = (today.adjusted.distance || 0) / 1000;
	let u = "k";
	if (units.distance === "us") {
		val *= 0.621371;
		u = "m";
	}
	return {
		raw: val,
		pretty: `${val.toFixed(2)}${u}`
	}
}

/** @function listProperties
 * Lists all of the properties for a given object.
 */
function listProperties(object) {
	for (var key in object) {
		try {
			console.log('Key: ' + key + ' | value: ' + object[key]);
			// recursion breaks the simulator
			// if ( object[key] == '[object Object]') {
			//   listProperties(object[key], '    ' + key + '.');
			// }
		} catch (error) {
			// Some values throw an error when trying to access them.
			console.log('Key: ' + key + ' | Error: ' + error.message);
		}
	}
}

/** @function zeroPad
 * Add zero in front of numbers < 10
 * @param {number} number Number to add commas too.
 * @return {string} Returns the number with a leading zero (0)
 */
function zeroPad(number) {
	if (number < 10) {
		number = "0" + number;
	}
	return number;
}

/** @function addCommas
 * Adds commas to a number
 * @param {number} number Number to add commas too.
 * @return {string} Returns the number with commas.
 */
function addCommas(number) {
	return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/** @function addCommas
 * Adds commas to a number
 * @param {int} day Day of the week (1-7)
 * @return {string} The name day of the weekday.
 */
function dayOfWeek(day) {
	switch (day) {
		case 0:
			return 'Sun';
		case 1:
			return 'Mon';
		case 2:
			return 'Tue';
		case 3:
			return 'Wed';
		case 4:
			return 'Thu';
		case 5:
			return 'Fri';
		case 6:
			return 'Sat';
	}
}

/** @function addCommas
 * Convert a number to a special monospace number
 * @param {number} digits Day of the week (1-7)
 * @return {string} Returns special monospace number
 */
function monoDigits(digits) {
	var ret = "";
	var str = digits.toString();
	for (var index = 0; index < str.length; index++) {
		var num = str.charAt(index);
		ret = ret.concat(hex2a("0x1" + num));
	}
	return ret;
}

/** @function addCommas
 * Hex to string
 * @param {hex} hex HEX value
 * @return {string} Returns the hex value converted to a string
 */
// 
function hex2a(hex) {
	var str = '';
	for (var index = 0; index < hex.length; index += 2) {
		var val = parseInt(hex.substr(index, 2), 16);
		if (val) str += String.fromCharCode(val);
	}
	return str.toString();
}
