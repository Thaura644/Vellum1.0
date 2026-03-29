import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, Plus, LayoutGrid, List, MoreHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import ThemeToggle from "../components/ThemeToggle";

const BeatBoard = () => {
    const [beats] = useState([
        { id: "1", title: "The Inciting Incident", content: "Galaxy discovers the secret code.", color: "bg-vellum-primary/10", act: 1 },
        { id: "2", title: "Meeting the Mentor", content: "Old Man Revision explains the history.", color: "bg-tertiary/10", act: 1 },
        { id: "3", title: "Crossing the Threshold", content: "Entering the Digital Void.", color: "bg-green-500/10", act: 2 },
    ]);

    const acts = [1, 2, 3];

    return (
        <div className="min-h-screen bg-vellum-background text-vellum-on-surface font-body flex flex-col">
            {/* Top Bar */}
            <nav className="bg-[#131314] border-b border-vellum-outline/10 px-8 py-4 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-8">
                    <Link to="/editor" className="p-2 text-vellum-on-surface-variant hover:text-vellum-primary transition-colors">
                        <ChevronLeft size={20} />
                    </Link>
                    <div className="flex flex-col">
                        <h1 className="text-xl font-headline font-extrabold tracking-tight text-on-surface">Visual Outline</h1>
                        <p className="text-[10px] text-vellum-on-surface-variant font-bold uppercase tracking-widest opacity-60">Project: Neon Shadows</p>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <ThemeToggle />
                    <div className="flex bg-surface-container-low p-1.5 rounded-xl border border-vellum-outline/10 text-xs font-bold uppercase tracking-widest font-label">
                        <button className="flex items-center gap-2 px-4 py-2 bg-vellum-primary text-on-primary rounded-lg shadow-lg shadow-vellum-primary/10">
                            <LayoutGrid size={14} /> Corkboard
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 text-vellum-on-surface-variant hover:text-vellum-primary transition-colors">
                            <List size={14} /> List View
                        </button>
                    </div>
                    <button className="bg-vellum-primary text-on-primary rounded-xl px-6 py-3 font-label font-bold text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all flex items-center gap-3">
                        <Plus size={16} /> New Beat
                    </button>
                </div>
            </nav>

            <main className="flex-1 p-12 flex gap-10 overflow-x-auto no-scrollbar">
                {acts.map((act) => (
                    <div key={act} className="flex flex-col gap-8 w-96 shrink-0 h-full">
                        <header className="flex justify-between items-end border-b border-vellum-outline/10 pb-4 px-2">
                            <div>
                                <h2 className="text-xs font-label font-bold text-vellum-primary uppercase tracking-[0.3em]">Act {act}</h2>
                                <h3 className="font-headline font-bold text-2xl mt-1">{act === 1 ? 'Discovery' : act === 2 ? 'Confrontation' : 'Resolution'}</h3>
                            </div>
                            <span className="text-[10px] font-bold text-vellum-on-surface-variant uppercase tracking-widest">
                                {beats.filter(b => b.act === act).length} BEATS
                            </span>
                        </header>
                        
                        <div className="flex-1 space-y-6">
                            {beats.filter(b => b.act === act).map((beat) => (
                                <motion.div
                                    key={beat.id}
                                    layoutId={beat.id}
                                    whileHover={{ y: -5 }}
                                    className={`p-8 rounded-2xl border border-vellum-outline/5 bg-surface-container-low min-h-[180px] cursor-pointer group relative overflow-hidden flex flex-col justify-between`}
                                >
                                    <div className="absolute top-0 left-0 w-1 h-full bg-vellum-primary opacity-20 group-hover:opacity-100 transition-opacity" />
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-lg font-headline font-bold text-on-surface">{beat.title}</h3>
                                        <button className="text-vellum-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity"><MoreHorizontal size={16}/></button>
                                    </div>
                                    <p className="text-sm text-vellum-on-surface-variant leading-relaxed font-medium">
                                        {beat.content}
                                    </p>
                                    <div className="mt-8 flex justify-between items-center text-[9px] font-bold text-vellum-on-surface-variant uppercase tracking-widest">
                                        <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-vellum-primary" /> SCENE 12</span>
                                        <div className="flex gap-1.5 opacity-60">
                                            <div className="w-2.5 h-2.5 rounded-sm bg- Vellums-outline" />
                                            <div className="w-2.5 h-2.5 rounded-sm bg-vellum-primary/20" />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            <button className="w-full py-10 rounded-2xl border-2 border-dashed border-vellum-outline/10 text-vellum-on-surface-variant hover:border-vellum-primary/40 hover:text-vellum-primary hover:bg-vellum-primary/5 transition-all flex flex-col items-center justify-center gap-2 group">
                                <Plus size={24} className="group-hover:scale-110 transition-transform" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Add Beat Card</span>
                            </button>
                        </div>
                    </div>
                ))}
            </main>
        </div>
    );
};

export default BeatBoard;
