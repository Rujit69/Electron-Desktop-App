import React, { useEffect, useState, useCallback, useMemo } from "react";
import "./App.css";

import playImg from "./assets/play.png";
import resetImg from "./assets/reset.png";
import workBtnClicked from "./assets/work-clicked.png";
import workBtn from "./assets/work.png";
import breakBtnClicked from "./assets/break-clicked.png";
import breakBtn from "./assets/break.png";
import idleGif from "./assets/idle.gif";
import workGif from "./assets/work.gif";
import breakGif from "./assets/break.gif";
import meowSound from "./assets/meow.mp3";
import closeBtn from "./assets/close.png";

// Declare electron API type
declare global {
  interface Window {
    electronAPI?: {
      closeApp: () => void;
    };
  }
}

function App() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [image, setImage] = useState(playImg);
  const [encouragement, setEncouragement] = useState("");
  const [breakButtonImage, setBreakButtonImage] = useState(breakBtn);
  const [gifImage, setGifImage] = useState(idleGif);
  const [workButtonImage, setWorkButtonImage] = useState(workBtn);

  // Memoize audio and messages to prevent recreation
  const meowAudio = useMemo(() => new Audio(meowSound), []);

  const cheerMessages = useMemo(
    () => [
      "You Can Do It!",
      "I believe in you!",
      "Send Nudes!",
      "You're amazing!",
      "Keep going!",
      "Stay focused!",
    ],
    []
  );

  const breakMessages = useMemo(
    () => [
      "Stay hydrated!",
      "Snacks, maybe?",
      "Text me!",
      "Tired already huh ?",
      "I love you <3",
      "Spread your legs!",
    ],
    []
  );

  const formatTime = useCallback((seconds: number): string => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");

    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }, []);

  const switchMode = useCallback((breakMode: boolean) => {
    setIsBreak(breakMode);
    setIsRunning(false);
    setBreakButtonImage(breakMode ? breakBtnClicked : breakBtn);
    setWorkButtonImage(breakMode ? workBtn : workBtnClicked);
    setTimeLeft(breakMode ? 5 * 60 : 25 * 60);
    setGifImage(idleGif);
  }, []);

  const handleClick = useCallback(() => {
    if (!isRunning) {
      setIsRunning(true);
      setGifImage(isBreak ? breakGif : workGif);
      setImage(resetImg);
    } else {
      setIsRunning(false);
      setTimeLeft(isBreak ? 5 * 60 : 25 * 60);
      setGifImage(idleGif);
      setImage(playImg);
    }
  }, [isRunning, isBreak]);

  const handleCloseClick = useCallback(() => {
    if (window.electronAPI?.closeApp) {
      window.electronAPI.closeApp();
    } else {
      console.warn("Electron API not available");
    }
  }, []);

  // Message rotation effect
  useEffect(() => {
    let messageInterval: NodeJS.Timeout;

    if (isRunning) {
      const messages = isBreak ? breakMessages : cheerMessages;
      setEncouragement(messages[0]); // set first message initially
      let index = 1;

      messageInterval = setInterval(() => {
        setEncouragement(messages[index]);
        index = (index + 1) % messages.length;
      }, 4000); // every 4 seconds
    } else {
      setEncouragement("");
    }

    return () => clearInterval(messageInterval);
  }, [isRunning, isBreak, breakMessages, cheerMessages]);

  // Timer countdown effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  // Timer completion effect
  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      meowAudio.play().catch((err) => {
        console.error("Audio play failed:", err);
      });
      setIsRunning(false);
      setImage(playImg);
      setGifImage(idleGif);
      setTimeLeft(isBreak ? 5 * 60 : 25 * 60);
    }
  }, [timeLeft, isRunning, isBreak, meowAudio]);

  // Initial mode setup
  useEffect(() => {
    switchMode(false);
  }, [switchMode]);

  const containerClass = `home-container ${
    isRunning ? "background-green" : ""
  }`;

  return (
    <div className={containerClass} style={{ position: "relative" }}>
      <div>
        <button className="close-button" onClick={handleCloseClick}>
          <img src={closeBtn} alt="close" />
        </button>
      </div>

      <div className="home-content">
        <div className="home-controls">
          <button className="image-button" onClick={() => switchMode(false)}>
            <img src={workButtonImage} alt="work" />
          </button>

          <button className="image-button" onClick={() => switchMode(true)}>
            <img src={breakButtonImage} alt="Break" />
          </button>
        </div>

        <p className={`encouragement-text ${!isRunning ? "hidden" : ""}`}>
          {encouragement}
        </p>

        <h1 className="home-timer">{formatTime(timeLeft)}</h1>
        <img src={gifImage} alt="Timer Status" className="gif-image" />
        <button className="home-button" onClick={handleClick}>
          <img src={image} alt="Button Icon" />
        </button>
      </div>
    </div>
  );
}

export default App;
