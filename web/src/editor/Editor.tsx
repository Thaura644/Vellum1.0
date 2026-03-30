import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import CharacterCount from "@tiptap/extension-character-count";
import Typography from "@tiptap/extension-typography";
import TiptapBold from "@tiptap/extension-bold";
import TiptapItalic from "@tiptap/extension-italic";
import TiptapUnderline from "@tiptap/extension-underline";
import * as Y from "yjs";
import { HocuspocusProvider } from "@hocuspocus/provider";
import { SceneHeading, Action, Character, Dialogue, Parenthetical, Transition, Shot, StageDirection, ScreenplayShortcuts, OutlineNote, KeyboardShortcuts, AutoCapitalize } from "./ScreenplayExtension";
import { SmartType } from "./SmartType";
import Comment from "./CommentExtension";
import ThemeToggle from "../components/ThemeToggle";
import CardsView from "../components/CardsView";
import { useAuthStore } from "../store/useAuthStore";
import { 
  Type, 
  MessageSquare, 
  BookOpen, Layers, Users, StickyNote,
  Search, Bell, Settings, FileText, ChevronDown,
  Camera, MoreHorizontal, ChevronsRight,
  Bold as BoldIcon, Italic as ItalicIcon,
  Undo, Redo, Grid3X3, Maximize2, Minimize2,
  Plus, MapPin, Trash2, X, Image, Phone, Mail,
  Copyright, ListOrdered, User,
  Download, Upload, ArrowDownCircle, ArrowUpCircle,
  MessageCircle
} from "lucide-react";

import { useMemo } from "react";

const EditorWorkspace = () => {
    const { id: _id } = useParams();
    
    // Create a fresh Y.Doc for this specific document render
    const ydoc = useMemo(() => new Y.Doc(), [_id]);
    const { token } = useAuthStore();
    const [status, setStatus] = useState("Offline");
    const [focusMode, setFocusMode] = useState(false);
    const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
    const [rightSidebarTab, setRightSidebarTab] = useState<"revisions" | "characters" | "locations" | "notes" | "cards" | "analysis" | "comments" | "acts">("cards");
    const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
    const [fontFamily, setFontFamily] = useState<string>("Courier Prime, Courier, monospace");
    const [fontSize, setFontSize] = useState<string>("12pt");
    const [project, setProject] = useState<any>(null);
    const [scenes, setScenes] = useState<{ id: string; heading: string; pos: number }[]>([]);
    const [pageCount, setPageCount] = useState(1);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editedTitle, setEditedTitle] = useState("");
    
    // Acts state
    const [acts, setActs] = useState<any[]>([]);
    const [showActForm, setShowActForm] = useState(false);
    const [newActTitle, setNewActTitle] = useState("");
    const [newActSummary, setNewActSummary] = useState("");
    
    // Manuscripts state
    const [manuscripts, setManuscripts] = useState<any[]>([]);
    const [currentManuscript, setCurrentManuscript] = useState<any>(null);
    const [showManuscriptForm, setShowManuscriptForm] = useState(false);
    const [newManuscriptTitle, setNewManuscriptTitle] = useState("");
    
    // Characters, Locations, Notes state
    const [characters, setCharacters] = useState<any[]>([]);
    const [locations, setLocations] = useState<any[]>([]);
    const [notes, setNotes] = useState<any[]>([]);
    const [privateNotes, setPrivateNotes] = useState<any[]>([]);
    const [showPrivatePad, setShowPrivatePad] = useState(false);
    const [comments, setComments] = useState<any[]>([]);
    const [showNoteForm, setShowNoteForm] = useState(false);
    const [newNoteContent, setNewNoteContent] = useState("");
    const [newNoteScene, setNewNoteScene] = useState("");
    const [showCharacterForm, setShowCharacterForm] = useState(false);
    const [newCharacterName, setNewCharacterName] = useState("");
    const [newCharacterDescription, setNewCharacterDescription] = useState("");
    const [showLocationForm, setShowLocationForm] = useState(false);
    const [newLocationName, setNewLocationName] = useState("");
    const [newLocationIntExt, setNewLocationIntExt] = useState("INT");
    const [newLocationTimeOfDay, setNewLocationTimeOfDay] = useState("DAY");
    const [showCommentForm, setShowCommentForm] = useState(false);
    const [newCommentContent, setNewCommentContent] = useState("");
    
    // Title page menu state
    const [showTitlePageMenu, setShowTitlePageMenu] = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [showImportMenu, setShowImportMenu] = useState(false);
    const [isCtrlPressed, setIsCtrlPressed] = useState(false);
    
    // Writing modes
    const [typewriterMode, setTypewriterMode] = useState(false);
    
    // Inline comments state
    const [inlineComments, setInlineComments] = useState<{id: string; from: number; to: number; text: string; content: string}[]>([]);
    const [showCommentInput, setShowCommentInput] = useState(false);
    const [commentInputText, setCommentInputText] = useState("");
    const [commentPosition, setCommentPosition] = useState<{from: number; to: number; text: string} | null>(null);
    
    const titlePageItems = [
        { label: "Text", icon: <Type size={16} />, action: () => editor?.chain().focus().setParagraph().run() },
        { label: "Image", icon: <Image size={16} />, action: () => console.log("Insert Image") },
        { label: "Title", icon: <FileText size={16} />, action: () => console.log("Insert Title") },
        { label: "Author", icon: <User size={16} />, action: () => console.log("Insert Author") },
        { label: "Phone", icon: <Phone size={16} />, action: () => console.log("Insert Phone") },
        { label: "E-mail", icon: <Mail size={16} />, action: () => console.log("Insert Email") },
        { label: "Copyright", icon: <Copyright size={16} />, action: () => console.log("Insert Copyright") },
        { label: "Outline", icon: <ListOrdered size={16} />, action: () => editor?.chain().focus().setNode("outlineNote").run() },
    ];

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
            TiptapBold,
            TiptapItalic,
            TiptapUnderline,
            SceneHeading,
            Action,
            Character,
            Dialogue,
            Parenthetical,
            Transition,
            Shot,
            StageDirection,
            OutlineNote,
            ScreenplayShortcuts,
            KeyboardShortcuts,
            AutoCapitalize,
            SmartType,
            Comment,
        ],
        editorProps: {
            attributes: {
                class: `prose prose-sm sm:prose lg:prose-lg mx-auto focus:outline-none screenplay-editor max-w-[816px] w-[816px] min-h-[1056px] bg-[#fdfdfd] text-[#111111] px-[96px] py-[96px] shadow-[0_0_40px_rgba(0,0,0,0.05)] dark:shadow-[0_0_40px_rgba(0,0,0,0.4)]`,
            },
        },
        onUpdate: ({ editor }) => {
            // Update scenes
            const foundScenes: { id: string; heading: string; pos: number }[] = [];
            editor.state.doc.descendants((node: any, pos: number) => {
                if (node.type.name === "sceneHeading") {
                    foundScenes.push({
                        id: Math.random().toString(36).substr(2, 9),
                        heading: node.textContent || "Untitled Scene",
                        pos,
                    });
                }
                return true;
            });
            setScenes(foundScenes);

            // Update page count
            const words = editor.storage.characterCount?.words?.() || 0;
            setPageCount(Math.max(1, Math.ceil(words / 250)));
        },
    });

    useEffect(() => {
        if (!editor) return;
        
        // Initial count
        const foundScenes: { id: string; heading: string; pos: number }[] = [];
        editor.state.doc.descendants((node: any, pos: number) => {
            if (node.type.name === "sceneHeading") {
                foundScenes.push({
                    id: Math.random().toString(36).substr(2, 9),
                    heading: node.textContent || "Untitled Scene",
                    pos,
                });
            }
            return true;
        });
        setScenes(foundScenes);
        const words = editor.storage.characterCount?.words?.() || 0;
        setPageCount(Math.max(1, Math.ceil(words / 250)));
    }, [editor]);

    useEffect(() => {
        if (!_id) return;
        
        // Fetch specific Project Metadata
        const fetchProjectDetails = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/projects/${_id}`, {
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
    }, [_id, token, ydoc]);

    useEffect(() => {
        if (!_id) return;
        const fetchCharacters = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/characters/project/${_id}`, { headers: { Authorization: `Bearer ${token}` } });
                if (res.ok) setCharacters(await res.json());
            } catch (err) { console.error("Failed to fetch characters", err); }
        };
        const fetchLocations = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/locations/project/${_id}`, { headers: { Authorization: `Bearer ${token}` } });
                if (res.ok) setLocations(await res.json());
            } catch (err) { console.error("Failed to fetch locations", err); }
        };
        const fetchNotes = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/notes/project/${_id}`, { headers: { Authorization: `Bearer ${token}` } });
                if (res.ok) {
                    const allNotes = await res.json();
                    setNotes(allNotes.filter((n: any) => !n.isPrivate));
                    setPrivateNotes(allNotes.filter((n: any) => n.isPrivate));
                }
            } catch (err) { console.error("Failed to fetch notes", err); }
        };
        const fetchComments = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/community/${_id}/comments`, { headers: { Authorization: `Bearer ${token}` } });
                if (res.ok) setComments(await res.json());
            } catch (err) { console.error("Failed to fetch comments", err); }
        };
        const fetchActs = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/acts/project/${_id}`, { headers: { Authorization: `Bearer ${token}` } });
                if (res.ok) setActs(await res.json());
            } catch (err) { console.error("Failed to fetch acts", err); }
        };
        fetchCharacters();
        fetchLocations();
        fetchNotes();
        fetchComments();
        fetchActs();
        fetchManuscripts();
    }, [_id, token]);

    const fetchManuscripts = async () => {
        if (!_id) return;
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/manuscripts/project/${_id}`, { headers: { Authorization: `Bearer ${token}` } });
            if (res.ok) {
                const data = await res.json();
                setManuscripts(data);
                if (data.length > 0 && !currentManuscript) {
                    setCurrentManuscript(data[0]);
                }
            }
        } catch (err) { console.error("Failed to fetch manuscripts", err); }
    };

    useEffect(() => {
        if (!editor) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "s") {
                e.preventDefault();
                exportPDF();
            }
            if ((e.ctrlKey || e.metaKey) && e.key === "t") {
                e.preventDefault();
                setTypewriterMode(prev => !prev);
            }
            if (e.ctrlKey || e.metaKey) {
                setIsCtrlPressed(true);
            }
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            if (!(e.ctrlKey || e.metaKey)) {
                setIsCtrlPressed(false);
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("keyup", handleKeyUp);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("keyup", handleKeyUp);
        };
    }, [editor]);

    // Typewriter mode - keep cursor vertically centered
    useEffect(() => {
        if (!editor || !typewriterMode) return;
        
        const editorElement = document.querySelector('.ProseMirror');
        if (!editorElement) return;
        
        const scrollToCursor = () => {
            const cursor = editorElement.querySelector('.ProseMirror-cursor') || 
                          editorElement.querySelector('.collaboration-cursor__caret');
            if (cursor) {
                const cursorRect = cursor.getBoundingClientRect();
                const editorRect = editorElement.getBoundingClientRect();
                const centerOffset = cursorRect.top - editorRect.top - (editorRect.height / 2) + (cursorRect.height / 2);
                editorElement.scrollBy({ top: centerOffset, behavior: 'smooth' });
            }
        };
        
        editor.on('selectionUpdate', scrollToCursor);
        editor.on('blur', scrollToCursor);
        
        return () => {
            editor.off('selectionUpdate', scrollToCursor);
            editor.off('blur', scrollToCursor);
        };
    }, [editor, typewriterMode]);

    const exportPDF = async () => {
        if (!editor) return;
        setStatus("Exporting...");
        try {
            const content = editor.getHTML();
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/export/pdf`, {
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

    const exportFountain = async () => {
        if (!editor) return;
        try {
            const content = editor.getHTML();
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/export/fountain`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content }),
            });
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "script.fountain";
            a.click();
        } catch (error) {
            console.error("Export Fountain failed:", error);
        }
    };

    const exportJSON = async () => {
        if (!editor) return;
        try {
            const content = editor.getHTML();
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/export/json`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content }),
            });
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "script.json";
            a.click();
        } catch (error) {
            console.error("Export JSON failed:", error);
        }
    };

    const importFountain = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const text = await file.text();
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/export/import/fountain`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: text }),
            });
            const data = await response.json();
            if (data.html && editor) {
                editor.commands.setContent(data.html);
            }
        } catch (error) {
            console.error("Import Fountain failed:", error);
        }
    };

    const importJSON = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const text = await file.text();
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/export/import/json`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: text }),
            });
            const data = await response.json();
            if (data.html && editor) {
                editor.commands.setContent(data.html);
            }
        } catch (error) {
            console.error("Import JSON failed:", error);
        }
    };

    return (
        <div className="h-screen bg-surface-container-lowest text-vellum-on-surface font-body overflow-hidden flex flex-col">
            {/* Top Navigation */}
            <header className="fixed top-0 w-full z-50 bg-[#131314] flex justify-between items-center px-8 h-16 border-b border-vellum-outline/10">
                <div className="flex items-center gap-6">
                    <Link to="/dashboard" className="text-2xl font-headline font-extrabold tracking-tighter text-vellum-primary">Vellum</Link>
                    <div className="h-4 w-px bg-vellum-outline/20" />
                    {isEditingTitle ? (
                        <input
                            autoFocus
                            value={editedTitle}
                            onChange={(e) => setEditedTitle(e.target.value)}
                            onBlur={async () => {
                                if (editedTitle.trim() && editedTitle !== project?.title) {
                                    try {
                                        await fetch(`${import.meta.env.VITE_API_URL}/api/projects/${_id}`, {
                                            method: "PATCH",
                                            headers: {
                                                "Content-Type": "application/json",
                                                Authorization: `Bearer ${token}`
                                            },
                                            body: JSON.stringify({ title: editedTitle.trim() })
                                        });
                                        setProject((p: any) => ({ ...p, title: editedTitle.trim() }));
                                    } catch (err) {
                                        console.error("Failed to update title", err);
                                    }
                                }
                                setIsEditingTitle(false);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") e.currentTarget.blur();
                                if (e.key === "Escape") {
                                    setEditedTitle(project?.title || "");
                                    setIsEditingTitle(false);
                                }
                            }}
                            className="bg-transparent border border-vellum-primary/50 rounded px-2 py-1 text-xs font-bold uppercase tracking-widest text-vellum-on-surface/80 outline-none"
                        />
                    ) : (
                        <button
                            onClick={() => {
                                setEditedTitle(project?.title || "");
                                setIsEditingTitle(true);
                            }}
                            className="text-xs font-bold uppercase tracking-widest text-vellum-on-surface/60 hover:text-vellum-primary transition-colors"
                        >
                            {project ? `${project.title} • ${project.type}` : 'Loading Metadata...'}
                        </button>
                    )}
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
            <div className="fixed top-16 w-full z-40 bg-[#1a1a1b] border-b border-vellum-outline/5 h-14 flex justify-start md:justify-center items-center gap-1 md:gap-2 px-4 shadow-xl overflow-x-auto">
                <ToolbarButton icon={<Layers size={16} />} label={isCtrlPressed ? "Ctrl+1" : "Scene"} onClick={() => editor?.chain().focus().setNode('sceneHeading').run()} active={editor?.isActive('sceneHeading')} />
                <ToolbarButton icon={<Type size={16} />} label={isCtrlPressed ? "Ctrl+2" : "Action"} onClick={() => editor?.chain().focus().setNode('action').run()} active={editor?.isActive('action')} />
                <ToolbarButton icon={<Users size={16} />} label={isCtrlPressed ? "Ctrl+3" : "Char"} onClick={() => editor?.chain().focus().setNode('character').run()} active={editor?.isActive('character')} />
                <ToolbarButton icon={<MessageSquare size={16} />} label={isCtrlPressed ? "Ctrl+4" : "Dialog"} onClick={() => editor?.chain().focus().setNode('dialogue').run()} active={editor?.isActive('dialogue')} />
                <ToolbarButton icon={<MoreHorizontal size={16} />} label={isCtrlPressed ? "Ctrl+5" : "Parens"} onClick={() => editor?.chain().focus().insertContent("()").run()} active={editor?.isActive('parenthetical')} />
                <ToolbarButton icon={<ChevronsRight size={16} />} label={isCtrlPressed ? "Ctrl+6" : "Trans"} onClick={() => editor?.chain().focus().setNode('transition').run()} active={editor?.isActive('transition')} />
                <ToolbarButton icon={<Camera size={16} />} label={isCtrlPressed ? "Ctrl+7" : "Shot"} onClick={() => editor?.chain().focus().setNode('shot').run()} active={editor?.isActive('shot')} />
                
                <div className="w-px h-8 bg-vellum-outline/20 mx-3 hidden md:block" />
                
                <ToolbarButton icon={<BoldIcon size={16} />} label="Bold" onClick={() => editor?.chain().focus().toggleBold().run()} active={editor?.isActive('bold')} />
                <ToolbarButton icon={<ItalicIcon size={16} />} label="Italic" onClick={() => editor?.chain().focus().toggleItalic().run()} active={editor?.isActive('italic')} />
                
                <div className="w-px h-8 bg-vellum-outline/20 mx-3 hidden md:block" />
                
                <ToolbarButton icon={<Undo size={16} />} label="Undo" onClick={() => editor?.chain().focus().undo().run()} disabled={!editor?.can().undo()} />
                <ToolbarButton icon={<Redo size={16} />} label="Redo" onClick={() => editor?.chain().focus().redo().run()} disabled={!editor?.can().redo()} />
                
                <div className="w-px h-8 bg-vellum-outline/20 mx-3 hidden md:block" />
                
                <ToolbarButton icon={<FileText size={16} />} label={isCtrlPressed ? "Ctrl+0" : "Text"} onClick={() => editor?.chain().focus().setParagraph().run()} active={editor?.isActive('paragraph')} />
                <ToolbarButton 
                    icon={<BookOpen size={16} />} 
                    label={isCtrlPressed ? "Ctrl+8" : "Title"} 
                    onClick={() => setShowTitlePageMenu(!showTitlePageMenu)} 
                    active={showTitlePageMenu} 
                />
                <ToolbarButton icon={<StickyNote size={16} />} label="Note" onClick={() => { setRightSidebarOpen(true); setRightSidebarTab("notes"); }} active={rightSidebarOpen && rightSidebarTab === 'notes'} />
                <ToolbarButton 
                    icon={<MessageCircle size={16} />} 
                    label="Comment" 
                    onClick={() => {
                        if (editor && !editor.state.selection.empty) {
                            const { from, to } = editor.state.selection;
                            const text = editor.state.doc.textBetween(from, to);
                            setCommentPosition({ from, to, text });
                            setShowCommentInput(true);
                        }
                    }} 
                    active={showCommentInput} 
                />
                
                <div className="flex-1" />
                
                <ToolbarButton 
                    icon={typewriterMode ? <ArrowDownCircle size={16} /> : <ArrowUpCircle size={16} />} 
                    label={isCtrlPressed ? "Ctrl+T" : "Type"} 
                    onClick={() => setTypewriterMode(!typewriterMode)} 
                    active={typewriterMode} 
                />
                <ToolbarButton 
                    icon={<Download size={16} />} 
                    label={isCtrlPressed ? "Ctrl+E" : "Export"} 
                    onClick={() => setShowExportMenu(!showExportMenu)} 
                    active={showExportMenu} 
                />
                <ToolbarButton 
                    icon={<Upload size={16} />} 
                    label={isCtrlPressed ? "Ctrl+I" : "Import"} 
                    onClick={() => setShowImportMenu(!showImportMenu)} 
                    active={showImportMenu} 
                />
                
                <ToolbarButton icon={<Grid3X3 size={16} />} label="Cards" onClick={() => { setRightSidebarOpen(true); setRightSidebarTab("cards"); }} active={rightSidebarOpen && rightSidebarTab === 'cards'} />
                <ToolbarButton icon={focusMode ? <Minimize2 size={16} /> : <Maximize2 size={16} />} label={focusMode ? "Exit" : "Focus"} onClick={() => { setFocusMode(!focusMode); setLeftSidebarOpen(focusMode); setRightSidebarOpen(focusMode); }} active={focusMode} />
            </div>

            {/* Title Page Menu Dropdown */}
            {showTitlePageMenu && (
                <div className="fixed top-28 left-1/2 -translate-x-1/2 z-50 bg-[#1a1a1b] border border-vellum-outline/20 rounded-xl shadow-2xl py-2 min-w-[180px]">
                    {titlePageItems.map((item, index) => (
                        <button
                            key={index}
                            onClick={() => { item.action(); setShowTitlePageMenu(false); }}
                            className="w-full flex items-center gap-3 px-4 py-2 text-vellum-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
                        >
                            <span className="opacity-70">{item.icon}</span>
                            <span className="text-xs font-medium">{item.label}</span>
                            {isCtrlPressed && <span className="ml-auto text-[10px] text-vellum-primary font-bold">Ctrl+{index + 1}</span>}
                        </button>
                    ))}
                </div>
            )}

            {/* Export Menu Dropdown */}
            {showExportMenu && (
                <div className="fixed top-28 right-4 z-50 bg-[#1a1a1b] border border-vellum-outline/20 rounded-xl shadow-2xl py-2 min-w-[160px]">
                    <button onClick={() => { exportPDF(); setShowExportMenu(false); }} className="w-full flex items-center gap-3 px-4 py-2 text-vellum-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors">
                        <span className="opacity-70"><FileText size={16} /></span>
                        <span className="text-xs font-medium">PDF</span>
                    </button>
                    <button onClick={() => { exportFountain(); setShowExportMenu(false); }} className="w-full flex items-center gap-3 px-4 py-2 text-vellum-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors">
                        <span className="opacity-70"><FileText size={16} /></span>
                        <span className="text-xs font-medium">Fountain</span>
                    </button>
                    <button onClick={() => { exportJSON(); setShowExportMenu(false); }} className="w-full flex items-center gap-3 px-4 py-2 text-vellum-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors">
                        <span className="opacity-70"><FileText size={16} /></span>
                        <span className="text-xs font-medium">JSON</span>
                    </button>
                </div>
            )}

            {/* Import Menu Dropdown */}
            {showImportMenu && (
                <div className="fixed top-28 right-4 z-50 bg-[#1a1a1b] border border-vellum-outline/20 rounded-xl shadow-2xl py-2 min-w-[160px]">
                    <label className="w-full flex items-center gap-3 px-4 py-2 text-vellum-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors cursor-pointer">
                        <span className="opacity-70"><FileText size={16} /></span>
                        <span className="text-xs font-medium">Fountain</span>
                        <input type="file" accept=".fountain,.txt" className="hidden" onChange={importFountain} />
                    </label>
                    <label className="w-full flex items-center gap-3 px-4 py-2 text-vellum-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors cursor-pointer">
                        <span className="opacity-70"><FileText size={16} /></span>
                        <span className="text-xs font-medium">JSON</span>
                        <input type="file" accept=".json" className="hidden" onChange={importJSON} />
                    </label>
                </div>
            )}

            {/* Inline Comment Input */}
            {showCommentInput && commentPosition && (
                <div className="fixed z-50 bg-[#1a1a1b] border border-vellum-outline/20 rounded-xl shadow-2xl p-4 min-w-[300px]">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-vellum-primary">Add Comment</span>
                        <button onClick={() => { setShowCommentInput(false); setCommentPosition(null); setCommentInputText(""); }} className="text-vellum-on-surface-variant hover:text-vellum-primary">
                            <X size={14} />
                        </button>
                    </div>
                    <div className="bg-surface-container rounded-lg px-3 py-2 mb-3">
                        <p className="text-xs text-vellum-on-surface-variant italic truncate">"{commentPosition.text}"</p>
                    </div>
                    <textarea
                        value={commentInputText}
                        onChange={(e) => setCommentInputText(e.target.value)}
                        placeholder="Write your comment..."
                        className="w-full bg-surface-container rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-vellum-primary/50 text-vellum-on-surface h-20 resize-none mb-3"
                    />
                    <button 
                        onClick={() => {
                            if (commentInputText.trim() && commentPosition && editor) {
                                const commentId = Math.random().toString(36).substr(2, 9);
                                const newComment = {
                                    id: commentId,
                                    from: commentPosition.from,
                                    to: commentPosition.to,
                                    text: commentPosition.text,
                                    content: commentInputText,
                                };
                                setInlineComments([...inlineComments, newComment]);
                                editor.chain().focus().setMark("comment", { id: commentId }).run();
                                setShowCommentInput(false);
                                setCommentPosition(null);
                                setCommentInputText("");
                            }
                        }}
                        className="w-full bg-vellum-primary text-on-primary font-bold uppercase py-2 rounded-lg text-xs tracking-widest hover:brightness-110"
                    >
                        Add Comment
                    </button>
                </div>
            )}

            <div className="flex flex-1 pt-[128px]">
                {/* Left Sidebar (Manuscripts & Navigator) */}
                <aside className={`w-72 bg-surface-container-low border-r border-vellum-outline/10 flex flex-col transition-all overflow-hidden ${leftSidebarOpen ? 'ml-0' : '-ml-72'}`}>
                    {/* Manuscripts Tabs */}
                    <div className="border-b border-vellum-outline/10">
                        <div className="flex items-center justify-between px-4 pt-4 pb-2">
                            <span className="text-[10px] font-bold text-vellum-primary uppercase tracking-widest">Manuscripts</span>
                            <button 
                                onClick={() => setShowManuscriptForm(true)}
                                className="p-1 hover:bg-surface-container-high rounded-full transition-colors"
                            >
                                <Plus size={14} className="text-vellum-primary" />
                            </button>
                        </div>
                        <div className="flex gap-1 px-2 pb-2 overflow-x-auto no-scrollbar">
                            {manuscripts.map((ms) => (
                                <button
                                    key={ms.id}
                                    onClick={() => setCurrentManuscript(ms)}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                                        currentManuscript?.id === ms.id 
                                            ? 'bg-vellum-primary text-on-primary' 
                                            : 'text-vellum-on-surface-variant hover:bg-surface-container-high'
                                    }`}
                                >
                                    {ms.title}
                                </button>
                            ))}
                            {manuscripts.length === 0 && (
                                <span className="text-xs text-vellum-on-surface-variant px-3 py-1">No manuscripts yet</span>
                            )}
                        </div>
                    </div>

                    {/* Add Manuscript Form */}
                    {showManuscriptForm && (
                        <div className="p-3 border-b border-vellum-outline/10 bg-surface-container-high">
                            <input
                                autoFocus
                                value={newManuscriptTitle}
                                onChange={(e) => setNewManuscriptTitle(e.target.value)}
                                placeholder="Manuscript title..."
                                className="w-full px-3 py-2 text-sm bg-surface-container-lowest border border-vellum-outline/20 rounded-lg text-vellum-on-surface focus:outline-none focus:border-vellum-primary"
                                onKeyDown={async (e) => {
                                    if (e.key === 'Enter' && newManuscriptTitle.trim()) {
                                        try {
                                            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/manuscripts`, {
                                                method: "POST",
                                                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                                                body: JSON.stringify({ title: newManuscriptTitle.trim(), projectId: _id, order: manuscripts.length })
                                            });
                                            if (res.ok) {
                                                const newMs = await res.json();
                                                setManuscripts([...manuscripts, newMs]);
                                                setCurrentManuscript(newMs);
                                            }
                                        } catch (err) { console.error(err); }
                                        setShowManuscriptForm(false);
                                        setNewManuscriptTitle("");
                                    }
                                    if (e.key === 'Escape') {
                                        setShowManuscriptForm(false);
                                        setNewManuscriptTitle("");
                                    }
                                }}
                            />
                            <div className="flex gap-2 mt-2">
                                <button 
                                    onClick={async () => {
                                        if (newManuscriptTitle.trim()) {
                                            try {
                                                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/manuscripts`, {
                                                    method: "POST",
                                                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                                                    body: JSON.stringify({ title: newManuscriptTitle.trim(), projectId: _id, order: manuscripts.length })
                                                });
                                                if (res.ok) {
                                                    const newMs = await res.json();
                                                    setManuscripts([...manuscripts, newMs]);
                                                    setCurrentManuscript(newMs);
                                                }
                                            } catch (err) { console.error(err); }
                                        }
                                        setShowManuscriptForm(false);
                                        setNewManuscriptTitle("");
                                    }}
                                    className="flex-1 py-1.5 text-xs font-bold uppercase bg-vellum-primary text-on-primary rounded-lg"
                                >
                                    Add
                                </button>
                                <button 
                                    onClick={() => { setShowManuscriptForm(false); setNewManuscriptTitle(""); }}
                                    className="flex-1 py-1.5 text-xs font-bold uppercase text-vellum-on-surface-variant hover:bg-surface-container-high rounded-lg"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="p-6 border-b border-vellum-outline/5 mb-4">
                        <div className="flex items-center gap-3 mb-1">
                            <Layers size={16} className="text-vellum-primary" />
                            <span className="font-headline font-bold text-sm text-vellum-primary">Navigator</span>
                        </div>
                        <p className="text-[10px] text-vellum-on-surface-variant font-bold uppercase tracking-widest opacity-60">
                            {scenes.length} {scenes.length === 1 ? 'Scene' : 'Scenes'} • {pageCount} {pageCount === 1 ? 'Page' : 'Pages'}
                        </p>
                    </div>
                    <div className="flex-1 overflow-y-auto px-4 space-y-1 py-1 transform duration-300 no-scrollbar">
                        {scenes.length === 0 ? (
                            <div className="p-5 bg-surface-container-highest border border-dashed border-vellum-outline/10 rounded-2xl text-center mt-4 mx-2">
                                <p className="text-[10px] text-vellum-primary font-bold uppercase tracking-widest mb-2">Outline Empty</p>
                                <p className="text-xs text-vellum-on-surface-variant font-medium leading-relaxed">Scenes will automatically appear here as you write.</p>
                            </div>
                        ) : (
                            scenes.map((scene) => (
                                <button
                                    key={scene.id}
                                    onClick={() => editor?.chain().focus().setTextSelection(scene.pos).scrollIntoView().run()}
                                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-surface-container-highest/50 transition-colors group"
                                >
                                    <span className="text-[9px] font-bold text-vellum-primary/40 group-hover:text-vellum-primary block uppercase tracking-wider mb-0.5">
                                        Scene
                                    </span>
                                    <span className="text-xs font-semibold text-vellum-on-surface-variant group-hover:text-on-surface truncate block uppercase">
                                        {scene.heading}
                                    </span>
                                </button>
                            ))
                        )}
                    </div>
                    <div className="p-6 mt-auto">
                        <button onClick={exportPDF} className="w-full bg-vellum-primary text-on-primary rounded-xl py-3 font-label font-bold text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-vellum-primary/10">
                            Export PDF
                        </button>
                    </div>
                </aside>

                {/* Main Script Canvas */}
                <main className={`flex-1 overflow-y-auto bg-surface-container-lowest no-scrollbar scroll-smooth transition-all ${focusMode ? 'pt-4' : 'pt-20'} pb-64`}>
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
                      <div className="p-4 border-b border-vellum-outline/5 flex flex-wrap gap-1">
                          {[
                              { id: "cards", label: "Cards" },
                              { id: "analysis", label: "Analysis" },
                              { id: "acts", label: "Acts" },
                              { id: "characters", label: "Chars" },
                              { id: "locations", label: "Locs" },
                              { id: "notes", label: "Notes" },
                              { id: "comments", label: "Comments" }
                          ].map(tab => (
                              <button 
                                  key={tab.id}
                                  onClick={() => setRightSidebarTab(tab.id as any)}
                                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors ${rightSidebarTab === tab.id ? 'bg-vellum-primary/10 text-vellum-primary' : 'text-vellum-on-surface-variant hover:bg-surface-container hover:text-vellum-primary'}`}
                              >
                                  {tab.label}
                              </button>
                          ))}
                      </div>
 
                      <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
                          {rightSidebarTab === "cards" && (
                              <CardsView 
                                  scenes={scenes} 
                                  onReorder={(newScenes) => setScenes(newScenes)}
                                  onSelectScene={(pos) => editor?.chain().focus().setTextSelection(pos).scrollIntoView().run()}
                              />
                          )}
                          {rightSidebarTab === "analysis" && (
                              <section className="p-4 space-y-6">
                                  <div className="flex items-center gap-3 mb-4">
                                      <div className="p-2 bg-vellum-primary/10 rounded-xl">
                                          <Type size={16} className="text-vellum-primary" />
                                      </div>
                                      <h2 className="font-headline font-bold text-sm text-vellum-primary">Analysis</h2>
                                  </div>
                                  <div className="grid grid-cols-2 gap-3">
                                      <div className="bg-surface-container-high rounded-xl p-4 border border-vellum-outline/10">
                                          <p className="text-[10px] text-vellum-on-surface-variant font-bold uppercase tracking-widest mb-1">Pages</p>
                                          <p className="text-2xl font-headline font-bold text-vellum-primary">{pageCount}</p>
                                      </div>
                                      <div className="bg-surface-container-high rounded-xl p-4 border border-vellum-outline/10">
                                          <p className="text-[10px] text-vellum-on-surface-variant font-bold uppercase tracking-widest mb-1">Scenes</p>
                                          <p className="text-2xl font-headline font-bold text-vellum-primary">{scenes.length}</p>
                                      </div>
                                      <div className="bg-surface-container-high rounded-xl p-4 border border-vellum-outline/10">
                                          <p className="text-[10px] text-vellum-on-surface-variant font-bold uppercase tracking-widest mb-1">Words</p>
                                          <p className="text-2xl font-headline font-bold text-vellum-primary">{Math.round(pageCount * 250)}</p>
                                      </div>
                                      <div className="bg-surface-container-high rounded-xl p-4 border border-vellum-outline/10">
                                          <p className="text-[10px] text-vellum-on-surface-variant font-bold uppercase tracking-widest mb-1">Characters</p>
                                          <p className="text-2xl font-headline font-bold text-vellum-primary">{characters.length}</p>
                                      </div>
                                  </div>
                                  <div className="bg-surface-container border border-dashed border-vellum-outline/20 rounded-xl p-6 text-center">
                                      <p className="text-[10px] text-vellum-on-surface-variant font-bold uppercase tracking-widest mb-2">Scene Breakdown</p>
                                      <p className="text-xs text-vellum-on-surface-variant">Add more scenes to see detailed analysis</p>
                                  </div>
                              </section>
                          )}
                          {rightSidebarTab === "acts" && (
                              <section className="p-4">
                                  <div className="flex items-center justify-between mb-4">
                                      <h3 className="font-bold text-sm">Acts</h3>
                                      <button onClick={() => setShowActForm(true)} className="p-1.5 rounded-lg bg-vellum-primary/10 text-vellum-primary hover:bg-vellum-primary/20"><Plus size={14} /></button>
                                  </div>
                                  
                                  {showActForm && (
                                      <div className="bg-surface-container-high rounded-xl p-4 mb-4 border border-vellum-primary/30">
                                          <div className="flex items-center justify-between mb-3">
                                              <span className="text-xs font-bold text-vellum-primary">Add New Act</span>
                                              <button onClick={() => { setShowActForm(false); setNewActTitle(""); setNewActSummary(""); }} className="text-vellum-on-surface-variant hover:text-vellum-primary">
                                                  <X size={14} />
                                              </button>
                                          </div>
                                          <input
                                              value={newActTitle}
                                              onChange={(e) => setNewActTitle(e.target.value)}
                                              placeholder="Act title (e.g., Act 1, The Setup)..."
                                              className="w-full bg-surface-container rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-vellum-primary/50 text-vellum-on-surface mb-2"
                                          />
                                          <textarea
                                              value={newActSummary}
                                              onChange={(e) => setNewActSummary(e.target.value)}
                                              placeholder="Summary (optional)..."
                                              className="w-full bg-surface-container rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-vellum-primary/50 text-vellum-on-surface h-20 resize-none mb-3"
                                          />
                                          <button 
                                              onClick={() => {
                                                  console.log("Save clicked, title:", newActTitle, "trim:", newActTitle.trim());
                                                  if (!newActTitle.trim()) {
                                                      alert("Please enter a title");
                                                      return;
                                                  }
                                                  fetch(`${import.meta.env.VITE_API_URL}/api/acts`, {
                                                      method: "POST",
                                                      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                                                      body: JSON.stringify({ title: newActTitle, summary: newActSummary || null, projectId: _id, order: acts.length })
                                                  }).then(postRes => {
                                                      console.log("Create act response:", postRes.status);
                                                      return fetch(`${import.meta.env.VITE_API_URL}/api/acts/project/${_id}`, { headers: { Authorization: `Bearer ${token}` } });
                                                  }).then(res => {
                                                      if (res.ok) res.json().then(data => setActs(data));
                                                  }).finally(() => {
                                                      setShowActForm(false);
                                                      setNewActTitle("");
                                                      setNewActSummary("");
                                                  });
                                              }}
                                              className="w-full bg-vellum-primary text-on-primary font-bold uppercase py-2 rounded-lg text-xs tracking-widest hover:brightness-110"
                                          >
                                              Save Act
                                          </button>
                                      </div>
                                  )}
                                  
                                  {acts.length === 0 && !showActForm ? (
                                      <div className="bg-surface-container border border-dashed border-vellum-outline/20 rounded-xl p-6 text-center">
                                          <p className="text-xs text-vellum-on-surface-variant font-medium">No acts yet. Add your first act!</p>
                                      </div>
                                  ) : (
                                      <div className="space-y-3">
                                          {acts.map((act, index) => (
                                              <div key={act.id} className="bg-surface-container-high rounded-xl p-4 group">
                                                  <div className="flex items-center justify-between mb-2">
                                                      <span className="text-[10px] font-bold text-vellum-primary uppercase tracking-widest">Act {index + 1}</span>
                                                      <div className="flex gap-1">
                                                          <button onClick={async () => {
                                                              await fetch(`${import.meta.env.VITE_API_URL}/api/acts/${act.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
                                                              setActs(acts.filter((a: any) => a.id !== act.id));
                                                          }} className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-500/10 rounded"><Trash2 size={12} /></button>
                                                      </div>
                                                  </div>
                                                  <h4 className="font-bold text-sm mb-1">{act.title}</h4>
                                                  {act.summary && <p className="text-xs text-vellum-on-surface-variant">{act.summary}</p>}
                                                  <div className="mt-3 pt-3 border-t border-vellum-outline/10">
                                                      <p className="text-[10px] text-vellum-on-surface-variant">
                                                          {scenes.filter(s => s.heading.toLowerCase().includes(act.title.toLowerCase().replace("act ", ""))).length} scenes
                                                      </p>
                                                  </div>
                                              </div>
                                          ))}
                                      </div>
                                  )}
                              </section>
                          )}
                          {rightSidebarTab === "characters" && (
                              <section className="p-4">
                                  <div className="flex items-center justify-between mb-4">
                                      <h3 className="font-bold text-sm">Characters</h3>
                                      <button onClick={() => setShowCharacterForm(true)} className="p-1.5 rounded-lg bg-vellum-primary/10 text-vellum-primary hover:bg-vellum-primary/20"><Plus size={14} /></button>
                                  </div>
                                  
                                  {showCharacterForm && (
                                      <div className="bg-surface-container-high rounded-xl p-4 mb-4 border border-vellum-primary/30">
                                          <div className="flex items-center justify-between mb-3">
                                              <span className="text-xs font-bold text-vellum-primary">Add New Character</span>
                                              <button onClick={() => { setShowCharacterForm(false); setNewCharacterName(""); setNewCharacterDescription(""); }} className="text-vellum-on-surface-variant hover:text-vellum-primary">
                                                  <X size={14} />
                                              </button>
                                          </div>
                                          <input
                                              value={newCharacterName}
                                              onChange={(e) => setNewCharacterName(e.target.value)}
                                              placeholder="Character name..."
                                              className="w-full bg-surface-container rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-vellum-primary/50 text-vellum-on-surface mb-2"
                                          />
                                          <textarea
                                              value={newCharacterDescription}
                                              onChange={(e) => setNewCharacterDescription(e.target.value)}
                                              placeholder="Description (optional)..."
                                              className="w-full bg-surface-container rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-vellum-primary/50 text-vellum-on-surface h-16 resize-none mb-3"
                                          />
                                          <button 
                                              onClick={async () => {
                                                  if (!newCharacterName.trim()) return;
                                                  console.log("Creating character:", { name: newCharacterName, projectId: _id, token: token ? "present" : "missing" });
                                                  const postRes = await fetch(`${import.meta.env.VITE_API_URL}/api/characters`, {
                                                      method: "POST",
                                                      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                                                      body: JSON.stringify({ name: newCharacterName, description: newCharacterDescription || null, projectId: _id })
                                                  });
                                                  console.log("Create character response:", postRes.status, await postRes.json().catch(() => ({})));
                                                  if (!postRes.ok) {
                                                      return;
                                                  }
                                                  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/characters/project/${_id}`, { headers: { Authorization: `Bearer ${token}` } });
                                                  console.log("Fetch characters response:", res.status, await res.json().catch(() => ({})));
                                                  if (res.ok) setCharacters(await res.json());
                                                  setShowCharacterForm(false);
                                                  setNewCharacterName("");
                                                  setNewCharacterDescription("");
                                              }}
                                              className="w-full bg-vellum-primary text-on-primary font-bold uppercase py-2 rounded-lg text-xs tracking-widest hover:brightness-110"
                                          >
                                              Save Character
                                          </button>
                                      </div>
                                  )}
                                  
                                  {characters.length === 0 && !showCharacterForm ? (
                                      <div className="bg-surface-container border border-dashed border-vellum-outline/20 rounded-xl p-6 text-center">
                                          <p className="text-xs text-vellum-on-surface-variant font-medium">No characters yet. Add your first character!</p>
                                      </div>
                                  ) : (
                                      <div className="space-y-2">
                                          {characters.map(char => (
                                              <div key={char.id} className="bg-surface-container-high rounded-xl p-3 flex items-center gap-3 group">
                                                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: char.color + "20", color: char.color }}>
                                                      {char.name.charAt(0)}
                                                  </div>
                                                  <div className="flex-1 min-w-0">
                                                      <p className="text-sm font-bold truncate">{char.name}</p>
                                                      {char.description && <p className="text-[10px] text-vellum-on-surface-variant truncate">{char.description}</p>}
                                                  </div>
                                                  <button onClick={async () => {
                                                      await fetch(`${import.meta.env.VITE_API_URL}/api/characters/${char.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
                                                      setCharacters(characters.filter((c: any) => c.id !== char.id));
                                                  }} className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-500/10 rounded"><Trash2 size={12} /></button>
                                              </div>
                                          ))}
                                      </div>
                                  )}
                              </section>
                          )}
                          {rightSidebarTab === "locations" && (
                              <section className="p-4">
                                  <div className="flex items-center justify-between mb-4">
                                      <h3 className="font-bold text-sm">Locations</h3>
                                      <button onClick={() => setShowLocationForm(true)} className="p-1.5 rounded-lg bg-vellum-primary/10 text-vellum-primary hover:bg-vellum-primary/20"><Plus size={14} /></button>
                                  </div>
                                  
                                  {showLocationForm && (
                                      <div className="bg-surface-container-high rounded-xl p-4 mb-4 border border-vellum-primary/30">
                                          <div className="flex items-center justify-between mb-3">
                                              <span className="text-xs font-bold text-vellum-primary">Add New Location</span>
                                              <button onClick={() => { setShowLocationForm(false); setNewLocationName(""); setNewLocationIntExt("INT"); setNewLocationTimeOfDay("DAY"); }} className="text-vellum-on-surface-variant hover:text-vellum-primary">
                                                  <X size={14} />
                                              </button>
                                          </div>
                                          <input
                                              value={newLocationName}
                                              onChange={(e) => setNewLocationName(e.target.value)}
                                              placeholder="Location name (e.g., COFFEE SHOP)..."
                                              className="w-full bg-surface-container rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-vellum-primary/50 text-vellum-on-surface mb-2 uppercase"
                                          />
                                          <div className="flex gap-2 mb-3">
                                              <select
                                                  value={newLocationIntExt}
                                                  onChange={(e) => setNewLocationIntExt(e.target.value)}
                                                  className="bg-surface-container rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-vellum-primary/50 text-vellum-on-surface"
                                              >
                                                  <option value="INT">INT</option>
                                                  <option value="EXT">EXT</option>
                                                  <option value="INT/EXT">INT/EXT</option>
                                              </select>
                                              <select
                                                  value={newLocationTimeOfDay}
                                                  onChange={(e) => setNewLocationTimeOfDay(e.target.value)}
                                                  className="bg-surface-container rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-vellum-primary/50 text-vellum-on-surface"
                                              >
                                                  <option value="DAY">DAY</option>
                                                  <option value="NIGHT">NIGHT</option>
                                                  <option value="DAWN">DAWN</option>
                                                  <option value="DUSK">DUSK</option>
                                                  <option value="CONTINUOUS">CONTINUOUS</option>
                                                  <option value="LATER">LATER</option>
                                              </select>
                                          </div>
                                          <button 
                                              onClick={async () => {
                                                  console.log("Creating location:", newLocationName, "projectId:", _id, "token:", token ? "present" : "missing");
                                                  if (!newLocationName.trim()) {
                                                      alert("Please enter a location name");
                                                      return;
                                                  }
                                                  try {
                                                      const postRes = await fetch(`${import.meta.env.VITE_API_URL}/api/locations`, {
                                                          method: "POST",
                                                          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                                                          body: JSON.stringify({ name: newLocationName.toUpperCase(), intExt: newLocationIntExt, timeOfDay: newLocationTimeOfDay, projectId: _id })
                                                      });
                                                      console.log("Create location response:", postRes.status);
                                                      if (!postRes.ok) {
                                                          const err = await postRes.json();
                                                          alert("Error: " + (err.error || "Failed to create"));
                                                          return;
                                                      }
                                                      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/locations/project/${_id}`, { headers: { Authorization: `Bearer ${token}` } });
                                                      console.log("Fetch locations response:", res.status);
                                                      if (res.ok) setLocations(await res.json());
                                                      setShowLocationForm(false);
                                                      setNewLocationName("");
                                                      setNewLocationIntExt("INT");
                                                      setNewLocationTimeOfDay("DAY");
                                                  } catch (e) {
                                                      console.error(e);
                                                      alert("Error: " + e);
                                                  }
                                              }}
                                              className="w-full bg-vellum-primary text-on-primary font-bold uppercase py-2 rounded-lg text-xs tracking-widest hover:brightness-110"
                                          >
                                              Save Location
                                          </button>
                                      </div>
                                  )}
                                  
                                  {locations.length === 0 && !showLocationForm ? (
                                      <div className="bg-surface-container border border-dashed border-vellum-outline/20 rounded-xl p-6 text-center">
                                          <p className="text-xs text-vellum-on-surface-variant font-medium">No locations yet. Add your first location!</p>
                                      </div>
                                  ) : (
                                      <div className="space-y-2">
                                          {locations.map(loc => (
                                              <div key={loc.id} className="bg-surface-container-high rounded-xl p-3 flex items-center gap-3 group">
                                                  <div className="p-2 rounded-lg bg-green-500/10 text-green-500"><MapPin size={14} /></div>
                                                  <div className="flex-1 min-w-0">
                                                      <p className="text-sm font-bold truncate">{loc.name}</p>
                                                      <p className="text-[10px] text-vellum-on-surface-variant">{loc.intExt} - {loc.timeOfDay}</p>
                                                  </div>
                                                  <button onClick={async () => {
                                                      await fetch(`${import.meta.env.VITE_API_URL}/api/locations/${loc.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
                                                      setLocations(locations.filter((l: any) => l.id !== loc.id));
                                                  }} className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-500/10 rounded"><Trash2 size={12} /></button>
                                              </div>
                                          ))}
                                      </div>
                                  )}
                              </section>
                          )}
                          {rightSidebarTab === "notes" && (
                              <section className="p-4">
                                  <div className="flex items-center justify-between mb-4">
                                      <div className="flex gap-2">
                                          <button onClick={() => { setShowPrivatePad(false); setShowNoteForm(false); }} className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${!showPrivatePad ? 'bg-vellum-primary/20 text-vellum-primary' : 'text-vellum-on-surface-variant'}`}>Notes</button>
                                          <button onClick={() => { setShowPrivatePad(true); setShowNoteForm(false); }} className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${showPrivatePad ? 'bg-vellum-primary/20 text-vellum-primary' : 'text-vellum-on-surface-variant'}`}>Private</button>
                                      </div>
                                      <button onClick={() => setShowNoteForm(true)} className="p-1.5 rounded-lg bg-vellum-primary/10 text-vellum-primary hover:bg-vellum-primary/20"><Plus size={14} /></button>
                                  </div>
                                  
                                  {showNoteForm && (
                                      <div className="bg-surface-container-high rounded-xl p-4 mb-4 border border-vellum-primary/30">
                                          <div className="flex items-center justify-between mb-3">
                                              <span className="text-xs font-bold text-vellum-primary">Add New Note</span>
                                              <button onClick={() => { setShowNoteForm(false); setNewNoteContent(""); setNewNoteScene(""); }} className="text-vellum-on-surface-variant hover:text-vellum-primary">
                                                  <X size={14} />
                                              </button>
                                          </div>
                                          <textarea
                                              value={newNoteContent}
                                              onChange={(e) => setNewNoteContent(e.target.value)}
                                              placeholder="Write your note..."
                                              className="w-full bg-surface-container rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-vellum-primary/50 text-vellum-on-surface h-20 resize-none mb-2"
                                          />
                                          <select
                                              value={newNoteScene}
                                              onChange={(e) => setNewNoteScene(e.target.value)}
                                              className="w-full bg-surface-container rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-vellum-primary/50 text-vellum-on-surface mb-3"
                                          >
                                              <option value="">Scene (optional)</option>
                                              {scenes.map(scene => (
                                                  <option key={scene.id} value={scene.heading}>{scene.heading}</option>
                                              ))}
                                          </select>
                                          <button 
                                              onClick={async () => {
                                                  if (!newNoteContent.trim()) return;
                                                  const postRes = await fetch(`${import.meta.env.VITE_API_URL}/api/notes`, {
                                                      method: "POST",
                                                      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                                                      body: JSON.stringify({ content: newNoteContent, isPrivate: showPrivatePad, projectId: _id, sceneHeading: newNoteScene || null })
                                                  });
                                                  if (!postRes.ok) {
                                                      const err = await postRes.json();
                                                      console.error("Failed to create note:", err);
                                                      return;
                                                  }
                                                  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/notes/project/${_id}`, { headers: { Authorization: `Bearer ${token}` } });
                                                  if (res.ok) {
                                                      const allNotes = await res.json();
                                                      setNotes(allNotes.filter((n: any) => !n.isPrivate));
                                                      setPrivateNotes(allNotes.filter((n: any) => n.isPrivate));
                                                  }
                                                  setShowNoteForm(false);
                                                  setNewNoteContent("");
                                                  setNewNoteScene("");
                                              }}
                                              className="w-full bg-vellum-primary text-on-primary font-bold uppercase py-2 rounded-lg text-xs tracking-widest hover:brightness-110"
                                          >
                                              Save Note
                                          </button>
                                      </div>
                                  )}
                                  
                                  {(showPrivatePad ? privateNotes : notes).length === 0 && !showNoteForm ? (
                                      <div className="bg-surface-container border border-dashed border-vellum-outline/20 rounded-xl p-6 text-center">
                                          <p className="text-xs text-vellum-on-surface-variant font-medium">{showPrivatePad ? "Your private notes are hidden from collaborators." : "No notes yet. Add your first note!"}</p>
                                      </div>
                                  ) : (
                                      <div className="space-y-2">
                                          {(showPrivatePad ? privateNotes : notes).map(note => (
                                              <div key={note.id} className="bg-surface-container-high rounded-xl p-3 group">
                                                  <p className="text-sm mb-2">{note.content}</p>
                                                  <div className="flex items-center justify-between">
                                                      <p className="text-[10px] text-vellum-on-surface-variant">{note.sceneHeading || "General"}</p>
                                                      <button onClick={async () => {
                                                          await fetch(`${import.meta.env.VITE_API_URL}/api/notes/${note.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
                                                          if (note.isPrivate) {
                                                              setPrivateNotes(privateNotes.filter((n: any) => n.id !== note.id));
                                                          } else {
                                                              setNotes(notes.filter((n: any) => n.id !== note.id));
                                                          }
                                                      }} className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-500/10 rounded"><Trash2 size={12} /></button>
                                                  </div>
                                              </div>
                                          ))}
                                      </div>
                                  )}
                              </section>
                          )}
                          {rightSidebarTab === "comments" && (
                              <section className="p-4">
                                  <div className="flex items-center justify-between mb-4">
                                      <h3 className="font-bold text-sm">Comments</h3>
                                      <button onClick={() => setShowCommentForm(true)} className="p-1.5 rounded-lg bg-vellum-primary/10 text-vellum-primary hover:bg-vellum-primary/20"><Plus size={14} /></button>
                                  </div>
                                  
                                  {showCommentForm && (
                                      <div className="bg-surface-container-high rounded-xl p-4 mb-4 border border-vellum-primary/30">
                                          <div className="flex items-center justify-between mb-3">
                                              <span className="text-xs font-bold text-vellum-primary">Add New Comment</span>
                                              <button onClick={() => { setShowCommentForm(false); setNewCommentContent(""); }} className="text-vellum-on-surface-variant hover:text-vellum-primary">
                                                  <X size={14} />
                                              </button>
                                          </div>
                                          <textarea
                                              value={newCommentContent}
                                              onChange={(e) => setNewCommentContent(e.target.value)}
                                              placeholder="Write your comment..."
                                              className="w-full bg-surface-container rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-vellum-primary/50 text-vellum-on-surface h-20 resize-none mb-3"
                                          />
                                          <button 
                                              onClick={async () => {
                                                  if (!newCommentContent.trim()) return;
                                                  const postRes = await fetch(`${import.meta.env.VITE_API_URL}/api/community/${_id}/comments`, {
                                                      method: "POST",
                                                      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                                                      body: JSON.stringify({ content: newCommentContent })
                                                  });
                                                  if (!postRes.ok) {
                                                      const err = await postRes.json();
                                                      console.error("Failed to create comment:", err);
                                                      return;
                                                  }
                                                  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/community/${_id}/comments`, { headers: { Authorization: `Bearer ${token}` } });
                                                  if (res.ok) setComments(await res.json());
                                                  setShowCommentForm(false);
                                                  setNewCommentContent("");
                                              }}
                                              className="w-full bg-vellum-primary text-on-primary font-bold uppercase py-2 rounded-lg text-xs tracking-widest hover:brightness-110"
                                          >
                                              Save Comment
                                          </button>
                                      </div>
                                  )}
                                  {comments.length === 0 ? (
                                      <div className="bg-surface-container border border-dashed border-vellum-outline/20 rounded-xl p-6 text-center">
                                          <p className="text-xs text-vellum-on-surface-variant font-medium">No comments yet. Share this script to get feedback!</p>
                                      </div>
                                  ) : (
                                      <div className="space-y-3">
                                          {comments.map(comment => (
                                              <div key={comment.id} className="bg-surface-container-high rounded-xl p-3 group">
                                                  <div className="flex items-center gap-2 mb-2">
                                                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: comment.author?.color + "20", color: comment.author?.color }}>
                                                          {comment.author?.name?.charAt(0)}
                                                      </div>
                                                      <span className="text-xs font-bold">{comment.author?.name}</span>
                                                      <span className="text-[10px] text-vellum-on-surface-variant ml-auto">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                                  </div>
                                                  <p className="text-sm">{comment.content}</p>
                                                  {comment.sceneHeading && <p className="text-[10px] text-vellum-primary mt-2">Scene: {comment.sceneHeading}</p>}
                                              </div>
                                          ))}
                                      </div>
                                  )}
                              </section>
                          )}
                      </div>
                 </aside>

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
      </div>
    );
}

const ToolbarButton = ({ icon, label, active, onClick, disabled }: any) => (
    <button 
        onClick={onClick} 
        disabled={disabled}
        className={`flex flex-col items-center justify-center gap-1 px-2 py-1.5 rounded-lg transition-colors min-w-[50px] ${disabled ? 'opacity-30 cursor-not-allowed' : active ? 'bg-vellum-primary/10 text-vellum-primary' : 'text-vellum-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'}`}
    >
        {icon}
        <span className="text-[7px] font-bold uppercase tracking-[0.15em] opacity-80">{label}</span>
    </button>
);

const NavItem = ({ icon, label, active = false }: any) => (
  <button className={`w-full text-left font-label rounded-xl px-4 py-2.5 flex items-center gap-3 transition-all active:scale-95 duration-100 ${active ? 'bg-surface-container-highest text-vellum-primary border border-vellum-primary/10 pl-5' : 'text-vellum-on-surface-variant hover:bg-surface-container-highest/50 hover:text-on-surface'}`}>
    <span className="opacity-80 scale-90">{icon}</span>
    <span className="font-bold text-[13px] tracking-tight">{label}</span>
  </button>
);

// Keep NavItem for future use
void NavItem;

export default function Editor() {
    const { id } = useParams();
    // The key forces React to completely unmount and remount the EditorWorkspace
    // whenever the URL ID changes. This ensures a 100% clean Yjs document state.
    return <EditorWorkspace key={id || "new"} />;
}
