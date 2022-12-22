import * as document from "document";
import * as messaging from "messaging";

// import all sensors
import { BodyPresenceSensor } from "body-presence";
import { display } from "display";
import { HeartRateSensor } from "heart-rate";
import { vibration } from "haptics";

// Refer to heart rate data labels
const hrmLabel = document.getElementById("hrm-label");
const hrmData = document.getElementById("hrm-data");
const hrmData2 = document.getElementById("hrm-data2");
const hrmDataInt = 0;
const hrText = document.getElementById("hr-text")
const warningField = document.getElementById("warning-field")

//Body sensor vars
var onWrist = false;

// All other elements
let firstScreen = document.getElementById("screen1");
let secondScreen = document.getElementById("screen2");
let hrScreen = document.getElementById("hr-screen");
let medBtn = document.getElementById("med-button");
let startBtn = document.getElementById("startbutton");
let heavyBtn = document.getElementById("heavy-button");
let backBtn = document.getElementById("backbtn");
let quitBtn = document.getElementById("quit-btn");

// Vars to enable heart rate calculations
let age = 50;
let hrLow = 0;
let hrHigh = 0;
let hrLowHeavy = 0;
let hrHighHeavy = 0;
var workoutHeavy = false;
var loopInterval;

const sensors = [];

// Onclick detectors
medBtn.onclick = function() {
  workoutHeavy = false;
  showScreen2();
  calculateIdealHeartRate();
}

startBtn.onclick = function() {
  hrScreen.style.display = "inline";
  calculateIdealHeartRate();
  mainLoop();
  hrScreen.animate("enable");
}

heavyBtn.onclick = function () {
  workoutHeavy = true;
  showScreen2();
  calculateIdealHeartRate();
}

backBtn.onclick = function () {
  secondScreen.style.display = "none";
  display.autoOff = true;
}

quitBtn.onclick = function () {
  quitBtnHandler();
}

// Start body presence sensor to detect if the Fitbit is on users wrist
if (BodyPresenceSensor) {
  const bodyPresence = new BodyPresenceSensor();
  bodyPresence.addEventListener("reading", () => {
  });
  bodyPresence.start();
}

// Check for on wrist
function wristCheck() {
  if (bodyPresence.present == true) {
    onWrist = true;
  } else {
    onWrist = false;
    display.autoOff = true;
  }
} 

// Calculate the ideal heart rate range based on age and type of workout
function calculateIdealHeartRate() {
  hrLow = Math.round((220 - age) * 0.64);
  hrHigh = Math.round((220 - age) * 0.74);
  hrLowHeavy = Math.round((220 - age) * 0.77);
  hrHighHeavy = Math.round((220 - age) * 0.93);
  
  if (workoutHeavy === true) {
    hrLow = hrLowHeavy;
    hrHigh = hrHighHeavy;
  }
  
  document.getElementById("advice").text = ("Based on your age, "+ age + ", your heart rate should be between " + hrLow + " and " + hrHigh + ".");
}

// Buttonclick handlers
function showScreen2() {
  secondScreen.style.display = "inline";
  secondScreen.animate("enable");
}

function quitBtnHandler() {
  hrScreen.animate("disable");
  hrScreen.style.display = "none";
  secondScreen.style.display = "none";
  clearInterval(loopInterval);
  display.autoOff = true;  
}

// Start heart rate sensor and push results to the interface
if (HeartRateSensor) {
  const hrm = new HeartRateSensor({ frequency: 1 });
  hrm.addEventListener("reading", () => {
    hrmDataInt = hrm.heartRate;
    hrText.text = hrmDataInt;
  });
  sensors.push(hrm);
  hrm.start();

} else {
  hrmLabel.style.display = "none";
  hrmData.style.display = "none";
}

// Main function loop, to be executed every 300 ms
function mainLoop() {
  loopInterval = setInterval(() => {
    wristCheck(); 
    if (onWrist == true) {
    
      // Let user know that the heart rate is too low
      if (hrmDataInt < hrLow) {
        document.getElementById("test").style.fill = 'orange';
        vibration.stop();
        vibration.start("bump");
        warningField.text = ("Your heart rate is too low.");
        display.autoOff = false;
      }
  
      // Let user know that the heart rate is too high
      else if (hrmDataInt > hrHigh) {
        document.getElementById("test").style.fill = 'red';
        vibration.stop();
        vibration.start("alert");
        warningField.text = ("Your heart rate is too high.");
        display.autoOff = false;
      }
  
      // Heart rate is in ideal range
      else if (hrmDataInt => hrLow && hrmDataInt <= hrHigh) {
        document.getElementById("test").style.fill = 'black';
        vibration.stop();
        warningField.text = ("Your heart rate is perfect!");
        display.autoOff = true;
  
      // Catch for errors
      } else {
          document.getElementById("test").style.fill = 'purple';
          vibration.stop();
          warningField.text = ("An error has occured, please restart.");
          display.autoOff = true;
      }
  
    // Watch is not on wrist
    } else {
       hrText.text = ("");
       document.getElementById("test").style.fill = 'black';
      warningField.text = ("Your watch is not on your wrist.");
      vibration.stop();
      hrmDataInt = hrLow;
      display.autoOff = true;
      return;
    }
  }, 500);
 
// Detect display status  
display.addEventListener("change", () => {
  // Automatically stop all sensors when the screen is off to conserve battery
  display.on ? sensors.map(sensor => sensor.start()) : sensors.map(sensor => sensor.stop());
  });
  return;
}

// Listen for changes in values for the companion app, to read age, then execute heart rate calculation
messaging.peerSocket.addEventListener("message", (evt) => {
  age = evt.data.value.name;
  calculateIdealHeartRate();
   }
)