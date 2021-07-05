import * as tools from './tools.js';
import * as sm from './settings-manager.js';
import {me as device} from 'device';
import clock from "clock";
import document from "document";
import {preferences, units} from "user-settings";
import {battery} from "power";
import {charger} from "power";
import {settings} from './settings.js'
import {HeartRateSensor} from "heart-rate";
import {today} from 'user-activity';
import {display} from "display";

clock.granularity = "seconds";

// Get a handle on the <text> element
const time = document.getElementById('time');
const batteryText = document.getElementById('battery').getElementById("text");
const batteryIcon = document.getElementById('battery').getElementById("icon");
const date = document.getElementById('date');
const heartRate = document.getElementById('heartRate').getElementById('text');
const heartRateSensor = new HeartRateSensor();
const distance = document.getElementById('distance').getElementById('text');
const sleepMode = document.getElementById('sleepmode');

const steps = document.getElementById('steps').getElementById("text");
const stepsZoomedDisplay = document.getElementById('steps').getElementById('zoomedDisplay');

const stairs = document.getElementById('stairs').getElementById('text');
const stairsZoomedDisplay = document.getElementById('stairs').getElementById('zoomedDisplay');

const calories = document.getElementById('calories').getElementById('text');
const caloriesZoomedDisplay = document.getElementById('calories').getElementById('zoomedDisplay');

// const weather_uuid = '000013fe-0000-4000-8000-000000f17b17'

var zoomedStat = null;
let appSettings = new settings();
appSettings.load();
console.log(appSettings.toString());

bindEvents()

sm.setupMessaging(appSettings);

if (device.modelName === "Ionic") {
	document.getElementById('time').y = 230;
	document.getElementById('date').style.display = "none";
}

clock.ontick = (evt) => {	
	//console.log('OnTick');
	heartRateSensor.start();
	let currentDate = evt.date;
	let hours = currentDate.getHours();

	hours = preferences.clockDisplay === '12h' ? hours % 12 || 12 : tools.zeroPad(hours);
	date.text = `${tools.dayOfWeek(currentDate.getDay())} ${currentDate.getMonth()+1}/${currentDate.getDate()}/${currentDate.getFullYear().toString().substring(2)}`;
	time.text = `${tools.monoDigits(hours)}:${tools.monoDigits(tools.zeroPad(currentDate.getMinutes()))}:${ tools.monoDigits(tools.zeroPad(currentDate.getSeconds()))}`;
	batteryText.text = `${Math.floor(battery.chargeLevel)}%`;
	distance.text = getDistance(today).pretty;
	
	batteryIcon.style.display = charger.connected ? 'none' : 'inline';

	steps.text = formatNumber(today.local.steps);
	stepsZoomedDisplay.value = tools.addCommas(today.local.steps || 0);

	stairs.text = tools.addCommas(today.adjusted.elevationGain || 0);
	stairsZoomedDisplay.value = stairs.text;

	calories.text = today.local.calories;
	caloriesZoomedDisplay.value = tools.addCommas(today.local.calories || 0);

	if (zoomedStat != null) {
		zoomIn(zoomedStat);
	}

	if (appSettings.isItSleepTime()) {
		// console.log(`appSettings.sleepModeEnabled = ${appSettings.sleepModeEnabled} | appSettings.sleepModeStartTime = ${appSettings.sleepModeStartTime} | appSettings.sleepModeEndTime = ${appSettings.sleepModeEndTime}`);
		sleepMode.getElementById('time').text = time.text;
		sleepMode.getElementById('date').text = date.text;
		
		sleepMode.style.display = "inline";

		if (sleepMode.getElementById('time').onclick == null) {
			sleepMode.getElementById('time').onclick = function (evt) {
				appSettings.manualSleepModeOn = false;
			};
		}

	} else {
		if (sleepMode.style.display != "none") {
			sleepMode.style.display = "none";
			sleepMode.getElementById('time').onclick = null;
		}
	}
}

heartRateSensor.onreading = function () {
	heartRate.text = heartRateSensor.heartRate || 0;
	heartRateSensor.stop();
}

/** @function formatNumber
 * Zooms Out of a stat
 * @param {int} value Number to format
 */
function formatNumber(value) {
	return value > 10000 ? (Math.round((value / 100)) / 10) + 'k' : tools.addCommas(value);
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
	if (zoomed.style.display != "inline") {
		zoomed.style.display = "inline";
	}
}

/** @function bindEvents
 * Binds all of the events
 */
function bindEvents() {
	let zoomed = document.getElementById('zoomed');
	zoomed.getElementById('icon').onclick = zoomOut;
	zoomed.getElementById('text').onclick = zoomOut;
	zoomed.getElementById('description').onclick = zoomOut;

	display.onchange = function () {
		if (display.on) {
			console.log("Screen Turned On");
		} else {
			zoomOut();
		}
	}

	time.onclick = function () {
		appSettings.manualSleepModeOn = true;
	};

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
	stat.getElementById('text').onclick = function () { performZoom(stat); };
	stat.getElementById('icon').onclick = function () {	performZoom(stat); };
}

/** @function performZoom
 * Zooms in on a stat.
 */
function performZoom(stat) {
	zoomedStat = stat;
	zoomIn(stat);
}

/** @function zoomOut
 * Zooms Out of a stat... Really just hides the zoom widget.
 */
 function zoomOut() {
	zoomedStat = null;
	document.getElementById('zoomed').style.display = "none";
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
		pretty: `${val.toFixed(1)}${u}`
	}
}
