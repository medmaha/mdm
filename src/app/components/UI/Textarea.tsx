"use client";
import { cn } from "@/lib/utils";
import React, { useRef } from "react";

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export default function Textarea(props: TextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleResize = () => {
    const textarea = textareaRef.current!;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  return (
    <textarea
      {...props}
      className={cn(
        "bg-transparent focus:border-primary px-1 outline-none border-b w-full text-sm p-1 resize-none transition-[height]",
        props.className
      )}
      ref={textareaRef}
      onInput={handleResize}
      placeholder={props.placeholder || "Enter your text here..."}
    ></textarea>
  );
}
