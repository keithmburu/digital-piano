import { render } from "./ui";
import qs from "qs";

const DEFAULT_SETTINGS = {
  lowestNote: "C3",
  highestNote: "B4",
  sustain: false,
  chordal: false,
  extensions: false,
  arpeggio: false,
  effect: "None",
  solfege: "None",
  key: "C",
  modeOptions: "None",
  highlight: "None",
  play: "None",
  highlightPlay: "None",
  colorActive: "#bf3a2b",
  colorModal: "#0751fe",
  hideNotes: false,
  hideChord: false,
  hideBassNote: false,
  hideKeyName: false,
  hideTonic: false,
};

let customSettings = {}; 

export function getSetting(name) {
  return customSettings[name] !== undefined ? customSettings[name] : DEFAULT_SETTINGS[name]; 
}

export function setSetting(name, value) {
  customSettings[name] = value;
  saveQueryParams();
}

function qsValueDecoder(str, decoder, charset) {
  if (!Number.isNaN(Number(str))) return Number(str);
  if (str === "true") return true;
  if (str === "false") return false;

  // https://github.com/ljharb/qs/blob/master/lib/utils.js
  let strWithoutPlus = str.replace(/\+/g, ' ');
  if (charset === "iso-8859-1") {
      // unescape never throws, no try...catch needed:
      return strWithoutPlus.replace(/%[0-9a-f]{2}/gi, unescape);
  }
  // utf-8
  try {
    return decodeURIComponent(strWithoutPlus);
  } catch (e) {
    return strWithoutPlus;
  }
};

function parseQueryParams() {
  const newSettings = qs.parse(window.location.search, { depth: 0, parseArrays: false, ignoreQueryPrefix: true, decoder: qsValueDecoder })
  Object.assign(customSettings, newSettings);
}

function saveQueryParams() {
  const queryParams = qs.stringify(customSettings, { addQueryPrefix: true });
  window.history.pushState(customSettings, "settings update", queryParams);
} 

function onSettingChange(setting, evt) {
  const { target } = evt; 

  let oldModeOption;
  if (setting == "modeOptions") {
    oldModeOption = getSetting(setting);
  }

  if (target.type === "checkbox") {
    setSetting(setting, !!target.checked);
    if (setting === "chordal") {
      document.getElementById("playOption").disabled = !getSetting("chordal");
      document.getElementById("highlightPlayOption").disabled = !getSetting("chordal");
      if (!getSetting("chordal") && (getSetting("modeOptions") === "play" || getSetting("modeOptions") === "highlightPlay")) {
        document.getElementById(getSetting("modeOptions")+"Label").style = "visibility: hidden; height: 0;"
        document.getElementById("modeOptions").value = "highlight";
        setSetting("modeOptions", "highlight");
        document.getElementById("highlightLabel").style = "visibility: visible; height: auto;"
        document.getElementById("highlight").value = document.getElementById("highlight").value;
        setSetting("highlight", document.getElementById("highlight").value);
      }
    }
  }

  if(target.type === "text" || target.type === "color" || target.type === "select-one") {
    if (setting === "modeOptions") {
      if (oldModeOption !== "None") {
        document.getElementById(oldModeOption+"Label").style = "visibility: hidden; height: 0;"
      }
      if (getSetting("chordal")) {
        setSetting(setting, target.value);
      }
    }
    setSetting(setting, target.value);
  }

  if (setting === "modeOptions") {
    if (getSetting("modeOptions") !== "None") {
      document.getElementById(getSetting("modeOptions")+"Label").style = "visibility: visible; height: auto;";
      setSetting(getSetting("modeOptions"), document.getElementById(getSetting("modeOptions")).value);
    }
  }

  render();
}

export function initSettings() {
  parseQueryParams()

  for (const setting of Object.keys(DEFAULT_SETTINGS)) {
    const element = document.getElementById(setting);
    if (element.type === "checkbox") {
      element.checked = getSetting(setting);
    }
    if (element.type === "text" || element.type === "color" || element.type === "select-one") {
      element.value = getSetting(setting);
    }
     
    element.addEventListener("input", onSettingChange.bind(null, setting));
  }
}
