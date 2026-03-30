import { useState, useEffect } from "react";

export interface CommandItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  shortcut?: string;
}

interface SlashCommandListProps {
  items: CommandItem[];
  command: (item: CommandItem) => void;
}

export function SlashCommandList({ items, command }: SlashCommandListProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setSelectedIndex(0);
  }, [items]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + items.length - 1) % items.length);
        return true;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % items.length);
        return true;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        const item = items[selectedIndex];
        if (item) command(item);
        return true;
      }
      return false;
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [items, selectedIndex, command]);

  if (items.length === 0) {
    return (
      <div className="bg-[#1a1a1b] border border-vellum-outline/20 rounded-xl shadow-2xl overflow-hidden min-w-[220px] max-w-[280px] px-4 py-3">
        <p className="text-xs text-vellum-on-surface-variant">No suggestions</p>
      </div>
    );
  }

  return (
    <div className="bg-[#1a1a1b] border border-vellum-outline/20 rounded-xl shadow-2xl overflow-hidden min-w-[220px] max-w-[280px]">
      <div className="px-3 py-2 border-b border-vellum-outline/10">
        <p className="text-[10px] font-bold text-vellum-primary uppercase tracking-widest">Quick Insert</p>
      </div>
      <div className="max-h-[240px] overflow-y-auto py-1">
        {items.map((item, index) => (
          <button
            key={item.id}
            onClick={() => command(item)}
            className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${
              index === selectedIndex 
                ? "bg-vellum-primary/10 text-vellum-primary" 
                : "text-vellum-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
            }`}
          >
            <span className="text-base">{item.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">{item.title}</p>
              <p className="text-[10px] text-vellum-on-surface-variant truncate">{item.description}</p>
            </div>
            {item.shortcut && (
              <span className="text-[9px] text-vellum-on-surface-variant opacity-50">{item.shortcut}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
