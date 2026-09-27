"use client";

import React, { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import type { EmojiClickData } from "emoji-picker-react";

// Load emoji-picker-react dynamically to optimize bundle and avoid SSR issues
const Picker = dynamic(() => import("emoji-picker-react"), {
  ssr: false,
  loading: () => (
    <div className="w-[310px] sm:w-[340px] h-[400px] flex items-center justify-center bg-surface-container-lowest text-xs text-on-surface-variant rounded-2xl border border-outline-variant shadow-xl">
      <span className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
        Memuat emoji...
      </span>
    </div>
  ),
});

interface EmojiPickerProps {
  onSelectEmoji: (emoji: string) => void;
  disabled?: boolean;
}

export default function EmojiPicker({ onSelectEmoji, disabled }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onSelectEmoji(emojiData.emoji);
  };

  return (
    <div className="relative inline-flex items-center">
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
          isOpen
            ? "bg-primary/15 text-primary scale-105"
            : "text-on-surface-variant/70 hover:text-primary hover:bg-surface-container"
        } disabled:opacity-40 disabled:pointer-events-none active:scale-95`}
        title="Pilih Emote / Emoji"
        aria-label="Pilih Emote / Emoji"
      >
        <span className="material-symbols-outlined text-2xl leading-none">
          mood
        </span>
      </button>

      {/* Popover Emoji Picker */}
      {isOpen && (
        <div
          ref={popoverRef}
          className="absolute bottom-full mb-3 right-0 sm:right-auto sm:left-0 z-50 shadow-2xl rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        >
          <Picker
            onEmojiClick={handleEmojiClick}
            width={320}
            height={400}
            searchDisabled={false}
            skinTonesDisabled={false}
            previewConfig={{ showPreview: false }}
            lazyLoadEmojis={true}
          />
        </div>
      )}
    </div>
  );
}
