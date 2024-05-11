"use client";
import { Forward, Pause, Play, ThumbsUp, Volume2 } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

type Props = {
  src: string;
  liked: boolean;
  replied: boolean;
  toggleLike: () => Promise<void>;
  toggleReply?: () => void;
};

const getAudio = () => {
  const _audio = document.createElement("audio");
  _audio.controls = false;
  return _audio;
};

export default function VoiceComment({ src, toggleReply, ...props }: Props) {
  const progressRef = useRef<HTMLDivElement>(null);
  const [audio, setAudio] = useState<HTMLAudioElement>();
  const [playing, setPlaying] = useState(false);
  const interval = useRef<any>();

  useEffect(() => {
    const _audio = getAudio();
    setAudio(_audio);
  }, [src]);

  const play = () => {
    let _audio = audio;
    if (!_audio) {
      clearInterval(interval.current);
      progressRef.current!.style.width = `0%`;
      _audio = getAudio();
      setAudio(_audio);
    }

    _audio.onplay = () => {
      clearInterval(interval.current);
      interval.current = setInterval(() => {
        const progress = _audio.currentTime / _audio.duration;
        progressRef.current!.style.width = `${progress * 100}%`;
      }, 1000);
    };

    _audio.onpause = () => {
      clearInterval(interval.current);
      setPlaying(false);
    };

    _audio.onended = () => {
      clearInterval(interval.current);
      progressRef.current!.style.width = `100%`;
      setPlaying(false);
    };

    _audio.onvolumechange = () => {
      localStorage.setItem("_MediaVolume", String(_audio.volume));
    };

    _audio.onload = () => {
      alert(_audio?.duration);
    };

    const defaultVolume = Number(localStorage.getItem("_MediaVolume") || 0.5);
    _audio.volume = defaultVolume;
    _audio.src = src;
    _audio.play();
    setPlaying(true);
  };

  const pause = () => {
    audio?.pause();
    setPlaying(false);
  };

  const stop = () => {};

  return (
    <>
      <div className="dark:bg-black/20 bg-gray-400 p-1 rounded-full w-full">
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-2 items-center">
            <button
              onClick={() => {
                if (playing) pause();
                else play();
              }}
              className="p-1 rounded-full bg-gray-200 dark:bg-gray-700 transition-all hover:bg-primary focus:outline-none focus:ring-2 focus:ring-primary-400 dark:focus:ring-primary-600"
            >
              {playing ? (
                <Pause width={16} height={16} />
              ) : (
                <Play width={16} height={16} />
              )}
            </button>
            <button className="p-1 rounded-full bg-gray-200 dark:bg-gray-700 transition-all hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-400 dark:focus:ring-primary-600">
              <Volume2 width={16} height={16} />
            </button>
          </div>
          <div className="flex-1 flex items-center gap-2 h-max">
            <div className="w-full card rounded-full h-1.5">
              <div
                ref={progressRef}
                className="bg-gray-200 dark:bg-gray-700 h-full rounded-full w-0"
              ></div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400 text-xs">
                {playing && audio?.duration !== Infinity && (
                  <small>
                    {(!!(
                      !isNaN(audio?.duration!) && !isNaN(audio?.currentTime!)
                    )
                      ? audio?.duration
                      : 0
                    )?.toFixed(2)}
                  </small>
                )}
                {!playing && <small>0.00</small>}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={props.toggleLike}
              className="p-1 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600"
            >
              <ThumbsUp width={16} height={16} />
            </button>
            {toggleReply && (
              <button
                onClick={toggleReply}
                className="p-1 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600"
              >
                <Forward width={16} height={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
