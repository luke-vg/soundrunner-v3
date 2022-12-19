import { settingsStorage } from "settings";
import * as messaging from "messaging";
import { me as companion } from "companion";

settingsStorage.addEventListener("change", (evt) => {
  sendValue(evt.key, evt.newValue);
});

function sendValue(key, val) {
  if (val) {
    sendSettingData({
      key: key,
      value: JSON.parse(val),
    });
  }
}
function sendSettingData(data) {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send(data);
  } else {
    console.log("No peerSocket connection");
  }
}