/*
 * Credit:
 * gauntlet-silver.png & gauntlet-gold.png 
 * 	https://zelda.gamepedia.com/Gauntlets
 * 	https://zelda.gamepedia.com/File:OoT3D_Silver_Gauntlets_Icon.png
 * 	Here's hoping it does not violate copyright.
 * 	The only change to the image was with the file name.
 * stairs.png
 * 	The stairs was cut out of the image from https://kotaku.com/final-fantasy-speedrun-includes-28-minutes-of-walking-u-1686278555
 * boots.png
 * 	The boots was grabbed from http://zelda.wikia.com/wiki/File:Pegasus_Boots_(Four_Swords_Adventures).png
 * boots-pegasus.png
 * 	Was cut from the https://blueamnesiac.deviantart.com/art/ALBW-Pegasus-Boots-421159045
 * heart.png
 * from http://zelda.wikia.com/wiki/File:Heart_Container_(Majora%27s_Mask).png
 * wall.png (middlewallupdated.png)
 * from https://drunkenzebrastudio.wordpress.com/2011/12/11/belated-environments/
 */


import clock from "clock";
import document from "document";
import {
	preferences
} from "user-settings";
import {
	units
} from "user-settings";
import {
	battery
} from "power";
import {
	charger
} from "power";
import * as tools from 'tools.js';
import {
	HeartRateSensor
} from "heart-rate";
import {
	today
} from 'user-activity';


// Update the clock every minute
// clock.granularity = "minutes";
clock.granularity = "seconds";

// Get a handle on the <text> element
const time = document.getElementById("time");
const batteryText = document.getElementById('battery').getElementById("text");
const batteryIcon = document.getElementById('battery').getElementById("icon");
const date = document.getElementById('date');
const steps = document.getElementById('steps').getElementById("text");
const heartRate = document.getElementById('heartRate').getElementById('text');
const heartRateSensor = new HeartRateSensor();
const distance = document.getElementById('distance').getElementById('text');
const stairs = document.getElementById('stairs').getElementById('text');
bindEvents()
bindAllStatClickEvents();


clock.ontick = (evt) => {
	heartRateSensor.start();
	let currentDate = evt.date;
	let hours = currentDate.getHours();
	if (preferences.clockDisplay === "12h") {
		hours = hours % 12 || 12;
	} else {
		hours = tools.zeroPad(hours);
	}
	time.text = `${tools.monoDigits(hours)}:${tools.monoDigits(tools.zeroPad(currentDate.getMinutes()))}:${ tools.monoDigits(tools.zeroPad(currentDate.getSeconds()))}`;

	batteryText.text = `${Math.floor(battery.chargeLevel)}%`;
	// batteryIcon.href = './resourses/images/' + (charger.connected ? 'gauntlet-gold.png' : 'gauntlet-silver.png');

	if (charger.connected) {
		batteryIcon.href = './resourses/images/gauntlet-gold.png';
	} else {
		batteryIcon.href = './resources/images/gauntlet-silver.png';
	}
	date.text = `${tools.dayOfWeek(currentDate.getDay())} ${currentDate.getMonth()+1}/${currentDate.getDate()}/${currentDate.getFullYear().toString().substring(2)}`;

	// steps.text = today.local.steps;
	// tools.listProperties(today);
	steps.text = tools.addCommas(today.local.steps || 0);
	distance.text = getDistance(today).pretty;
	stairs.text = tools.addCommas(today.adjusted.elevationGain || 0);
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
	zoomed.getElementById('text').text = stat.getElementById('text').text;
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
	// zoomed.getElementById('box').onclick = zoomOut;
	zoomed.getElementById('icon').onclick = zoomOut;
	zoomed.getElementById('text').onclick = zoomOut;
	zoomed.getElementById('description').onclick = zoomOut;
	// zoomed.getElementById('wallpaper').onclick = zoomOut;
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
}

/** @function bindStatClickEvent
 * Binds the onclick of the text, icon and box
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