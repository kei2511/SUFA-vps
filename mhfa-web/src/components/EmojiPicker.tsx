"use client";

import React, { useState, useRef, useEffect } from "react";

interface EmojiPickerProps {
  onSelectEmoji: (emoji: string) => void;
  disabled?: boolean;
}

interface EmojiCategory {
  id: string;
  name: string;
  icon: string;
  emojis: { char: string; keywords: string[] }[];
}

const EMOJI_CATEGORIES: EmojiCategory[] = [
  {
    id: "curhat",
    name: "Curhat & Dukungan",
    icon: "favorite",
    emojis: [
      { char: "😊", keywords: ["senang", "bahagia", "senyum", "smile", "happy"] },
      { char: "😌", keywords: ["lega", "tenang", "damai", "relieve"] },
      { char: "🥰", keywords: ["sayang", "cinta", "hangat", "love"] },
      { char: "🤗", keywords: ["peluk", "rangkul", "hangat", "hug"] },
      { char: "🫂", keywords: ["pelukan", "support", "dukungan", "hug"] },
      { char: "✨", keywords: ["harapan", "semangat", "sparkle"] },
      { char: "🥺", keywords: ["sedih", "memohon", "terharu", "pleading"] },
      { char: "😢", keywords: ["sedih", "menangis", "kecewa", "cry", "sad"] },
      { char: "😭", keywords: ["nangis", "sedih banget", "air mata", "cry"] },
      { char: "😔", keywords: ["kecewa", "murung", "menyesal", "pensive"] },
      { char: "😟", keywords: ["khawatir", "cemas", "bingung", "worried"] },
      { char: "😰", keywords: ["cemas", "takut", "gugup", "anxious"] },
      { char: "😣", keywords: ["tertekan", "lelah", "berat", "struggle"] },
      { char: "😤", keywords: ["kesal", "frustrasi", "menahan diri"] },
      { char: "😠", keywords: ["marah", "emosi", "kesal", "angry"] },
      { char: "🤯", keywords: ["stres", "kepikiran", "penuh", "mindblown"] },
      { char: "🙏", keywords: ["terima kasih", "mohon", "doa", "pray", "thanks"] },
      { char: "👍", keywords: ["setuju", "bagus", "mantap", "jempol", "ok"] },
      { char: "🤍", keywords: ["hati putih", "tulus", "damai", "white heart"] },
      { char: "❤️", keywords: ["hati", "cinta", "dukungan", "heart"] },
      { char: "💪", keywords: ["kuat", "semangat", "pasti bisa", "strong"] },
      { char: "🌸", keywords: ["bunga", "lembut", "harapan", "flower"] },
      { char: "🌿", keywords: ["sejuk", "tenang", "alam", "peace"] },
      { char: "☕", keywords: ["istirahat", "kopi", "santai", "relax"] },
    ],
  },
  {
    id: "smileys",
    name: "Ekspresi Wajah",
    icon: "mood",
    emojis: [
      { char: "😀", keywords: ["gembira", "grinning"] },
      { char: "😃", keywords: ["senyum lebar", "smiley"] },
      { char: "😄", keywords: ["tertawa", "happy"] },
      { char: "😁", keywords: ["nyengir", "grin"] },
      { char: "😆", keywords: ["ngakak", "laugh"] },
      { char: "😅", keywords: ["keringat dingin", "lega"] },
      { char: "😂", keywords: ["lucu", "tertawa terbahak", "lol"] },
      { char: "🤣", keywords: ["ngakak guling", "rofl"] },
      { char: "🙂", keywords: ["senyum ramah", "slightly happy"] },
      { char: "🙃", keywords: ["terbalik", "sarkas", "ironis"] },
      { char: "😉", keywords: ["kedip", "wink"] },
      { char: "😊", keywords: ["senyum malu", "blush"] },
      { char: "😇", keywords: ["malaikat", "baik", "polos"] },
      { char: "😍", keywords: ["suka banget", "kagum", "love"] },
      { char: "🤩", keywords: ["terpesona", "bintang", "excited"] },
      { char: "😘", keywords: ["cium", "kiss"] },
      { char: "😋", keywords: ["enak", "sedap", "yum"] },
      { char: "😛", keywords: ["melet", "canda", "tongue"] },
      { char: "🤔", keywords: ["berpikir", "bingung", "think"] },
      { char: "🤐", keywords: ["diam", "rahasia", "zipper"] },
      { char: "😐", keywords: ["datar", "netral", "neutral"] },
      { char: "😑", keywords: ["kehabisan kata", "capek"] },
      { char: "🙄", keywords: ["mata ke atas", "terserah", "roll eyes"] },
      { char: "😬", keywords: ["canggung", "grimace"] },
      { char: "🤥", keywords: ["bohong", "pinocchio"] },
      { char: "😴", keywords: ["tidur", "mengantuk", "sleep"] },
      { char: "😷", keywords: ["masker", "sakit"] },
      { char: "🤒", keywords: ["demam", "kurang enak badan"] },
      { char: "🤕", keywords: ["terluka", "perban", "pusing"] },
      { char: "🤢", keywords: ["mual", "jijik"] },
      { char: "🤮", keywords: ["muntah"] },
      { char: "🤧", keywords: ["bersin", "flu"] },
      { char: "🥵", keywords: ["kepanasan", "gerah"] },
      { char: "🥶", keywords: ["kedinginan", "beku"] },
      { char: "🥴", keywords: ["pusing", "linglung"] },
      { char: "😵", keywords: ["pingsan", "keliyengan"] },
      { char: "😎", keywords: ["keren", "cool"] },
      { char: "🤓", keywords: ["kacamata", "kutu buku"] },
      { char: "🧐", keywords: ["meneliti", "curiga"] },
      { char: "😕", keywords: ["kurang yakin", "ragu"] },
      { char: "😟", keywords: ["khawatir", "worried"] },
      { char: "🙁", keywords: ["sedih kecil"] },
      { char: "☹️", keywords: ["sedih"] },
      { char: "😮", keywords: ["kaget", "terkejut"] },
      { char: "😲", keywords: ["heran", "astonished"] },
      { char: "😳", keywords: ["kaget malu", "flushed"] },
      { char: "🥺", keywords: ["mohon", "melas", "pleading"] },
      { char: "😦", keywords: ["bingung terkejut"] },
      { char: "😨", keywords: ["takut", "ngeri"] },
      { char: "😰", keywords: ["panik", "cemas"] },
      { char: "😥", keywords: ["kecewa lega"] },
      { char: "😢", keywords: ["menangis", "cry"] },
      { char: "😭", keywords: ["nangis kencang", "sob"] },
      { char: "😱", keywords: ["histeris", "teror", "scream"] },
      { char: "😖", keywords: ["bingung tertekan"] },
      { char: "😣", keywords: ["menahan sakit"] },
      { char: "😞", keywords: ["kecewa lesu"] },
      { char: "😓", keywords: ["keringat dingin cape"] },
      { char: "😩", keywords: ["lelah frustrasi"] },
      { char: "😫", keywords: ["capek banget"] },
      { char: "🥱", keywords: ["menguap", "bosan"] },
      { char: "😤", keywords: ["mendengus", "kesal"] },
      { char: "😡", keywords: ["marah besar", "rage"] },
      { char: "😠", keywords: ["marah", "angry"] },
      { char: "🤬", keywords: ["marah kasar"] },
    ],
  },
  {
    id: "gestures",
    name: "Gestur & Tangan",
    icon: "pan_tool_alt",
    emojis: [
      { char: "👋", keywords: ["halo", "dadah", "wave"] },
      { char: "✋", keywords: ["stop", "tangan", "tunggu"] },
      { char: "👌", keywords: ["oke", "siap", "ok"] },
      { char: "🤌", keywords: ["kenapa", "maksudnya"] },
      { char: "🤏", keywords: ["sedikit", "dikit", "pinch"] },
      { char: "✌️", keywords: ["damai", "peace", "dua"] },
      { char: "🤞", keywords: ["berharap", "semoga", "cross fingers"] },
      { char: "🤟", keywords: ["love sign", "metal"] },
      { char: "🤙", keywords: ["telepon", "santai", "call"] },
      { char: "👈", keywords: ["kiri", "tunjuk kiri"] },
      { char: "👉", keywords: ["kanan", "tunjuk kanan"] },
      { char: "👆", keywords: ["atas", "tunjuk atas"] },
      { char: "👇", keywords: ["bawah", "tunjuk bawah"] },
      { char: "👍", keywords: ["jempol", "bagus", "setuju", "like", "thumbs up"] },
      { char: "👎", keywords: ["tidak suka", "dislike"] },
      { char: "✊", keywords: ["tinju", "semangat", "fist"] },
      { char: "👊", keywords: ["tos", "fist bump"] },
      { char: "👏", keywords: ["tepuk tangan", "selamat", "clap", "bravo"] },
      { char: "🙌", keywords: ["hore", "syukur", "celebrate"] },
      { char: "👐", keywords: ["terbuka", "menyambut"] },
      { char: "🤲", keywords: ["berdoa", "tangan menengadah"] },
      { char: "🤝", keywords: ["salaman", "sepakat", "deal"] },
      { char: "🙏", keywords: ["terima kasih", "maaf", "mohon", "pray", "thanks"] },
      { char: "💪", keywords: ["kuat", "otot", "semangat", "strong"] },
      { char: "🫂", keywords: ["peluk", "rangkul", "support"] },
    ],
  },
  {
    id: "hearts",
    name: "Hati & Simbol",
    icon: "favorite",
    emojis: [
      { char: "❤️", keywords: ["hati merah", "cinta", "love"] },
      { char: "🧡", keywords: ["hati oranye"] },
      { char: "💛", keywords: ["hati kuning"] },
      { char: "💚", keywords: ["hati hijau", "sehat"] },
      { char: "💙", keywords: ["hati biru", "tenang"] },
      { char: "💜", keywords: ["hati ungu"] },
      { char: "🖤", keywords: ["hati hitam"] },
      { char: "🤍", keywords: ["hati putih", "tulus"] },
      { char: "🤎", keywords: ["hati cokelat"] },
      { char: "💔", keywords: ["patah hati", "kecewa", "broken heart"] },
      { char: "❤️‍🔥", keywords: ["membara", "antusias"] },
      { char: "❤️‍🩹", keywords: ["penyembuhan", "pulih", "healing"] },
      { char: "💕", keywords: ["dua hati"] },
      { char: "💖", keywords: ["hati berkilau", "sparkle heart"] },
      { char: "💗", keywords: ["hati berdetak", "growing heart"] },
      { char: "✨", keywords: ["kilau", "bersinar", "magis"] },
      { char: "⭐", keywords: ["bintang", "star"] },
      { char: "🌟", keywords: ["bintang bersinar"] },
      { char: "💫", keywords: ["dizzy", "bintang berputar"] },
      { char: "☀️", keywords: ["matahari", "cerah", "sun"] },
      { char: "🌙", keywords: ["bulan", "malam", "moon"] },
      { char: "🌈", keywords: ["pelangi", "harapan", "rainbow"] },
    ],
  },
  {
    id: "relax",
    name: "Relaksasi & Suasana",
    icon: "spa",
    emojis: [
      { char: "🧘", keywords: ["meditasi", "yoga", "tenang"] },
      { char: "🚶", keywords: ["jalan", "refreshing", "walk"] },
      { char: "🛌", keywords: ["tidur", "rebahan", "bed"] },
      { char: "🎧", keywords: ["musik", "dengar lagu", "headphone"] },
      { char: "🎵", keywords: ["nada", "musik", "lagu"] },
      { char: "📚", keywords: ["buku", "belajar", "membaca"] },
      { char: "☕", keywords: ["kopi", "teh hangat", "santai"] },
      { char: "🍵", keywords: ["teh hijau", "relaks"] },
      { char: "🌱", keywords: ["tumbuh", "bibit", "berkembang"] },
      { char: "🌿", keywords: ["daun", "alami", "hijau"] },
      { char: "🕊️", keywords: ["merpati", "damai", "peace"] },
      { char: "🕯️", keywords: ["lilin", "hening", "calm"] },
      { char: "🧸", keywords: ["boneka", "nyaman", "teddy"] },
    ],
  },
];

export default function EmojiPicker({ onSelectEmoji, disabled }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("curhat");
  const [searchQuery, setSearchQuery] = useState("");
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

  const handleEmojiClick = (emojiChar: string) => {
    onSelectEmoji(emojiChar);
  };

  // Filter emojis based on search query
  const filteredEmojis = searchQuery.trim()
    ? EMOJI_CATEGORIES.flatMap((cat) => cat.emojis).filter((emoji) => {
        const query = searchQuery.toLowerCase();
        return (
          emoji.char.includes(query) ||
          emoji.keywords.some((kw) => kw.toLowerCase().includes(query))
        );
      })
    : null;

  const currentCategory = EMOJI_CATEGORIES.find((cat) => cat.id === activeTab);

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

      {/* Popover Card */}
      {isOpen && (
        <div
          ref={popoverRef}
          className="absolute bottom-full mb-3 right-0 sm:right-auto sm:left-0 z-50 w-72 sm:w-80 bg-surface-container-lowest border border-outline-variant/70 rounded-2xl shadow-2xl p-3 flex flex-col gap-2.5 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md"
          style={{ maxHeight: "360px" }}
        >
          {/* Header & Search */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-outline text-base pointer-events-none">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari emoji (mis: senyum, sedih, hati)..."
                className="w-full pl-8 pr-7 py-1.5 bg-surface-container border border-outline-variant/50 rounded-xl text-xs text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-all"
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface text-xs"
                >
                  ✕
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container flex items-center justify-center transition-colors"
              title="Tutup"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>

          {/* Category Tabs (shown only when not searching) */}
          {!searchQuery && (
            <div className="flex items-center gap-1 border-b border-outline-variant/40 pb-2 px-0.5 overflow-x-auto no-scrollbar">
              {EMOJI_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveTab(cat.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all whitespace-nowrap ${
                    activeTab === cat.id
                      ? "bg-primary text-on-primary shadow-xs"
                      : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">
                    {cat.icon}
                  </span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          )}

          {/* Emoji Grid Area */}
          <div className="flex-1 overflow-y-auto max-h-56 pr-1 custom-scrollbar">
            {filteredEmojis ? (
              // Search Results
              filteredEmojis.length > 0 ? (
                <div className="grid grid-cols-7 sm:grid-cols-8 gap-1 p-0.5">
                  {filteredEmojis.map((item, idx) => (
                    <button
                      key={`${item.char}-${idx}`}
                      type="button"
                      onClick={() => handleEmojiClick(item.char)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-lg hover:bg-primary/10 hover:scale-125 transition-transform active:scale-95 cursor-pointer"
                      title={item.keywords.join(", ")}
                    >
                      {item.char}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-on-surface-variant">
                  Tidak ada emoji yang cocok dengan "{searchQuery}"
                </div>
              )
            ) : (
              // Active Category Emojis
              <div className="space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-outline px-1">
                  {currentCategory?.name}
                </div>
                <div className="grid grid-cols-7 sm:grid-cols-8 gap-1 p-0.5">
                  {currentCategory?.emojis.map((item, idx) => (
                    <button
                      key={`${item.char}-${idx}`}
                      type="button"
                      onClick={() => handleEmojiClick(item.char)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-lg hover:bg-primary/10 hover:scale-125 transition-transform active:scale-95 cursor-pointer"
                      title={item.keywords.join(", ")}
                    >
                      {item.char}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Support Reaction Bar */}
          <div className="border-t border-outline-variant/40 pt-2 flex items-center justify-between px-1 text-[11px] text-on-surface-variant">
            <span className="text-[10px] font-medium text-outline">Reaksi cepat:</span>
            <div className="flex items-center gap-1.5">
              {["❤️", "🙏", "👍", "🤗", "✨"].map((quickEmoji) => (
                <button
                  key={quickEmoji}
                  type="button"
                  onClick={() => handleEmojiClick(quickEmoji)}
                  className="hover:scale-125 transition-transform cursor-pointer p-0.5"
                  title="Kirim cepat"
                >
                  {quickEmoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
