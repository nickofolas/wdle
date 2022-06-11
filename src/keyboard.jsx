import "./keyboard.css";
import React from "react";

// Map the available keys and their corresponding codes
const QWERTY_KEYS = [
  "Q",
  "W",
  "E",
  "R",
  "T",
  "Y",
  "U",
  "I",
  "O",
  "P",
  "A",
  "S",
  "D",
  "F",
  "G",
  "H",
  "J",
  "K",
  "L",
  "Z",
  "X",
  "C",
  "V",
  "B",
  "N",
  "M",
];

export function TouchKey({
  keyName,
  special = false,
  labelOverride = null,
  data: { usedChars = new Set(), word = "", submittedGuesses = [] } = {},
}) {
  let className = special ? "specialKey" : "";

  const char = keyName.toLowerCase();
  // This covers both when the character has not been used, as well
  // as when the data hasn't been provided
  if (usedChars.has(char)) {
    // If the character is in the word
    if (word.includes(char)) {
      // If it exactly matches the character in the word by position,
      if (
        submittedGuesses.some(
          (guess) => guess.indexOf(char) === word.indexOf(char)
        )
      ) {
        // Give it the green background color
        className += " wdleGuessGood";
      } else {
        // Otherwise, the orange background color
        className += " wdleGuessClose";
      }
    } else {
      // If it isn't in the word at all, give it the grey background color
      className += " wdleGuessBad";
    }
  } else {
    // If the key hasn't been used, give it the standard style
    className += " unusedKey";
  }

  return (
    <p
      className={`keyboardKey ${className}`}
      key={`key-${keyName}`}
      onClick={(_) => {
        // Dispatch a keydown event with the key as the event data
        window.dispatchEvent(new KeyboardEvent("keydown", { key: keyName }));

        // If the key is Enter, then dispatch another empty keydown event
        // to force the keyboard to re-render with the correct info
        if (keyName === "Enter") {
          Promise.resolve().then(() =>
            window.dispatchEvent(new KeyboardEvent("keydown", { key: " " }))
          );
        }
      }}
    >
      {labelOverride ?? keyName}
    </p>
  );
}

// data = { usedChars, word, submittedGuesses }
export function OnScreenKeyboard({ usedChars, word, submittedGuesses }) {
  const data = { usedChars, word, submittedGuesses };

  return (
    <div id="keyboardRoot">
      <div className="keyRow">
        {QWERTY_KEYS.slice(0, 10).map((key) => (
          <TouchKey keyName={key} data={data} />
        ))}
      </div>
      <div className="keyRow">
        {QWERTY_KEYS.slice(10, 19).map((key) => (
          <TouchKey keyName={key} data={data} />
        ))}
      </div>
      <div className="keyRow">
        <TouchKey keyName={"Enter"} special />
        {QWERTY_KEYS.slice(19, 26).map((key) => (
          <TouchKey keyName={key} data={data} />
        ))}
        <TouchKey labelOverride="⌫" keyName={"Backspace"} special />
      </div>
    </div>
  );
}
