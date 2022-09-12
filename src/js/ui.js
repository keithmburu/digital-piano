import Note from "tonal/note";
import { range } from "./utils";
import { getSetting } from "./settings";
import { render as renderKeyboard } from "./keyboard";
import Midi from "@tonaljs/midi";
import { modalChords } from "./keypress";

const LAYOUT_SETTINGS = ["hideKeyboard", "hideNotes", "hideChord", "hideBassNote", "hideKeyName", "hideTonic"];

const appContainer = document.getElementById("app");
const chordDisplay = document.getElementById("chord");
const notesDisplay = document.getElementById("notes");

export function highlightDiatonicNotes(key) {
  let newKey = key;
  let mode = "diatonicMajor";
  if (key.slice(key.length-1, key.length) == 'm') {
    newKey = key.slice(0, key.length-1);
    mode = "diatonicMinor";
  } 
  let tonic = newKey + "0";
  highLightNotes(tonic, mode);
}

export function highlightPentatonicNotes(key) {
  let newKey = key;
  let mode = "MajorPentatonic";
  if (key.slice(key.length-1, key.length) == 'm') {
    newKey = key.slice(0, key.length-1);
    mode = "minorPentatonic";
  } 
  let tonic = newKey + "0";
  highLightNotes(tonic, mode);
}

export function highlightBluesNotes(key) {
  let newKey = key;
  let mode = "MajorBlues";
  console.log(key.slice(key.length-1, key.length));
  if (key.slice(key.length-1, key.length) == 'm') {
    newKey = key.slice(0, key.length-1);
    mode = "minorBlues";
  } 
  let tonic = newKey + "0";
  highLightNotes(tonic, mode);
}

export function highlightNote(noteNumber, className = "active") {
  const keyElement = document.getElementById(`note-${noteNumber}`);
  if (!keyElement) return;

  if (className === "active") {
    let classList = Array.from(keyElement.classList);
    if (classList.includes("modal")) {
      keyElement.classList.remove("modal");
      keyElement.classList.add("modal-active");
    }
  }

  keyElement.classList.add(className);
}

export function highLightNotes(tonic, mode) {
  let tonic_midi = Midi.toMidi(tonic);
  let lowestNote = getSetting("lowestNote");
  let highestNote = getSetting("highestNote");
  let firstMidi = Midi.toMidi(lowestNote);
  let lastMidi = Midi.toMidi(highestNote);
  for (let noteNumber = firstMidi; noteNumber <= lastMidi; noteNumber++) {
    if (-(tonic_midi - noteNumber) % 12 in modalChords[mode]) {
        highlightNote(noteNumber, "modal");
    }
  }
}

export function fadeNote(noteNumber) {
  const keyElement = document.getElementById(`note-${noteNumber}`);
  if (!keyElement) return;

  let classList = Array.from(keyElement.classList);
  if (classList.includes("modal-active")) {
    keyElement.classList.remove("modal-active");
    keyElement.classList.add("modal");
  }

  keyElement.classList.remove("active");
}

export function highlightTonic(tonic) {
  const notes = range(0,10).map(oct => Note.midi(`${tonic}${oct}`));

  for (const note of notes) {
    highlightNote(note, "tonic");
  }
}

export function fadeTonics() {
  const elements = document.querySelectorAll(".tonic");

  if (elements && elements.length) {
    for (const element of elements) {
      element.classList.remove("tonic");
    }
  }
}

export function setChordHtml(html) {
  chordDisplay.innerHTML = html;
}

export function setNotesHtml(html) {
  notesDisplay.innerHTML = html;
}

export function setLayoutSettings() {
  for (const setting of LAYOUT_SETTINGS) {
    const value = getSetting(setting);

    if (value) {
      appContainer.classList.add(setting);
    } else {
      appContainer.classList.remove(setting);
    }
  }  
}

export function setAppLoaded(message) {
  appContainer.classList.add("loaded");
}

export function setAppError(message) {
  appContainer.classList.add("error");
  setChordHtml("Error");
  setNotesHtml(message);
}

export function render() {
  setLayoutSettings();
  renderKeyboard();
  let modeOption = getSetting("modeOptions");
  document.getElementById("playOption").disabled = !getSetting("chordal");
  document.getElementById("highlightPlayOption").disabled = !getSetting("chordal");
  let highlight;
  if (modeOption != "play") {
    highlight = getSetting(modeOption)
  }
  const key = getSetting("key");
  if (highlight == "Diatonic") {
    console.log("diatonicn");
    highlightDiatonicNotes(key);
  } else if (highlight == "Pentatonic") {
    console.log("pent");
    highlightPentatonicNotes(key);
  } else if (highlight == "Blues") {
    console.log("bl");
    highlightBluesNotes(key);
  } 
}
