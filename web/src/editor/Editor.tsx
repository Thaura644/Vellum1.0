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
  Search, Bell, Settings, FileText, ChevronDown,
  Camera, MoreHorizontal, ChevronsRight
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
    const [project, setProject] = useState<any>(null);

    useEffect(() => {
        if (!_id) return;
        
        // Fetch specific Project Metadata
        const fetchProjectDetails = async () => {
            try {
                const res = await fetch(`http://localhost:3001/api/projects/${_id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) setProject(await res.json());
            } catch (err) {
                console.error(err);
            }
        };
        fetchProjectDetails();

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
                        // Will be populated dynamically from project metadata as
                        // the user creates characters and locations.
                        const definitions: string[] = [];
                        return definitions.filter(item =>
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
                    <h2 className="text-xs font-bold uppercase tracking-widest text-vellum-on-surface/60">
                        {project ? `${project.title} • ${project.type}` : 'Loading Metadata...'}
                    </h2>
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
            
            {/* Top Formatting Toolbar (WriterDuet Style) */}
            <div className="fixed top-16 w-full z-40 bg-[#1a1a1b] border-b border-vellum-outline/5 h-16 flex justify-start md:justify-center items-center gap-1 md:gap-2 px-4 shadow-xl">
                <ToolbarButton icon={<Layers size={18} />} label="Scene" onClick={() => editor?.chain().focus().setNode('sceneHeading').run()} active={editor?.isActive('sceneHeading')} />
                <ToolbarButton icon={<Type size={18} />} label="Action" onClick={() => editor?.chain().focus().setNode('action').run()} active={editor?.isActive('action')} />
                <ToolbarButton icon={<Users size={18} />} label="Character" onClick={() => editor?.chain().focus().setNode('character').run()} active={editor?.isActive('character')} />
                <ToolbarButton icon={<MoreHorizontal size={18} />} label="Parens" onClick={() => editor?.chain().focus().setNode('parenthetical').run()} active={editor?.isActive('parenthetical')} />
                <ToolbarButton icon={<MessageSquare size={18} />} label="Dialogue" onClick={() => editor?.chain().focus().setNode('dialogue').run()} active={editor?.isActive('dialogue')} />
                <ToolbarButton icon={<ChevronsRight size={18} />} label="Transition" onClick={() => editor?.chain().focus().setNode('transition').run()} active={editor?.isActive('transition')} />
                <ToolbarButton icon={<Camera size={18} />} label="Shot" onClick={() => editor?.chain().focus().setNode('shot').run()} active={editor?.isActive('shot')} />
                
                <div className="w-px h-8 bg-vellum-outline/20 mx-4 hidden md:block" />
                <ToolbarButton icon={<FileText size={18} />} label="Text" onClick={() => editor?.chain().focus().setParagraph().run()} active={editor?.isActive('paragraph')} />
                <ToolbarButton icon={<StickyNote size={18} />} label="Note" onClick={() => { setRightSidebarOpen(true); setRightSidebarTab("notes"); }} active={rightSidebarOpen && rightSidebarTab === 'notes'} />
            </div>

            <div className="flex flex-1 pt-[128px]">
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
                        <div className="p-5 bg-surface-container-highest border border-dashed border-vellum-outline/10 rounded-2xl text-center mt-4 mx-2">
                            <p className="text-[10px] text-vellum-primary font-bold uppercase tracking-widest mb-2">Outline Empty</p>
                            <p className="text-xs text-vellum-on-surface-variant font-medium leading-relaxed">Scenes will automatically appear here as you write.</p>
                        </div>
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
                            <section>
                                <div className="bg-surface-container border border-dashed border-vellum-outline/20 rounded-xl p-8 text-center mt-4">
                                    <p className="text-xs text-vellum-on-surface-variant font-medium">No history recorded yet. Keep typing to generate snapshots!</p>
                                </div>
                            </section>
                        )}
                        {rightSidebarTab === "characters" && (
                            <section>
                                <div className="bg-surface-container border border-dashed border-vellum-outline/20 rounded-xl p-8 text-center mt-4">
                                    <p className="text-xs text-vellum-on-surface-variant font-medium">No characters tracked. They will appear here.</p>
                                </div>
                            </section>
                        )}
                        {rightSidebarTab === "locations" && (
                            <section>
                                <div className="bg-surface-container border border-dashed border-vellum-outline/20 rounded-xl p-8 text-center mt-4">
                                    <p className="text-xs text-vellum-on-surface-variant font-medium">No locations pinned.</p>
                                </div>
                            </section>
                        )}
                        {rightSidebarTab === "notes" && (
                            <section>
                                <div className="bg-surface-container border border-dashed border-vellum-outline/20 rounded-xl p-8 text-center mt-4">
                                    <p className="text-xs text-vellum-on-surface-variant font-medium">Attach scene notes to keep track of brilliant ideas.</p>
                                </div>
                            </section>
                        )}
                    </div>
            {/* Right Panel (Multi-Tab) */}
            </div>

            {/* Bottom floating toggles */}
            <div className="fixed bottom-8 left-8 flex gap-4 z-50">
               <button 
                  onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
                  className={`p-3 rounded-full glass-panel shadow-xl transition-all ${leftSidebarOpen ? 'bg-vellum-primary/20 text-vellum-primary border border-vellum-primary/30' : 'bg-surface-container-high/80 text-vellum-on-surface-variant hover:text-on-surface border border-white/5'}`}
               >
                  <BookOpen size={18} />
               </button>
            </div>
            
            <div className="fixed bottom-8 right-8 flex gap-4 z-50">
               <button 
                  onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
                  className={`p-3 rounded-full glass-panel shadow-xl transition-all ${rightSidebarOpen ? 'bg-vellum-primary/20 text-vellum-primary border border-vellum-primary/30' : 'bg-surface-container-high/80 text-vellum-on-surface-variant hover:text-on-surface border border-white/5'}`}
               >
                  <MessageSquare size={18} />
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

const ToolbarButton = ({ icon, label, active, onClick }: any) => (
    <button 
        onClick={onClick} 
        className={`flex flex-col items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl transition-colors min-w-[70px] ${active ? 'bg-vellum-primary/10 text-vellum-primary' : 'text-vellum-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'}`}
    >
        {icon}
        <span className="text-[8px] font-bold uppercase tracking-[0.15em] opacity-80">{label}</span>
    </button>
);

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
