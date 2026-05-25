import {
  useRef,
  useState,
} from "react";

const usePlayer = () => {

  const videoRef =
    useRef<any>(null);

  const [paused, setPaused] =
    useState(false);

  const [currentTime, setCurrentTime] =
    useState(0);

  const [duration, setDuration] =
    useState(0);

  const [showControls, setShowControls] =
    useState(true);

  return {

    videoRef,

    paused,
    setPaused,

    currentTime,
    setCurrentTime,

    duration,
    setDuration,

    showControls,
    setShowControls,
  };
};

export default usePlayer;