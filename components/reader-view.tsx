"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Settings, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { updateReadingProgressAction } from "@/lib/actions/resources";

interface ReaderViewProps {
  resourceId: string;
  initialData: {
    title: string;
    url: string;
    content: string;
    wordCount: number;
    readingTime: number;
    scrollProgress: number;
  };
}

type ReaderTheme = "light" | "dark" | "sepia";
type ReaderFont = "sans" | "serif";
type ReaderWidth = "narrow" | "normal" | "wide";

export function ReaderView({ resourceId, initialData }: ReaderViewProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  // Layout Configurations
  const [theme, setTheme] = useState<ReaderTheme>("dark");
  const [font, setFont] = useState<ReaderFont>("serif");
  const [fontSize, setFontSize] = useState<number>(18); // px
  const [width, setWidth] = useState<ReaderWidth>("normal");

  // Load configuration from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("volt_reader_theme") as ReaderTheme;
    const savedFont = localStorage.getItem("volt_reader_font") as ReaderFont;
    const savedSize = localStorage.getItem("volt_reader_size");
    const savedWidth = localStorage.getItem("volt_reader_width") as ReaderWidth;

    if (savedTheme) setTheme(savedTheme);
    if (savedFont) setFont(savedFont);
    if (savedSize) setFontSize(Number(savedSize));
    if (savedWidth) setWidth(savedWidth);
  }, []);

  // Save changes to localStorage
  const changeTheme = (newTheme: ReaderTheme) => {
    setTheme(newTheme);
    localStorage.setItem("volt_reader_theme", newTheme);
  };
  const changeFont = (newFont: ReaderFont) => {
    setFont(newFont);
    localStorage.setItem("volt_reader_font", newFont);
  };
  const changeFontSize = (delta: number) => {
    setFontSize((prev) => {
      const next = Math.min(32, Math.max(14, prev + delta));
      localStorage.setItem("volt_reader_size", String(next));
      return next;
    });
  };
  const changeWidth = (newWidth: ReaderWidth) => {
    setWidth(newWidth);
    localStorage.setItem("volt_reader_width", newWidth);
  };

  // Scroll Progress Saving
  useEffect(() => {
    // Initial scroll restore
    const restoreScroll = () => {
      if (initialData.scrollProgress > 0) {
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        window.scrollTo(0, scrollHeight * initialData.scrollProgress);
      }
    };
    // Give document a split second to finish painting
    const timer = setTimeout(restoreScroll, 150);

    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(async () => {
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (scrollHeight <= 0) return;
        const progress = Math.min(1, Math.max(0, window.scrollY / scrollHeight));
        await updateReadingProgressAction(resourceId, progress);
      }, 500); // Debounce database saves
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timer);
      clearTimeout(scrollTimeout);
    };
  }, [resourceId, initialData.scrollProgress]);

  // Width Class Mapper
  const widthClasses = {
    narrow: "max-w-xl",
    normal: "max-w-3xl",
    wide: "max-w-5xl"
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      theme === "sepia" ? "bg-[#faf4e8] text-[#4f3824]" : 
      theme === "light" ? "bg-white text-zinc-900" : 
      "bg-zinc-950 text-zinc-100"
    }`}>
      {/* Floating Header */}
      <header className={`sticky top-0 z-40 w-full border-b backdrop-blur-md px-4 h-12 flex items-center justify-between ${
        theme === "sepia" ? "border-[#ebdcc5] bg-[#faf4e8]/80" :
        theme === "light" ? "border-zinc-200 bg-white/80" :
        "border-zinc-900 bg-zinc-950/80"
      }`}>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="size-8" onClick={() => router.back()}>
            <ArrowLeft className="size-4" />
          </Button>
          <span className="text-xs text-muted-foreground truncate max-w-[200px] sm:max-w-xs">
            {initialData.title}
          </span>
        </div>

        {/* Configuration Controls */}
        <div className="flex items-center gap-1.5">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className="size-8">
                <Settings className="size-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-3 bg-popover border shadow-lg flex flex-col gap-3">
              {/* Theme Settings */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Theme</span>
                <div className="grid grid-cols-3 gap-1.5">
                  <Button variant={theme === "light" ? "default" : "outline"} className="h-7 text-xs px-1" onClick={() => changeTheme("light")}>
                    Light
                  </Button>
                  <Button variant={theme === "dark" ? "default" : "outline"} className="h-7 text-xs px-1" onClick={() => changeTheme("dark")}>
                    Dark
                  </Button>
                  <Button variant={theme === "sepia" ? "default" : "outline"} className="h-7 text-xs px-1 bg-[#f4ebd0] text-[#5c3e21] hover:bg-[#ebdcc5]" onClick={() => changeTheme("sepia")}>
                    Sepia
                  </Button>
                </div>
              </div>

              {/* Font Settings */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Font</span>
                <div className="grid grid-cols-2 gap-1.5">
                  <Button variant={font === "sans" ? "default" : "outline"} className="h-7 text-xs font-sans" onClick={() => changeFont("sans")}>
                    Sans
                  </Button>
                  <Button variant={font === "serif" ? "default" : "outline"} className="h-7 text-xs font-serif" onClick={() => changeFont("serif")}>
                    Serif
                  </Button>
                </div>
              </div>

              {/* Size Settings */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Text Size</span>
                <div className="flex items-center justify-between gap-2">
                  <Button variant="outline" size="icon" className="h-7 w-7 text-xs" onClick={() => changeFontSize(-2)}>-</Button>
                  <span className="text-xs font-mono">{fontSize}px</span>
                  <Button variant="outline" size="icon" className="h-7 w-7 text-xs" onClick={() => changeFontSize(2)}>+</Button>
                </div>
              </div>

              {/* Width Settings */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Width</span>
                <div className="grid grid-cols-3 gap-1.5">
                  <Button variant={width === "narrow" ? "default" : "outline"} className="h-7 text-xs px-1" onClick={() => changeWidth("narrow")}>
                    Narrow
                  </Button>
                  <Button variant={width === "normal" ? "default" : "outline"} className="h-7 text-xs px-1" onClick={() => changeWidth("normal")}>
                    Normal
                  </Button>
                  <Button variant={width === "wide" ? "default" : "outline"} className="h-7 text-xs px-1" onClick={() => changeWidth("wide")}>
                    Wide
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </header>

      {/* Main Reading Panel */}
      <main className={`mx-auto px-6 py-10 transition-all duration-200 ${widthClasses[width]}`}>
        {/* Metadata Header */}
        <div className={`border-b pb-5 mb-8 text-left ${
          theme === "sepia" ? "border-[#ebdcc5]" :
          theme === "light" ? "border-zinc-200" :
          "border-zinc-900"
        }`}>
          <h1 className={`text-3xl font-extrabold tracking-tight mb-3 leading-tight ${font === "serif" ? "font-serif" : "font-sans"}`}>
            {initialData.title}
          </h1>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="size-3.5" />
              {initialData.readingTime} min read
            </span>
            <span>•</span>
            <span>{initialData.wordCount} words</span>
            <span>•</span>
            <a href={initialData.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-primary truncate max-w-[150px] sm:max-w-xs">
              Original Link
            </a>
          </div>
        </div>

        {/* Cleaned Content Content Block */}
        <article
          ref={containerRef}
          className={`focus:outline-none transition-all duration-200 prose max-w-none text-left
            ${font === "serif" ? "font-serif" : "font-sans"} 
            ${theme === "sepia" ? "prose-amber" : theme === "light" ? "prose-neutral" : "prose-invert"}
          `}
          style={{
            fontSize: `${fontSize}px`,
            lineHeight: "1.75",
          }}
          dangerouslySetInnerHTML={{ __html: initialData.content }}
        />
      </main>
    </div>
  );
}
