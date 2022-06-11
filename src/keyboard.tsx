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

interface KeyParams {
  keyName: string;
  special?: boolean;
  labelOverride?: string;

  data?: Partial<KeyboardDataParams>;
}

export function TouchKey({
  keyName,
  special = false,
  labelOverride = undefined,
  data: {
    usedChars = new Set<string>(),
    word = "",
    submittedGuesses = [],
  } = {},
}: KeyParams) {
  let className = special ? "specialKey" : "";

  const char = keyName.toLowerCase();
  // This covers both when the character has not been used, as well
  // as when the data hasn't been provided
  if (usedChars.has(char)) {
    // If the character is in the word
    if (word.includes(char)) {
      // A set of all characters which match exactly
      const exactMatches = new Set(
        submittedGuesses.flatMap((guess) =>
          [...guess].filter(
            (guessChar, idx) => guess[idx] === word[idx] && guessChar
          )
        )
      );

      // If the character is in the set of exact matches,
      if (exactMatches.has(char)) {
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

interface KeyboardDataParams {
  usedChars: Set<string>;
  word: string;
  submittedGuesses: string[];
  done: boolean;
}

export function OnScreenKeyboard({
  usedChars,
  word,
  submittedGuesses,
  done,
}: KeyboardDataParams) {
  const data = { usedChars, word, submittedGuesses };

  return (
    <div id="keyboardRoot" className={done ? "completed" : ""}>
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
