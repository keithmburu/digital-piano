import Note from "tonal/note";
import { range, mixRGB } from "./utils";
import { getSetting } from "./settings";


const keyboardContainer = document.getElementById("keyboard");

const NOTE_RADIUS = 5;
const NOTE_WHITE_WIDTH = 40;
const NOTE_WHITE_HEIGHT = 150;
const NOTE_BLACK_WIDTH = 22;
const NOTE_BLACK_HEIGHT = 90;
const NOTE_TONIC_RADIUS = 5;
const NOTE_TONIC_BOTTOM_OFFSET = 30;
const NOTE_NAME_BOTTOM_OFFSET = 2;


const NOTE_WHITE_TEMPLATE = (props, posX, colorActive, colorModal) => {
  let keyname = "";
  if (!getSetting("hideKeyName")) {
    keyname = props.name;
  }
  return `\
<g id="note-${props.midi}" class="note white" transform="translate(${posX},0)" style="--colorActive: ${colorActive}; --colorModal: ${colorModal};">
  <rect class="piano-key" width="${NOTE_WHITE_WIDTH}" height="${NOTE_WHITE_HEIGHT+NOTE_RADIUS}" x="0" y="${-NOTE_RADIUS}" rx="${NOTE_RADIUS}" ry="${NOTE_RADIUS}"></rect>
  <circle class="piano-tonic" cx="${NOTE_WHITE_WIDTH/2}" cy="${NOTE_WHITE_HEIGHT-NOTE_TONIC_BOTTOM_OFFSET}" r="${NOTE_TONIC_RADIUS}"></circle>
  <text class="piano-key-name" x="${NOTE_WHITE_WIDTH/2}" y="${NOTE_WHITE_HEIGHT-NOTE_NAME_BOTTOM_OFFSET}" text-anchor="middle">${keyname}</text>
</g>`
};

const NOTE_BLACK_TEMPLATE = (props, posX, colorActive, colorModal) => `\
<g id="note-${props.midi}" class="note black" transform="translate(${posX - NOTE_BLACK_WIDTH/2},0)" style="--colorActive: ${colorActive}; --colorModal: ${colorModal};">
  <rect class="piano-key" width="${NOTE_BLACK_WIDTH}" height="${NOTE_BLACK_HEIGHT+NOTE_RADIUS}" x="0" y="${-NOTE_RADIUS}" rx="${NOTE_RADIUS}" ry="${NOTE_RADIUS}"></rect>
  <circle class="piano-tonic" cx="${NOTE_BLACK_WIDTH/2}" cy="${NOTE_BLACK_HEIGHT-NOTE_TONIC_BOTTOM_OFFSET}" r="${NOTE_TONIC_RADIUS}"></circle>
</g>`;

const KEYBOARD_TEMPLATE = (keyboardNotes) => `\
<svg width="100%" viewBox="0 0 ${keyboardNotes.width} ${keyboardNotes.height}" version="1.1" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="insetKey">                                                            <!-- source: https://www.xanthir.com/b4Yv0 -->
      <feOffset dx="0" dy="-7"/>                                                          <!-- Shadow Offset -->
      <feGaussianBlur stdDeviation="5" result="offset-blur"/>                            <!-- Shadow Blur -->
      <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse"/> <!-- Invert the drop shadow to create an inner shadow -->
      <feFlood flood-color="black" flood-opacity="0.4" result="color"/>                   <!-- Color & Opacity -->
      <feComposite operator="in" in="color" in2="inverse" result="shadow"/>               <!-- Clip color inside shadow -->
      <feComponentTransfer in="shadow" result="shadow">                                   <!-- Shadow Opacity -->
        <feFuncA type="linear" slope="5"/>
      </feComponentTransfer>
      <feBlend mode="soft-light" in="shadow" in2="SourceGraphic"/>                        <!-- Put shadow over original object -->
    </filter>
    <linearGradient id="whiteKey" gradientTransform="rotate(90)">
      <stop offset="0%"  stop-color="#bbbbbb" />
      <stop offset="8%"  stop-color="#eeeeee" />
      <stop offset="90%" stop-color="#ffffff" />
      <stop offset="91%" stop-color="#eeeeee" />
    </linearGradient>
    <linearGradient id="blackKey" gradientTransform="rotate(90)">
      <stop offset="0%"  stop-color="#000000" />
      <stop offset="16%" stop-color="#222222" />
      <stop offset="80%" stop-color="#444444" />
      <stop offset="80.5%" stop-color="#aaaaaa" />
      <stop offset="85%" stop-color="#222222" />
      <stop offset="91%" stop-color="#000000" />
    </linearGradient>
  </defs>
  <g id="board" transform="translate(0,0)">
    <rect id="keyboard-bg" width="${keyboardNotes.width}" height="${keyboardNotes.height}" x="0" y="0" />
    ${keyboardNotes.markup}
    <rect id="board-border" width="${keyboardNotes.width}" height="${keyboardNotes.height}" x="0" y="0" />
  </g>
</svg>
`;


function getNoteMarkup(noteNumber, offsetX, colorActiveWhite, colorActiveBlack, colorModalWhite, colorModalBlack) {
  const note = Note.fromMidi(noteNumber, { sharps: true });
  const props = Note.props(note);

  if (props.alt) {
    return {
      width: 0,
      isWhite: false,
      markup: NOTE_BLACK_TEMPLATE(props, offsetX, colorActiveBlack, colorModalBlack),
    }
  }

  return {
    width: NOTE_WHITE_WIDTH,
    isWhite: true,
    markup: NOTE_WHITE_TEMPLATE(props, offsetX, colorActiveWhite, colorModalWhite),
  }
}

export function generateKeyboard(from, to, colorActiveWhite = "#bf3a2b", colorActiveBlack = "#bf3a2b", colorModalWhite = "#076afe", colorModalBlack = "#076afe") {
  const fromProps = Note.props(Note.simplify(from));
  const toProps = Note.props(Note.simplify(to));

  const lowestNote = (
    fromProps.name && fromProps.midi
    ? fromProps.alt
      ? fromProps.midi - 1
      : fromProps.midi
    : Note.midi("C3")
  );

  const highestNote = (
    toProps.name && toProps.midi
    ? toProps.alt
      ? toProps.midi + 1
      : toProps.midi
    : Note.midi("C5")
  );
  
  const start = Math.min(lowestNote, highestNote);
  const end = Math.max(lowestNote, highestNote);

  const keyboardNotes = range(start, end).reduce(
    (keyboard, noteNumber) => {
      const { width, isWhite, markup } = getNoteMarkup(noteNumber, keyboard.width, colorActiveWhite, colorActiveBlack, colorModalWhite, colorModalBlack);
      return {
        width: keyboard.width + width,
        height: keyboard.height,
        markup: isWhite
        ? markup + keyboard.markup
        : keyboard.markup + markup,
      }
    }, { width: 0, height: NOTE_WHITE_HEIGHT, markup: ''}
  );
  
  return KEYBOARD_TEMPLATE(keyboardNotes);
}

export function render() {
  const lowestNote = getSetting("lowestNote");
  const highestNote = getSetting("highestNote");
  const colorActive = getSetting("colorActive");
  const colorModal = getSetting("colorModal");
  const colorActiveWhite = mixRGB(colorActive, "#ffffff", 0.4);
  const colorActiveBlack = colorActive;
  const colorModalWhite = mixRGB(colorModal, "#ffffff", 0.4);
  const colorModalBlack = colorModal;

  keyboardContainer.innerHTML = generateKeyboard(lowestNote, highestNote, colorActiveWhite, colorActiveBlack, colorModalWhite, colorModalBlack);
}
