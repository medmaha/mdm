"use client";
import { GlobalContext } from "@/app/contexts/global";
import { PostFeedsInterface } from "@/server/controllers/posts";
import {
  FastForward,
  Pause,
  Play,
  Rewind,
  User2,
  Volume2Icon,
} from "lucide-react";
import Image from "next/image";
import React, { useContext, useEffect, useRef, useState } from "react";
import { start } from "repl";

type PostMusicProps = {
  post: PostFeedsInterface;
};

const button =
  "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-50";

export default function PostMusic(props: PostMusicProps) {
  const [audio, setAudio] = useState<HTMLAudioElement>();
  const [playing, togglePlaying] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const context = useContext(GlobalContext);

  const trackerIntervalRef = useRef<any>();

  useEffect(() => {
    return () => {
      clearInterval(trackerIntervalRef.current);
      audio?.pause();
      audio?.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setVolume = (volume: number) => {
    if (audio) audio.volume = volume;
  };

  const getVolume = () => {
    return Number(localStorage.getItem("_MediaVolume") || 0.5);
  };

  function formatAudioDuration(durationInSeconds: number) {
    const hours = Math.floor(durationInSeconds / 3600);
    const minutes = Math.floor((durationInSeconds % 3600) / 60);
    const seconds = Math.floor(durationInSeconds % 60);

    const formattedHours = String(hours).padStart(2, "0");
    const formattedMinutes = String(minutes).padStart(2, "0");
    const formattedSeconds = String(seconds).padStart(2, "0");

    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  }

  function updateTimestamps(_audio: HTMLAudioElement, _width?: number) {
    const width = _width || (_audio.currentTime / _audio.duration) * 100;
    containerRef.current &&
      containerRef.current.style.setProperty("--trackerWidth", `${width}%`);
    const timeElement =
      containerRef.current?.querySelector("[data-audio-time]");
    const durationElement = containerRef.current?.querySelector(
      "[data-audio-duration]"
    );
    if (timeElement)
      timeElement.innerHTML = formatAudioDuration(_audio.currentTime);
    if (durationElement)
      durationElement.innerHTML = formatAudioDuration(_audio.duration);
  }

  function setupAudio(_audio: HTMLAudioElement, src: string) {
    clearInterval(trackerIntervalRef.current);
    _audio.onplay = () => {
      togglePlaying(true);
      trackerIntervalRef.current = setInterval(() => {
        updateTimestamps(_audio);
      }, 1000);
    };

    _audio.onpause = () => {
      clearInterval(trackerIntervalRef.current);
      togglePlaying(false);
    };
    _audio.onended = () => {
      clearInterval(trackerIntervalRef.current);
      togglePlaying(false);
      updateTimestamps(_audio, 100);
    };

    _audio.volume = getVolume();
    _audio.src = src;
    _audio.play();

    var array = [];
    document.querySelectorAll("video").forEach((e) => {
      array.push(e.src);
    });
  }

  const start = () => {
    audio?.pause();
    audio?.remove();
    const _audio = document.createElement("audio");
    setupAudio(_audio, props.post.fileUrl!);
    setAudio(_audio);
  };

  const togglePlay = () => {
    if (!audio) return start();

    if (playing) {
      audio?.pause();
      togglePlaying(false);
      return;
    }
    audio?.play();
    togglePlaying(true);
  };

  const seekVideo = (type: 0 | 1) => {
    if (!audio) return;

    const percentage = 4;
    const totalDuration = audio.duration;

    function rewind(audio: any, percentage: number) {
      const targetTime = audio.currentTime - totalDuration * (percentage / 100);
      audio.currentTime = Math.max(0, targetTime); // Ensure current time is not negative
      updateTimestamps(audio);
    }

    function fastForward(audio: any, percentage: number) {
      const targetTime = audio.currentTime + totalDuration * (percentage / 100);
      audio.currentTime = Math.min(totalDuration, targetTime); // Ensure current time does not exceed total duration
      updateTimestamps(audio);
    }

    switch (type) {
      case 0:
        rewind(audio, percentage);
        break;
      case 1:
        fastForward(audio, percentage);
        break;

      default:
        break;
    }
  };
  return (
    <div
      ref={containerRef}
      className="overflow-hidden w-full block"
      // @ts-ignore
      style={{ "--trackerWidth": "0%" }}
    >
      <div className="p-6 w-full flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-max">
            <div className="w-11 h-11 border border-gray-400 rounded-full overflow-hidden">
              {props.post.author?.avatar && (
                <Image
                  width={44} // Set width and height to maintain aspect ratio
                  height={44}
                  src={props.post.author.avatar}
                  alt="avatar"
                  className="w-full h-full rounded-full post-author-img"
                />
              )}
              {!props.post.author?.avatar && (
                <div className="h-full w-full dark:bg-black/30 flex items-center justify-center">
                  <User2 width={28} height={28} />
                </div>
              )}
            </div>
          </div>
          <div className="min-w-full flex-1 block">
            <h4 className="font-semibold">{props.post.mediaName || ""}</h4>

            <p className="text-gray-500 dark:text-gray-400 text-sm">
              @{context.user?.username}
            </p>
          </div>
        </div>
        <div className="flex items-center w-max gap-4">
          <VolumeController callback={setVolume} defaultValue={audio?.volume} />
        </div>
      </div>
      <div className="px-6 order-1">
        <div className="flex justify-between text-gray-500 dark:text-gray-400 text-xs gap-6">
          <span data-audio-time></span>
          <div className="flex-1 flex items-center justify-center gap-4">
            <button
              onClick={() => seekVideo(0)}
              className={button}
              disabled={!playing}
            >
              <Rewind />
            </button>
            <button
              onClick={togglePlay}
              type="button"
              className={`
               ${
                 playing ? "text-primary" : "text-white/80"
               } hover:text-primaryHover transition-all
              `}
            >
              {playing ? <Pause /> : <Play />}
            </button>
            <button
              onClick={() => seekVideo(1)}
              className={button}
              disabled={!playing}
            >
              <FastForward />
            </button>
          </div>
          <span data-audio-duration></span>
        </div>
        <div
          dir="ltr"
          data-orientation="horizontal"
          aria-disabled="false"
          className="relative my-4 mb-6 flex w-full bg-gray-500/50 rounded-full touch-none select-none items-center"
        >
          <div
            data-orientation="horizontal"
            className="relative h-1 w-full grow overflow-hidden rounded-full bg-secondary"
          >
            <span
              data-orientation="horizontal"
              className="absolute h-full bg-primary rounded-full transition-[width]"
              style={{ left: "0%", width: "var(--trackerWidth)" }}
            ></span>
          </div>
        </div>
      </div>
    </div>
  );
}

function VolumeController({ disabled, callback, defaultValue }: any) {
  return (
    <button
      type="button"
      className={`group relative disabled:bg-transparent disabled:!pointer-events-none disabled:opacity-10 ${button} transition-colors`}
      onClick={() => {}}
      title="Volume"
      disabled={disabled}
    >
      <Volume2Icon className="text-red" />
      <div
        itemID="volume"
        className="hidden absolute right-0 p-0 h-max group-hover:active:block group-focus:block bg-transparent"
      >
        <div className="p-3 border inline-flex items-center justify-centers h-max card rounded-full">
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            className="stroke-primary m-0 border-none h-[3px] bg-primary outline-1 p-0.5"
            defaultValue={defaultValue?.toString() || "0.5"}
            onChange={(e) => {
              localStorage.setItem("_MediaVolume", e.target.value);
              if (callback) {
                callback(Number(e.target.value));
              }
            }}
          />
        </div>
      </div>
    </button>
  );
}
