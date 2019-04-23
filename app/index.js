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

import {
	display
} from "display";

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
		hours = tools.zeroPad(hours);
	}

	date.text = `${tools.dayOfWeek(currentDate.getDay())} ${currentDate.getMonth()+1}/${currentDate.getDate()}/${currentDate.getFullYear().toString().substring(2)}`;
	time.text = `${tools.monoDigits(hours)}:${tools.monoDigits(tools.zeroPad(currentDate.getMinutes()))}:${ tools.monoDigits(tools.zeroPad(currentDate.getSeconds()))}`;
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

	stairs.text = tools.addCommas(today.adjusted.elevationGain || 0);
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


	if (stat.getElementById('zoomedDisplay') == null || typeof stat.getElementById('zoomedDisplay').value === "undefined" || stat.getElementById('zoomedDisplay').value == "0") {
		zoomed.getElementById('text').text = stat.getElementById('text').text;
	} else {
		zoomed.getElementById('text').text = stat.getElementById('zoomedDisplay').value;
	}
	zoomed.getElementById('text').text = tools.addCommas(zoomed.getElementById('text').text || 0);
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

	display.onchange = function () {
		if (display.on) {
			console.log("Screen Turned On");
		} else {
			zoomOut();
			console.log("Screen Turned Off");
		}
	}
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
