import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import CharacterCount from "@tiptap/extension-character-count";
import Typography from "@tiptap/extension-typography";
import * as Y from "yjs";
import { HocuspocusProvider } from "@hocuspocus/provider";
import { SceneHeading, Action, Character, Dialogue, Parenthetical, Transition, Shot, StageDirection, ScreenplayShortcuts } from "./ScreenplayExtension";
import { SmartType } from "./SmartType";
import ThemeToggle from "../components/ThemeToggle";
import { useAuthStore } from "../store/useAuthStore";
import { 
  Type, 
  MessageSquare, Edit3, 
  BookOpen, Layers, Users, MapPin, StickyNote,
  Search, Bell, Settings, FileText, ChevronDown
} from "lucide-react";

import { useMemo } from "react";

const EditorWorkspace = () => {
    const { id: _id } = useParams();
    
    // Create a fresh Y.Doc for this specific document render
    const ydoc = useMemo(() => new Y.Doc(), [_id]);
    const { token } = useAuthStore();
    const [status, setStatus] = useState("Offline");
    const [typewriterMode, setTypewriterMode] = useState(false);
    const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
    const [rightSidebarTab, setRightSidebarTab] = useState<"revisions" | "characters" | "locations" | "notes">("revisions");
    const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
    const [fontFamily, setFontFamily] = useState<string>("Courier Prime, Courier, monospace");
    const [fontSize, setFontSize] = useState<string>("12pt");

    useEffect(() => {
        const docId = _id || "vellum-doc";
        
        const newProvider = new HocuspocusProvider({
            url: "ws://localhost:3001",
            name: docId,
            document: ydoc,
            token: token || "unauthenticated"
        });

        newProvider.on("synced", () => setStatus("Synced"));
        newProvider.on("status", ({ status }: any) => {
            if (status === "connecting") setStatus("Connecting...");
            if (status === "disconnected") setStatus("Offline");
        });

        return () => {
            newProvider.disconnect();
            newProvider.destroy();
        };
    }, [_id]);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: false,
                bulletList: false,
                orderedList: false,
            }),
            Collaboration.configure({
                document: ydoc,
            }),
            CharacterCount,
            Typography,
            SceneHeading,
            Action,
            Character,
            Dialogue,
            Parenthetical,
            Transition,
            Shot,
            StageDirection,
            ScreenplayShortcuts,
            SmartType.configure({
                suggestion: {
                    items: ({ query }: any) => {
                        if (!editor) return [];
                        const characters = ["ELARA", "SARAH", "ELIAS", "DRIVER", "OFFICER"];
                        const locations = ["INT. APARTMENT", "EXT. STREET", "INT. DATA VAULT", "EXT. NEON DOWNTOWN"];
                        return [...characters, ...locations].filter(item => 
                            item.toLowerCase().startsWith(query.toLowerCase())
                        ).slice(0, 5);
                    }
                }
            }),
        ],
        editorProps: {
            attributes: {
                class: `prose prose-sm sm:prose lg:prose-lg mx-auto focus:outline-none screenplay-editor max-w-[816px] w-[816px] min-h-[1056px] bg-[#fdfdfd] text-[#111111] px-[96px] py-[96px] shadow-[0_0_40px_rgba(0,0,0,0.05)] dark:shadow-[0_0_40px_rgba(0,0,0,0.4)]`,
            },
        },
    });

    const exportPDF = async () => {
        if (!editor) return;
        setStatus("Exporting...");
        try {
            const content = editor.getHTML();
            const response = await fetch("http://localhost:3001/api/export/pdf", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content }),
            });
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "script.pdf";
            a.click();
            setStatus("Synced");
        } catch (error) {
            console.error(error);
            setStatus("Error");
        }
    };

    return (
        <div className="h-screen bg-surface-container-lowest text-vellum-on-surface font-body overflow-hidden flex flex-col">
            {/* Top Navigation */}
            <header className="fixed top-0 w-full z-50 bg-[#131314] flex justify-between items-center px-8 h-16 border-b border-vellum-outline/10">
                <div className="flex items-center gap-6">
                    <Link to="/dashboard" className="text-2xl font-headline font-extrabold tracking-tighter text-vellum-primary">Vellum</Link>
                    <div className="h-4 w-px bg-vellum-outline/20" />
                    <h2 className="text-xs font-bold uppercase tracking-widest text-vellum-on-surface/60">Neon Shadows • Draft 4</h2>
                </div>
                
                <div className="flex items-center gap-6">
                    <div className="hidden lg:flex items-center gap-4 border-r border-vellum-outline/10 pr-6 mr-2">
                        <div className="relative flex items-center bg-surface-container-lowest border border-vellum-outline/20 rounded-full px-3 py-1.5 focus-within:border-vellum-primary/40 transition-colors">
                            <Type size={14} className="text-vellum-on-surface-variant mr-1" />
                            <select 
                                value={fontFamily}
                                onChange={(e) => setFontFamily(e.target.value)}
                                className="appearance-none bg-transparent outline-none border-none focus:ring-0 text-[11px] font-bold text-on-surface uppercase tracking-widest cursor-pointer pr-6 pl-2"
                            >
                                <option value="Courier Prime, Courier, monospace">Courier (Script)</option>
                                <option value="Inter, sans-serif">Inter (Modern)</option>
                                <option value="Merriweather, Georgia, serif">Merriweather (Novel)</option>
                            </select>
                            <ChevronDown size={14} className="text-vellum-on-surface-variant absolute right-3 pointer-events-none" />
                        </div>
                        <div className="relative flex items-center bg-surface-container-lowest border border-vellum-outline/20 rounded-full px-2 py-1.5 w-20 focus-within:border-vellum-primary/40 transition-colors">
                            <select 
                                value={fontSize}
                                onChange={(e) => setFontSize(e.target.value)}
                                className="appearance-none bg-transparent outline-none border-none focus:ring-0 text-[11px] font-bold text-on-surface uppercase tracking-widest cursor-pointer w-full text-center"
                            >
                                <option value="10pt">10pt</option>
                                <option value="12pt">12pt</option>
                                <option value="14pt">14pt</option>
                                <option value="16pt">16pt</option>
                            </select>
                            <ChevronDown size={14} className="text-vellum-on-surface-variant absolute right-2 pointer-events-none" />
                        </div>
                    </div>

                    <div className="hidden md:flex items-center bg-surface-container-lowest px-4 py-1.5 rounded-full border border-vellum-outline/20">
                        <Search size={14} className="text-vellum-on-surface-variant" />
                        <input className="bg-transparent border-none focus:ring-0 text-xs w-48 text-on-surface ml-2" placeholder="Search manuscript..." type="text"/>
                    </div>
                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        <button className="p-2 text-vellum-on-surface-variant hover:bg-surface-container-high rounded-full transition-all"><Bell size={18}/></button>
                        <button className="p-2 text-vellum-on-surface-variant hover:bg-surface-container-high rounded-full transition-all"><Settings size={18}/></button>
                        <div className="h-8 w-8 rounded-full overflow-hidden border border-vellum-primary/20 bg-surface-container-high" />
                    </div>
                </div>
            </header>

            <div className="flex flex-1 pt-16">
                {/* Left Sidebar (Navigator) */}
                <aside className={`w-64 bg-surface-container-low border-r border-vellum-outline/10 flex flex-col transition-all overflow-hidden ${leftSidebarOpen ? 'ml-0' : '-ml-64'}`}>
                    <div className="p-6 border-b border-vellum-outline/5 mb-4">
                        <div className="flex items-center gap-3 mb-1">
                            <Layers size={16} className="text-vellum-primary" />
                            <span className="font-headline font-bold text-sm text-vellum-primary">Navigator</span>
                        </div>
                        <p className="text-[10px] text-vellum-on-surface-variant font-bold uppercase tracking-widest opacity-60">5 Scenes • 12 Pages</p>
                    </div>
                    <div className="flex-1 overflow-y-auto px-4 space-y-1 py-1 transform duration-300">
                        <NavItem icon={<FileText size={16}/>} label="Scene 1: Data Vault" active />
                        <NavItem icon={<FileText size={16}/>} label="Scene 2: Neon Alley" />
                        <NavItem icon={<Users size={16}/>} label="Characters" />
                        <NavItem icon={<MapPin size={16}/>} label="Locations" />
                        <NavItem icon={<StickyNote size={16}/>} label="Scene Notes" />
                    </div>
                    <div className="p-6 mt-auto">
                        <button onClick={exportPDF} className="w-full bg-vellum-primary text-on-primary rounded-xl py-3 font-label font-bold text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-vellum-primary/10">
                            Export PDF
                        </button>
                    </div>
                </aside>

                {/* Main Script Canvas */}
                <main className={`flex-1 overflow-y-auto bg-surface-container-lowest no-scrollbar scroll-smooth transition-all ${typewriterMode ? 'pt-64' : 'pt-20'} pb-64`}>
                    <div className="flex flex-col items-center min-h-screen relative">
                        {/* Page Container */}
                        <div className="relative" style={{ fontFamily, fontSize }}>
                            <div className="absolute -left-12 top-0 h-full w-px bg-vellum-outline/10 hidden lg:block" />
                            <EditorContent editor={editor} className="script-shadow transition-all duration-300 rounded-sm" />
                        </div>
                    </div>
                </main>

                {/* Right Panel (Multi-Tab) */}
                <aside className={`w-80 bg-surface-container-low border-l border-vellum-outline/10 flex flex-col transition-all ${rightSidebarOpen ? 'mr-0' : '-mr-80'}`}>
                    {/* Tabs Header */}
                    <div className="p-6 border-b border-vellum-outline/5 flex flex-wrap gap-2">
                        {[
                            { id: "revisions", label: "Revisions" },
                            { id: "characters", label: "Characters" },
                            { id: "locations", label: "Locations" },
                            { id: "notes", label: "Notes" }
                        ].map(tab => (
                            <button 
                                key={tab.id}
                                onClick={() => setRightSidebarTab(tab.id as any)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors ${rightSidebarTab === tab.id ? 'bg-vellum-primary/10 text-vellum-primary' : 'text-vellum-on-surface-variant hover:bg-surface-container hover:text-vellum-primary'}`}
                            >
                                {tab.label.substring(0, 3)}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 space-y-10 no-scrollbar">
                        {rightSidebarTab === "revisions" && (
                            <>
                                <section>
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-2.5 h-2.5 rounded-full bg-vellum-primary shadow-[0_0_10px_rgba(173,198,255,0.4)]" />
                                        <div>
                                            <p className="text-xs font-bold text-on-surface font-label">V1.2 Final Polish</p>
                                            <p className="text-[10px] text-vellum-on-surface-variant font-bold uppercase tracking-widest opacity-60">Today, 2:45 PM by You</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 opacity-40">
                                        <div className="w-2.5 h-2.5 rounded-full bg-vellum-outline" />
                                        <div>
                                            <p className="text-xs font-bold text-on-surface font-label">V1.1 Character Update</p>
                                            <p className="text-[10px] text-vellum-on-surface-variant font-bold uppercase tracking-widest opacity-60">Yesterday, 11:20 AM</p>
                                        </div>
                                    </div>
                                </section>
                            </>
                        )}
                        {rightSidebarTab === "characters" && (
                            <section className="space-y-4">
                                <h3 className="font-headline font-bold text-xs tracking-[0.2em] text-on-surface uppercase opacity-80 mb-6">Active Characters</h3>
                                <div className="p-4 bg-surface-container rounded-xl border border-vellum-outline/5">
                                    <h4 className="font-bold text-sm text-vellum-primary">ELARA (28)</h4>
                                    <p className="text-xs text-vellum-on-surface-variant mt-2 leading-relaxed">A disillusioned hacker trying to clear her name. Fast-talking, cynical.</p>
                                </div>
                                <div className="p-4 bg-surface-container rounded-xl border border-vellum-outline/5">
                                    <h4 className="font-bold text-sm text-on-surface">DR. SILAS (50s)</h4>
                                    <p className="text-xs text-vellum-on-surface-variant mt-2 leading-relaxed">The architect of the Data Vault. Meticulous, paranoid.</p>
                                </div>
                            </section>
                        )}
                        {rightSidebarTab === "locations" && (
                            <section className="space-y-4">
                                <h3 className="font-headline font-bold text-xs tracking-[0.2em] text-on-surface uppercase opacity-80 mb-6">Scene Locations</h3>
                                <div className="p-4 bg-surface-container rounded-xl border border-vellum-outline/5">
                                    <h4 className="font-bold text-sm text-vellum-primary">INT. DATA VAULT</h4>
                                    <p className="text-xs text-vellum-on-surface-variant mt-2 leading-relaxed">Cold, clinical, softly illuminated by server racks. High security.</p>
                                </div>
                            </section>
                        )}
                        {rightSidebarTab === "notes" && (
                            <section className="space-y-6">
                                <h3 className="font-headline font-bold text-xs tracking-[0.2em] text-on-surface uppercase opacity-80 mb-6">Scene Notes</h3>
                                <div className="bg-tertiary-container/30 border-l-4 border-tertiary p-5 rounded-xl">
                                    <p className="text-[10px] text-tertiary font-bold uppercase tracking-widest mb-2">Creative Spark</p>
                                    <p className="text-sm text-on-surface leading-relaxed italic font-medium opacity-90">
                                        "Maybe the rain shouldn't start until Elias finds the locket. Heighten the tension with silence."
                                    </p>
                                </div>
                                <div className="bg-surface-container-highest/40 p-5 rounded-xl border border-vellum-outline/5">
                                    <p className="text-[10px] text-vellum-on-surface-variant font-bold uppercase tracking-widest mb-2">Continuity</p>
                                    <p className="text-sm text-on-surface leading-relaxed font-medium">
                                        Check if Sarah's coat was already wet in the previous scene at the bus stop.
                                    </p>
                                </div>
                            </section>
                        )}
                    </div>
                </aside>
            </div>

            {/* Floating Focus Toolbar */}
            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-6">
                <div className="bg-surface-bright/80 backdrop-blur-2xl rounded-full px-8 py-4 flex items-center gap-8 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] border border-white/10 ring-1 ring-white/5">
                    <button 
                        onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
                        className={`transition-colors p-2 rounded-full ${leftSidebarOpen ? 'text-vellum-primary' : 'text-vellum-on-surface-variant hover:text-vellum-primary'}`}
                    >
                        <BookOpen size={20} />
                    </button>
                    <div className="w-px h-6 bg-vellum-outline/20" />
                    <button className="text-vellum-on-surface-variant hover:text-vellum-primary transition-colors flex items-center gap-3 active:scale-95">
                        <Edit3 size={18} />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Write</span>
                    </button>
                    <div className="w-px h-6 bg-vellum-outline/20" />
                    <div className="flex gap-8">
                        <button onClick={() => editor?.chain().focus().setNode("sceneHeading").run()} className="text-vellum-on-surface-variant hover:text-vellum-primary transition-all font-bold text-[10px] uppercase tracking-widest">SCN</button>
                        <button onClick={() => editor?.chain().focus().setNode("character").run()} className="text-vellum-on-surface-variant hover:text-vellum-primary transition-all font-bold text-[10px] uppercase tracking-widest">CHR</button>
                        <button onClick={() => editor?.chain().focus().setNode("dialogue").run()} className="text-vellum-on-surface-variant hover:text-vellum-primary transition-all font-bold text-[10px] uppercase tracking-widest">DIA</button>
                    </div>
                    <div className="w-px h-6 bg-vellum-outline/20" />
                    <button 
                         onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
                         className={`transition-colors p-2 rounded-full ${rightSidebarOpen ? 'text-vellum-primary' : 'text-vellum-on-surface-variant hover:text-vellum-primary'}`}
                    >
                        <MessageSquare size={20} />
                    </button>
                </div>
                
                <button 
                    onClick={() => setTypewriterMode(!typewriterMode)}
                    className={`p-4 rounded-full glass-panel shadow-2xl transition-all ${typewriterMode ? 'bg-vellum-primary text-on-primary' : 'text-vellum-on-surface-variant hover:text-vellum-primary border border-white/5'}`}
                >
                    <Type size={20} />
                </button>
            </div>

            {/* Status Indicator */}
            <div className="fixed bottom-6 right-8 flex items-center gap-3 bg-surface-container-high/40 backdrop-blur-md px-4 py-1.5 rounded-full border border-vellum-outline/10 group">
                <div className={`w-2 h-2 rounded-full ${status === 'Synced' ? 'bg-green-500' : status === 'Offline' ? 'bg-yellow-500' : 'bg-red-500'} animate-pulse`} />
                <span className="text-[10px] font-bold uppercase tracking-widest text-vellum-on-surface-variant/80 font-label">{status}</span>
            </div>
        </div>
    );
};

const NavItem = ({ icon, label, active = false }: any) => (
  <button className={`w-full text-left font-label rounded-xl px-4 py-2.5 flex items-center gap-3 transition-all active:scale-95 duration-100 ${active ? 'bg-surface-container-highest text-vellum-primary border border-vellum-primary/10 pl-5' : 'text-vellum-on-surface-variant hover:bg-surface-container-highest/50 hover:text-on-surface'}`}>
    <span className="opacity-80 scale-90">{icon}</span>
    <span className="font-bold text-[13px] tracking-tight">{label}</span>
  </button>
);

export default function Editor() {
    const { id } = useParams();
    // The key forces React to completely unmount and remount the EditorWorkspace
    // whenever the URL ID changes. This ensures a 100% clean Yjs document state.
    return <EditorWorkspace key={id || "new"} />;
}
