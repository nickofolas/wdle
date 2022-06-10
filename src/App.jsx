import "./App.css";
import React, { useRef, useEffect, useState } from "react";
import wordData from "./data/words_list.json";
import validWords from "./data/valid_words_list.json";

// Taken from stackoverflow
function useEventListener(eventName, handler, element = window) {
  const savedHandler = useRef();

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const isSupported = element && element.addEventListener;
    if (!isSupported) return;

    const eventListener = (event) => savedHandler.current(event);

    element.addEventListener(eventName, eventListener);

    return () => {
      element.removeEventListener(eventName, eventListener);
    };
  }, [eventName, element]);
}

function WdleRow({ rowData, setRowData, word, idx, activeIdx, setActiveIdx }) {
  // If this is the currently active row
  const active = activeIdx === idx,
    // If the outcome should be displayed
    showOutcome =
      rowData[idx].guess.length === 5 && (activeIdx > idx || activeIdx === -1),
    // The main className, depending on whether the row is active or not
    mainClassName = "wdleRow " + (active ? "rowActive" : "");

  function handler({ key, keyCode }) {
    let newGuess = rowData[idx].guess;

    if (keyCode === 8) {
      // If backspace was pressed, remove the last character
      newGuess = newGuess.slice(0, rowData[idx].guess.length - 1);
    } else if (keyCode >= 65 && keyCode <= 90) {
      // If the keycode is alpha, add the character
      newGuess = (rowData[idx].guess + key).toLowerCase();
    } else if (
      keyCode === 13 &&
      rowData[idx].guess.length === 5 &&
      validWords.includes(newGuess.toLowerCase())
    ) {
      // If enter was pressed and the guess is 5 characters long, advance the active guess
      setActiveIdx(idx + 1);
    }

    // If the row is active and the guess fits constraints, set the state
    if (newGuess.length <= 5 && active === true) {
      setRowData({ ...rowData, [idx]: { guess: newGuess } });
    }
  }

  useEventListener("keydown", handler);

  // It's been modified by now so we can just assign to it
  const guess = rowData[idx].guess;

  // Generate an object containing the number of appearances of each character
  // in the word
  const charData = Object.fromEntries([...word].map((char) => [char, 0]));
  for (const char of word) {
    charData[char] += 1;
  }

  // If no guess has been entered, display an empty row
  const uiEntries = Object.fromEntries(
    [...Array(5).keys()].map((i) => [
      i,
      showOutcome ? null : (
        <div key={`${i}`} className={`baseGuess wdleGuessBad`}>
          {guess.charAt(i).toUpperCase() || " "}
        </div>
      ),
    ])
  );

  // If the outcome can be shown, calculate the successes
  if (showOutcome) {
    // First we need to pass over only the successful guesses
    // so that they can be shown in green without worrying about ordering
    for (const [char, charIndex] of [...word]
      .map((c, i) => [c, i])
      .filter((_, i) => word.charAt(i) === guess.charAt(i))) {
      uiEntries[charIndex] = (
        <div key={`${char}-${charIndex}`} className={`baseGuess wdleGuessGood`}>
          {char.toUpperCase()}
        </div>
      );
      // Decrease the remaining uses of the character by one
      charData[char] -= 1;
    }

    // Now we iterate over every other character in the guess
    [...guess, ..." ".repeat(5 - guess.length)].forEach((char, charIndex) => {
      // If the index already has been modified as successful, we ignore it
      if (uiEntries[charIndex] !== null) return;

      let className = "wdleGuess";

      if (word.includes(char) && charData[char] > 0) {
        // If the word includes the guessed character and there are 1 or more uses
        // of the character remaining, we mark it as a "close" guess (orange)
        className += "Close";
        charData[char] -= 1;
      } else {
        // In any other case, it's a "bad" guess and colored grey
        className += "Bad";
      }

      uiEntries[charIndex] = (
        <div key={`${char}-${charIndex}`} className={`baseGuess ${className}`}>
          {char.toUpperCase()}
        </div>
      );
    });
  }

  // Finally, we return the values of the UI entries object, with all
  // of the rows properly setup
  return <div className={mainClassName}>{Object.values(uiEntries)}</div>;
}

function App() {
  const [word, setWord] = useState("");
  const [usedChars, setUsedChars] = useState(new Set([]));

  // Initalize the word once
  useEffect(() => {
    setWord(wordData[Math.floor(Math.random() * wordData.length)]);
  }, []);

  const numRows = 6;
  const [rowData, setRowData] = useState(
    Object.fromEntries(
      [...Array(numRows).keys()].map((k) => [k, { guess: "" }])
    )
  );
  const [active, setActive] = useState(0);

  function isCompleted() {
    return active === -1 || active >= numRows;
  }

  // Generate {numRows} rows
  const rows = [];
  for (let i = 0; i < numRows; i++) {
    rows.push(
      <WdleRow
        rowData={rowData}
        setRowData={setRowData}
        word={word}
        idx={i}
        activeIdx={active}
        setActiveIdx={setActive}
        key={i}
      />
    );
  }

  useEffect(() => {
    // If there is no previous entry, ignore
    if (!rowData[active - 1]) return;

    // Update the set of invalid characters
    [...rowData[active - 1].guess].forEach((char) => {
      setUsedChars(usedChars.add(char));
    });

    // If the previous entry === the word, user has won
    if (rowData[active - 1].guess === word) {
      setActive(-1);
    }
  }, [rowData, active, word, usedChars]);

  return (
    <div id="wdleRoot">
      <div id="wdleTitle">
        <h1>wdle v3.0</h1>
        <p>like wordle, but bad</p>
      </div>

      <div className={"wdleGameRoot" + (isCompleted() ? " completed" : "")}>
        <div className="wdleGridRoot">{rows}</div>
      </div>

      <div className="wdleUsedCharList">
        {[...usedChars.values()]
          .sort((a, b) => a.localeCompare(b))
          .map((char, charIndex) => (
            <p
              key={`${char}-${charIndex}`}
              className={(() => {
                if (word.includes(char)) {
                  if (
                    Object.values(rowData)
                      .slice(0, active)
                      .some(
                        ({ guess }) =>
                          guess.indexOf(char) === word.indexOf(char)
                      )
                  ) {
                    return "wdleGuessGood";
                  } else {
                    return "wdleGuessClose";
                  }
                } else {
                  return "wdleGuessBad";
                }
              })()}
            >
              {char.toUpperCase()}
            </p>
          ))}
      </div>

      {isCompleted() && (
        <div className="wdleRootCompletionModal">
          {active === -1 && (
            <h1 className="wdleRootSuccess">congrats you did it</h1>
          )}
          {active >= numRows && (
            <>
              <h1 className="wdleRootFailure">oops you failed</h1>
              <p>the word was {word}</p>
            </>
          )}
          <div
            className="button"
            onClick={() => {
              window.location.reload();
              return false;
            }}
          >
            play again
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
