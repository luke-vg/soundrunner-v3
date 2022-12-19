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
let button1 = document.getElementById("med-button");
let button2 = document.getElementById("start-button");
let button3 = document.getElementById("startbutton");
let button4 = document.getElementById("heavy-button");
let backBtn = document.getElementById("backbtn");
let quitBtn = document.getElementById("quit-btn");

// Vars to enable heart rate calculations
let hrmoderate = document.getElementById("hr-moderate");
let age = 50;
let hrLow = 0;
let hrHigh = 0;
let hrLowHeavy = 0;
let hrHighHeavy = 0;
var workoutHeavy = false;

const sensors = [];

// Detect onclick for different buttons
button1.onclick = function() {
  workoutHeavy = false;
  showScreen2();
  calculateIdealHeartRate();
}

button2.onclick = function() {
  showHeartRate();
}

button4.onclick = function () {
  workoutHeavy = true;
  showScreen2();
  calculateIdealHeartRate();
}

backBtn.onclick = function () {
  firstScreen.style.display = "inline";
  secondScreen.style.display = "none";
}

quitBtn.onclick = function () {
  hrmoderate.style.display = "none";
  firstScreen.style.display = "inline";
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
  }

} 

// Calculate the ideal heart rate range based on age and type of workout
function calculateIdealHeartRate() {
hrLow = Math.round((220 - age) * 0.64);
hrHigh = Math.round((220 - age) * 0.74);
hrLowHeavy = Math.round((220 - age) * 0.77);
hrHighHeavy = Math.round((220 - age) * 0.93);
  
if (workoutHeavy === true){
hrLow = hrLowHeavy;
hrHigh = hrHighHeavy;
}
  
//console.log("Based on your age, "+ age + ", your heart rate for moderate workouts should be between " + hrLow + " and " + hrHigh);
document.getElementById("advice").text = ("Based on your age, "+ age + ", your heart rate for this workout should be between " + hrLow + " and " + hrHigh + ".");
// console.log("Based on your age, "+ age + ", your heart rate for moderate workouts should be between " + hrLow + " and " + hrHigh + ".");
// console.log("Based on your age, " + age + ", your heart rate for heavy workouts should be between " + hrLowHeavy + " and " + hrHighHeavy + ".");
}

// Switch to screen 2
function showScreen2() {
  secondScreen.style.display = "inline";
  firstScreen.style.display = "none";
}

// Start workout and show heart rate
function showHeartRate() {
  hrmoderate.style.display = "inline";
  button3.style.display = "none";
  calculateIdealHeartRate();
  mainLoop();
}

// Start heart rate sensor and push results to the interface
if (HeartRateSensor) {
  const hrm = new HeartRateSensor({ frequency: 1 });
  hrm.addEventListener("reading", () => {
    hrmDataInt = hrm.heartRate;
    hrText.text = hrmDataInt;
    // Old code for pushing HR data to the home screen
    
    //console.log(hrmDataInt)
    // hrmData.text = JSON.stringify({
    //   heartRate: hrm.heartRate ? hrm.heartRate : 0
    // });
    // hrmData2.text = JSON.stringify({
    //   heartRate: hrm.heartRate ? hrm.heartRate : 0
    // });
  });
  sensors.push(hrm);
  hrm.start();

} else {
  hrmLabel.style.display = "none";
  hrmData.style.display = "none";
}

// Main function loop, to be executed every 300 ms
function mainLoop() {
setInterval(() => {
  wristCheck(); 
  
  if (onWrist == true) {
    
  // Let user know that the heart rate is too low
  if (hrmDataInt < hrLow) {
    document.getElementById("test").style.fill = 'orange';
    vibration.stop();
    vibration.start("bump");
    warningField.text = ("Your heart rate is too low.");
}
  
  // Let user know that the heart rate is too high
else if (hrmDataInt > hrHigh) {
  document.getElementById("test").style.fill = 'red';
  vibration.stop();
  vibration.start("alert");
  warningField.text = ("Your heart rate is too high.");
}
  
  // Heart rate is in ideal range
else if (hrmDataInt => hrLow && hrmDataInt <= hrHigh) {
  document.getElementById("test").style.fill = 'black';
  vibration.stop();
  warningField.text = ("Your heart rate is perfect!");
  
  // Catch for errors
} else {
  document.getElementById("test").style.fill = 'purple';
  vibration.stop();
  warningField.text = ("An error has occured, please restart.");
  }
  
    // Watch is not on wrist
} else {
  hrText.text = ("");
  document.getElementById("test").style.fill = 'black';
  warningField.text = ("Your watch is not on your wrist.");
  vibration.stop();
}
}, 500);
 
// Detect display status  
display.addEventListener("change", () => {
  // Automatically stop all sensors when the screen is off to conserve battery
  display.on ? sensors.map(sensor => sensor.start()) : sensors.map(sensor => sensor.stop());
  });
}

// Listen for changes in values for the companion app, to read age, then execute heart rate calculation
messaging.peerSocket.addEventListener("message", (evt) => {
  age = evt.data.value.name;
  calculateIdealHeartRate();
   }
)

