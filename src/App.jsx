import { useEffect, useState, useRef } from "react";
import Swal from "sweetalert2";

import { appOptions } from "./utils/localStorage";

import heroImage from "./assets/hero.svg";

/**
 *
 * @param {string} char
 * @returns {boolean} isLetter
 */
function isLetter(char) {
  // regex for letters and space and characters like: . , ! ? etc
  const regex = /[a-zA-Z\s.,!?]/;
  return regex.test(char);
}

function calculateResult({
  userText,
  errorCounter,
  initialTime,
  textIsComplete = true,
}) {
  const acuracy = Math.round((1 - errorCounter / appOptions.text.length) * 100);
  const time = (Date.now() - initialTime) / 1000;
  const userCharacters = appOptions.text.length - userText.length;
  let wpm = (userCharacters / 5 / time) * 60;
  wpm = Math.round(wpm * 100) / 100;

  const result = {
    acuracy,
    time,
    wpm,
    textIsComplete,
  };

  return result;
}

function App() {
  const [userText, setUserText] = useState(appOptions.text);
  const [isWithError, setIsWithError] = useState(false);
  const errorCounter = useRef(0);
  const canErrorCounterIncrement = useRef(true);
  const initialTime = useRef(null);

  const [timer, setTimer] = useState(appOptions.timeLimit);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const canUserTextChange = useRef(true);

  // Window Keypress event
  useEffect(() => {
    const onKeyDown = (ev) => {
      if (!canUserTextChange.current) return;
      if (!isLetter(ev.key)) return;

      if (!isTimerRunning) {
        setIsTimerRunning(true);
      }

      if (initialTime.current === null) {
        initialTime.current = Date.now();
      }

      if (ev.key === userText[0]) {
        setIsWithError(false);
        setUserText(userText.slice(1));
        canErrorCounterIncrement.current = true;
      } else {
        if (canErrorCounterIncrement.current) {
          errorCounter.current++;
        }
        setIsWithError(true);
        canErrorCounterIncrement.current = false;
      }
    };

    window.addEventListener("keypress", onKeyDown);
    return () => {
      window.removeEventListener("keypress", onKeyDown);
    };
  }, [isTimerRunning, userText]);

  const onFailTest = () => {
    canUserTextChange.current = false;
    const result = calculateResult({
      userText,
      errorCounter: errorCounter.current,
      initialTime: initialTime.current,
      textIsComplete: false,
    });

    Swal.fire({
      Title: "Test finalizado",
      icon: "error",
      html: `
        <p>
        ${result.textIsComplete ? "✅" : "❌"} Palabras por minuto: ${
        result.wpm
      }</p>

        <p>${appOptions.accuracy <= result.acuracy ? "✅" : "❌"} Precisión: ${
        result.acuracy
      }%</p>

        <p> ❌Tiempo: ${result.time}</p>
      `,
    });
  };

  // Timer effect
  useEffect(() => {
    if (!isTimerRunning) return;
    if (timer <= 0) {
      onFailTest();
      return;
    }

    const intervalId = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer, isTimerRunning]);

  useEffect(() => {
    if (userText.length > 0) return;

    canUserTextChange.current = false;
    setIsTimerRunning(false);

    const result = calculateResult({
      userText,
      errorCounter: errorCounter.current,
      initialTime: initialTime.current,
    });

    Swal.fire({
      Title: "Test finalizado",
      icon: "success",
      html: `
        <p>
        ${result.textIsComplete ? "✅" : "❌"} Palabras por minuto: ${
        result.wpm
      }</p>
        <p>${appOptions.accuracy <= result.acuracy ? "✅" : "❌"} Precisión: ${
        result.acuracy
      }%</p>
        <p>${appOptions.timeLimit >= result.time ? "✅" : "❌"} Tiempo: ${
        result.time
      }</p>
      `,
    });
  }, [userText]);

  return (
    <div className="main-container">
      <h2 className="title">Prueba de Typeo</h2>
      <input
        className="text-input"
        readOnly
        style={{
          border: isWithError ? "2px solid red" : "2px solid black",
        }}
        type="text"
        value={userText}
      />

      <p className="timer">
        Tiempo restante: {timer} {timer !== 1 ? "segundos" : "segundo"}
      </p>
      <p className="timer-description">
        El tiempo comenzará a correr una vez escribas el primer caracter
      </p>

      <img src={heroImage} alt="Hero image" width="350px" />
    </div>
  );
}

export default App;
