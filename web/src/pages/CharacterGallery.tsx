import { Link } from "react-router-dom";
import { ChevronLeft, Plus } from "lucide-react";
import { motion } from "framer-motion";

const CharacterGallery = () => {
    return (
        <div className="min-h-screen bg-vellum-background text-vellum-on-surface font-body p-12">
            <header className="flex justify-between items-end mb-16 max-w-7xl mx-auto">
                <div className="space-y-4">
                    <Link to="/dashboard" className="flex items-center gap-2 text-vellum-on-surface-variant hover:text-vellum-primary transition-colors font-label font-bold text-[10px] uppercase tracking-widest">
                        <ChevronLeft size={14} /> Back to Dashboard
                    </Link>
                    <h1 className="font-headline text-5xl font-extrabold tracking-tight">Character Dossiers</h1>
                    <p className="text-vellum-on-surface-variant font-medium">Manage your cast, their motivations, and arc progressions.</p>
                </div>
                <button className="bg-vellum-primary text-on-primary rounded-xl px-10 py-4 font-label font-bold text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all flex items-center gap-3">
                    <Plus size={18} /> New Character
                </button>
            </header>

            <main className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {/* Character Card Placeholder */}
                <motion.div whileHover={{ y: -5 }} className="bg-surface-container-low rounded-3xl p-10 border border-vellum-outline/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-vellum-primary/5 rounded-full blur-2xl group-hover:bg-vellum-primary/10 transition-all" />
                    <div className="w-20 h-20 rounded-2xl bg-surface-container-highest mb-8 border border-vellum-outline/10 flex items-center justify-center font-headline font-bold text-3xl text-vellum-primary">E</div>
                    <h3 className="font-headline text-2xl font-bold mb-2">Elara Vance</h3>
                    <p className="text-[10px] text-vellum-primary font-bold uppercase tracking-widest mb-6">Protagonist • Tech-Thief</p>
                    <p className="text-sm text-vellum-on-surface-variant leading-relaxed line-clamp-2 italic">"I don't steal memories. I liberate them from people who don't deserve them."</p>
                    <div className="mt-10 border-t border-vellum-outline/5 pt-6 flex justify-between items-center">
                        <span className="text-[10px] font-bold text-vellum-on-surface-variant uppercase tracking-widest">Appearances: 14</span>
                        <button className="text-vellum-primary font-bold text-xs hover:underline decoration-vellum-primary/30">View Dossier</button>
                    </div>
                </motion.div>

                {/* Blank State */}
                <button className="border-2 border-dashed border-vellum-outline/10 rounded-3xl flex flex-col items-center justify-center p-12 hover:border-vellum-primary/40 hover:bg-vellum-primary/5 transition-all group aspect-square">
                    <div className="w-14 h-14 rounded-full bg-surface-container-highest flex items-center justify-center mb-6 group-hover:bg-vellum-primary group-hover:text-on-primary transition-colors">
                        <Plus size={28} />
                    </div>
                    <span className="font-headline font-bold text-lg">Add Character</span>
                </button>
            </main>
        </div>
    );
};

export default CharacterGallery;
