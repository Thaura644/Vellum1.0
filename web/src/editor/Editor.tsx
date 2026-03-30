import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import CharacterCount from "@tiptap/extension-character-count";
import Typography from "@tiptap/extension-typography";
import * as Y from "yjs";
import { HocuspocusProvider } from "@hocuspocus/provider";
import { SceneHeading, Action, Character, Dialogue, Parenthetical, Transition, Shot, StageDirection, ScreenplayShortcuts } from "./ScreenplayExtension";
import { SmartType } from "./SmartType";
import { useAuthStore } from "../store/useAuthStore";
import { useMetadataStore } from "../store/useMetadataStore";
import { 
  Type, MessageSquare, Edit3, BookOpen, Plus, Trash2, FileDown
} from "lucide-react";

const ydoc = new Y.Doc();

const Editor = () => {
    const { id } = useParams();
    const { token } = useAuthStore();
    const {
        characters, locations, notes,
        fetchMetadata, addCharacter, deleteCharacter,
        addLocation, deleteLocation, addNote, deleteNote,
        loading
    } = useMetadataStore();

    const [status, setStatus] = useState("Offline");
    const [typewriterMode, setTypewriterMode] = useState(false);
    const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
    const [rightSidebarTab, setRightSidebarTab] = useState<"characters" | "locations" | "notes">("characters");
    const [rightSidebarOpen, setRightSidebarOpen] = useState(true);

    const [newItemName, setNewItemName] = useState("");
    const [newItemDesc, setNewItemDesc] = useState("");

    useEffect(() => { if (id) fetchMetadata(id); }, [id, fetchMetadata]);

    useEffect(() => {
        const docId = id || "vellum-doc";
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
        return () => { newProvider.disconnect(); newProvider.destroy(); };
    }, [id]);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({ heading: false, bulletList: false, orderedList: false }),
            Collaboration.configure({ document: ydoc }),
            CharacterCount, Typography, SceneHeading, Action, Character, Dialogue, Parenthetical, Transition, Shot, StageDirection, ScreenplayShortcuts,
            SmartType.configure({
                suggestion: {
                    items: ({ query }: any) => {
                        const suggestions = [...characters.map((c:any) => c.name), ...locations.map((l:any) => l.name)];
                        return suggestions.filter(item => item.toLowerCase().startsWith(query.toLowerCase())).slice(0, 5);
                    }
                }
            }),
        ],
        editorProps: {
            attributes: {
                class: `prose prose-sm sm:prose lg:prose-lg mx-auto focus:outline-none screenplay-editor max-w-[816px] w-[816px] min-h-[1056px] bg-[#fdfdfd] text-[#111111] px-[96px] py-[96px] shadow-lg`,
            },
        },
    });

    const exportPDF = async () => {
        if (!editor) return;
        try {
            const content = editor.getHTML();
            const res = await fetch("http://localhost:3001/api/export/pdf", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content })
            });
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "script.pdf";
            a.click();
        } catch (err) { console.error("Export failed", err); }
    };

    const handleAddItem = async () => {
        if (!id || !newItemName) return;
        if (rightSidebarTab === "characters") await addCharacter(id, newItemName, newItemDesc);
        else if (rightSidebarTab === "locations") await addLocation(id, newItemName, newItemDesc);
        else if (rightSidebarTab === "notes") await addNote(id, newItemName, "General");
        setNewItemName(""); setNewItemDesc("");
    };

    return (
        <div className="flex h-screen bg-vellum-background text-vellum-on-surface font-jakarta overflow-hidden">
            <aside className={`transition-all duration-500 ease-out glass-panel h-full flex flex-col ${leftSidebarOpen ? 'w-[280px]' : 'w-0 opacity-0 overflow-hidden'}`}>
                <div className="p-8 border-b border-vellum-outline/5">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-10 h-10 bg-vellum-primary rounded-xl flex items-center justify-center shadow-lg"><BookOpen className="text-on-primary w-5 h-5" /></div>
                        <h1 className="font-headline font-bold text-xl tracking-tight">Vellum</h1>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
                    <p className="text-[10px] font-bold text-vellum-on-surface-variant uppercase tracking-[0.2em] mb-4 mt-2 px-4 opacity-50">Navigator</p>
                </div>
            </aside>

            <main className="flex-1 h-screen overflow-y-auto bg-surface-container-lowest/30 relative no-scrollbar">
                <div className="max-w-5xl mx-auto py-20 px-4">
                    <div className="bg-[#fdfdfd] script-shadow mx-auto min-h-[1056px] w-[816px] relative ring-1 ring-black/5">
                        <EditorContent editor={editor} />
                    </div>
                </div>
            </main>

            <aside className={`transition-all duration-500 ease-out glass-panel h-full flex flex-col ${rightSidebarOpen ? 'w-[340px]' : 'w-0 opacity-0 overflow-hidden'}`}>
                <div className="p-6 border-b border-vellum-outline/5 flex items-center justify-between">
                    <div className="flex bg-surface-container-high/50 p-1 rounded-xl gap-1">
                        {["characters", "locations", "notes"].map((tab) => (
                            <button key={tab} onClick={() => setRightSidebarTab(tab as any)} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest ${rightSidebarTab === tab ? 'bg-vellum-primary text-on-primary' : 'text-vellum-on-surface-variant hover:text-vellum-primary'}`}>
                                {tab.substring(0, 3)}
                            </button>
                        ))}
                    </div>
                    <button onClick={exportPDF} className="p-2 text-vellum-on-surface-variant hover:text-vellum-primary transition-colors"><FileDown size={18} /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
                    <div className="space-y-4">
                        {rightSidebarTab === "characters" && characters.map((char:any) => (
                            <div key={char.id} className="p-4 bg-surface-container rounded-xl border border-vellum-outline/5 group relative">
                                <h4 className="font-bold text-sm text-vellum-primary uppercase">{char.name}</h4>
                                <p className="text-[11px] text-vellum-on-surface-variant mt-1">{char.description}</p>
                                <button onClick={() => deleteCharacter(char.id)} className="absolute top-4 right-4 text-red-500 opacity-0 group-hover:opacity-100"><Trash2 size={14} /></button>
                            </div>
                        ))}
                        {rightSidebarTab === "locations" && locations.map((loc:any) => (
                            <div key={loc.id} className="p-4 bg-surface-container rounded-xl border border-vellum-outline/5 group relative">
                                <h4 className="font-bold text-sm uppercase">{loc.name}</h4>
                                <p className="text-[11px] text-vellum-on-surface-variant mt-1">{loc.description}</p>
                                <button onClick={() => deleteLocation(loc.id)} className="absolute top-4 right-4 text-red-500 opacity-0 group-hover:opacity-100"><Trash2 size={14} /></button>
                            </div>
                        ))}
                        {rightSidebarTab === "notes" && notes.map((note:any) => (
                            <div key={note.id} className="p-4 bg-tertiary-container/10 border-l-2 border-tertiary rounded-xl group relative">
                                <p className="text-xs italic">{note.content}</p>
                                <button onClick={() => deleteNote(note.id)} className="absolute top-4 right-4 text-red-500 opacity-0 group-hover:opacity-100"><Trash2 size={14} /></button>
                            </div>
                        ))}
                    </div>

                    <div className="pt-6 border-t border-vellum-outline/5 space-y-3">
                        <input value={newItemName} onChange={(e) => setNewItemName(e.target.value)} placeholder={`New ${rightSidebarTab.slice(0, -1)}...`} className="w-full bg-surface-container border border-vellum-outline/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 ring-vellum-primary" />
                        {rightSidebarTab !== "notes" && <textarea value={newItemDesc} onChange={(e) => setNewItemDesc(e.target.value)} placeholder="Description/Bio..." className="w-full bg-surface-container border border-vellum-outline/10 rounded-xl px-4 py-2.5 text-xs h-20 focus:outline-none focus:ring-1 ring-vellum-primary no-scrollbar resize-none" />}
                        <button onClick={handleAddItem} className="w-full bg-vellum-primary text-on-primary py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:brightness-110 flex items-center justify-center gap-2"><Plus size={14} /> Add {rightSidebarTab.slice(0, -1)}</button>
                    </div>
                </div>
            </aside>

            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-6">
                <div className="bg-surface-bright/80 backdrop-blur-2xl rounded-full px-8 py-4 flex items-center gap-8 shadow-2xl border border-white/10">
                    <button onClick={() => setLeftSidebarOpen(!leftSidebarOpen)} className={`p-2 rounded-full ${leftSidebarOpen ? 'text-vellum-primary' : 'text-vellum-on-surface-variant'}`}><BookOpen size={20} /></button>
                    <div className="w-px h-6 bg-vellum-outline/20" />
                    <button className="text-vellum-on-surface-variant flex items-center gap-3"><Edit3 size={18} /><span className="text-[10px] font-bold uppercase tracking-widest">Write</span></button>
                    <div className="w-px h-6 bg-vellum-outline/20" />
                    <div className="flex gap-6">
                        <button onClick={() => editor?.chain().focus().setNode("sceneHeading").run()} className="text-[10px] font-bold uppercase hover:text-vellum-primary">SCN</button>
                        <button onClick={() => editor?.chain().focus().setNode("character").run()} className="text-[10px] font-bold uppercase hover:text-vellum-primary">CHR</button>
                        <button onClick={() => editor?.chain().focus().setNode("dialogue").run()} className="text-[10px] font-bold uppercase hover:text-vellum-primary">DIA</button>
                    </div>
                    <div className="w-px h-6 bg-vellum-outline/20" />
                    <button onClick={() => setRightSidebarOpen(!rightSidebarOpen)} className={`p-2 rounded-full ${rightSidebarOpen ? 'text-vellum-primary' : 'text-vellum-on-surface-variant'}`}><MessageSquare size={20} /></button>
                </div>
                <button onClick={() => setTypewriterMode(!typewriterMode)} className={`p-4 rounded-full glass-panel shadow-2xl transition-all ${typewriterMode ? 'bg-vellum-primary text-on-primary' : 'text-vellum-on-surface-variant'}`}><Type size={20} /></button>
            </div>

            <div className="fixed bottom-6 right-8 flex items-center gap-2 bg-surface-container-high/40 backdrop-blur-md px-3 py-1 rounded-full border border-vellum-outline/10">
                <div className={`w-1.5 h-1.5 rounded-full ${status === 'Synced' ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`} />
                <span className="text-[9px] font-bold uppercase tracking-widest text-vellum-on-surface-variant/80">{status}</span>
            </div>
        </div>
    );
};

export default Editor;
