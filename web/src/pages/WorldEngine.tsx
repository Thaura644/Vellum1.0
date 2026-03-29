import { Link } from "react-router-dom";
import { ChevronLeft, Plus, Globe, MapPin, Sparkles } from "lucide-react";

const WorldEngine = () => {
    return (
        <div className="min-h-screen bg-vellum-background text-vellum-on-surface font-body p-12">
            <header className="flex justify-between items-end mb-16 max-w-7xl mx-auto">
                <div className="space-y-4">
                    <Link to="/dashboard" className="flex items-center gap-2 text-vellum-on-surface-variant hover:text-vellum-primary transition-colors font-label font-bold text-[10px] uppercase tracking-widest">
                        <ChevronLeft size={14} /> Back to Dashboard
                    </Link>
                    <h1 className="font-headline text-5xl font-extrabold tracking-tight">World Engine</h1>
                    <p className="text-vellum-on-surface-variant font-medium">Build the foundations of your universe: Locations, Lore, and Rules.</p>
                </div>
                <button className="bg-tertiary text-on-tertiary rounded-xl px-10 py-4 font-label font-bold text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all flex items-center gap-3 shadow-lg shadow-tertiary/10">
                    <Plus size={18} /> New Entry
                </button>
            </header>

            <main className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
                <div className="md:col-span-1 space-y-4">
                    <WorldTab icon={<Globe size={16}/>} label="Lore & History" active />
                    <WorldTab icon={<MapPin size={16}/>} label="Locations" />
                    <WorldTab icon={<Sparkles size={16}/>} label="Magic/Tech Rules" />
                </div>

                <div className="md:col-span-3 bg-surface-container-low rounded-3xl min-h-[600px] border border-vellum-outline/5 p-12 flex flex-col items-center justify-center text-center">
                    <div className="w-24 h-24 rounded-full bg-surface-container-highest flex items-center justify-center mb-10 text-vellum-on-surface-variant/40">
                        <Globe size={48} />
                    </div>
                    <h2 className="font-headline text-2xl font-bold mb-4">No Lore Entries Yet</h2>
                    <p className="text-vellum-on-surface-variant max-w-sm mb-12">Every great story starts with a foundation. Define your world's history to ensure internal consistency.</p>
                    <button className="bg-vellum-primary/10 text-vellum-primary px-8 py-3 rounded-xl font-label text-[10px] font-bold uppercase tracking-widest hover:bg-vellum-primary hover:text-on-primary transition-all">
                        Create First Lore Document
                    </button>
                </div>
            </main>
        </div>
    );
};

const WorldTab = ({ icon, label, active = false }: any) => (
    <button className={`w-full text-left font-label rounded-xl px-6 py-4 flex items-center gap-4 transition-all ${active ? 'bg-surface-container-highest text-vellum-primary border border-vellum-primary/10' : 'text-vellum-on-surface-variant hover:bg-surface-container-low'}`}>
        <span className="opacity-80">{icon}</span>
        <span className="font-bold text-sm tracking-tight">{label}</span>
    </button>
);

export default WorldEngine;
