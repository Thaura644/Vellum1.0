import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, ChevronRight, FileText, MessageSquare, MoreVertical } from "lucide-react";

interface SceneCard {
  id: string;
  heading: string;
  summary?: string;
  color?: string;
}

interface CardsViewProps {
  scenes: { id: string; heading: string; pos: number }[];
  onReorder: (newScenes: { id: string; heading: string; pos: number }[]) => void;
  onSelectScene: (pos: number) => void;
}

function SortableCard({ card, onClick }: { card: SceneCard; onClick: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const colorVariants: Record<string, string> = {
    "INT": "bg-blue-500/10 border-blue-500/30",
    "EXT": "bg-amber-500/10 border-amber-500/30",
    "INT/EXT": "bg-purple-500/10 border-purple-500/30",
  };

  const getScenePrefix = (heading: string) => {
    const match = heading.match(/^(INT|EXT|INT\/EXT)/i);
    return match ? match[0].toUpperCase() : null;
  };

  const prefix = getScenePrefix(card.heading);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group relative bg-surface-container border border-vellum-outline/10 rounded-xl p-4 
        hover:border-vellum-primary/30 hover:shadow-lg hover:shadow-vellum-primary/5 
        transition-all cursor-pointer select-none
        ${isDragging ? "opacity-50 z-50 shadow-2xl scale-105" : ""}
        ${prefix ? colorVariants[prefix] || "border-vellum-outline/10" : "border-vellum-outline/10"}
      `}
      onClick={onClick}
    >
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-surface-container-high transition-all cursor-grab active:cursor-grabbing"
        >
          <GripVertical size={14} className="text-vellum-on-surface-variant" />
        </button>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {prefix && (
              <span className={`
                text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded
                ${prefix === "INT" ? "bg-blue-500/20 text-blue-600 dark:text-blue-400" : 
                  prefix === "EXT" ? "bg-amber-500/20 text-amber-600 dark:text-amber-400" : 
                  "bg-purple-500/20 text-purple-600 dark:text-purple-400"}
              `}>
                {prefix}
              </span>
            )}
          </div>
          <h3 className="text-xs font-semibold text-vellum-on-surface truncate leading-snug">
            {card.heading.replace(/^(INT|EXT|INT\/EXT)\.\s*/i, "")}
          </h3>
          <p className="text-[10px] text-vellum-on-surface-variant mt-1.5 line-clamp-2 opacity-70">
            {card.summary || "Click to add scene summary..."}
          </p>
        </div>

        <button className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-surface-container-high transition-all">
          <MoreVertical size={12} className="text-vellum-on-surface-variant" />
        </button>
      </div>

      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-vellum-outline/5">
        <button className="flex items-center gap-1.5 text-[9px] font-bold text-vellum-on-surface-variant hover:text-vellum-primary transition-colors">
          <FileText size={10} />
          <span>0 PAGES</span>
        </button>
        <button className="flex items-center gap-1.5 text-[9px] font-bold text-vellum-on-surface-variant hover:text-vellum-primary transition-colors">
          <MessageSquare size={10} />
          <span>0 NOTES</span>
        </button>
      </div>
    </div>
  );
}

export default function CardsView({ scenes, onReorder, onSelectScene }: CardsViewProps) {
  const [cards, setCards] = useState<SceneCard[]>(
    scenes.map((s) => ({
      id: s.id,
      heading: s.heading,
      summary: undefined,
    }))
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = cards.findIndex((c) => c.id === active.id);
      const newIndex = cards.findIndex((c) => c.id === over.id);

      const newCards = arrayMove(cards, oldIndex, newIndex);
      setCards(newCards);

      const reorderedScenes = newCards.map((card, index) => ({
        id: card.id,
        heading: card.heading,
        pos: scenes[index]?.pos || 0,
      }));
      onReorder(reorderedScenes);
    }
  };

  if (cards.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-vellum-primary/10 rounded-xl">
            <ChevronRight size={18} className="text-vellum-primary" />
          </div>
          <div>
            <h2 className="font-headline font-bold text-sm text-vellum-primary">Cards View</h2>
            <p className="text-[10px] text-vellum-on-surface-variant font-bold uppercase tracking-widest">
              0 Scenes
            </p>
          </div>
        </div>
        <div className="bg-surface-container-highest border-2 border-dashed border-vellum-outline/20 rounded-2xl p-8 text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-surface-container flex items-center justify-center">
            <FileText size={20} className="text-vellum-on-surface-variant/40" />
          </div>
          <p className="text-xs font-semibold text-vellum-on-surface-variant mb-1">No scenes yet</p>
          <p className="text-[10px] text-vellum-on-surface-variant/60">
            Add scene headings to see them as cards
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-vellum-primary/10 rounded-xl">
            <ChevronRight size={18} className="text-vellum-primary" />
          </div>
          <div>
            <h2 className="font-headline font-bold text-sm text-vellum-primary">Cards View</h2>
            <p className="text-[10px] text-vellum-on-surface-variant font-bold uppercase tracking-widest">
              {cards.length} {cards.length === 1 ? "Scene" : "Scenes"}
            </p>
          </div>
        </div>
        <button className="text-[10px] font-bold text-vellum-primary uppercase tracking-widest hover:underline">
          Grid
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={cards.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {cards.map((card) => (
              <SortableCard
                key={card.id}
                card={card}
                onClick={() => {
                  const scene = scenes.find((s) => s.id === card.id);
                  if (scene) onSelectScene(scene.pos);
                }}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
