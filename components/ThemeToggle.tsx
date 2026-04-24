"use client";
import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <button
      onClick={toggle}
      className="flex items-center justify-center w-9 h-9 rounded-xl border border-default hover:bg-page-2 transition-colors text-secondary hover:text-primary"
      title={dark ? "Mode terang" : "Mode gelap"}
    >
      {dark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
