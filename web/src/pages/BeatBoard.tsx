import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, Plus, LayoutGrid, List, X, Edit2, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../store/useAuthStore";
import ThemeToggle from "../components/ThemeToggle";

interface Beat {
  id: string;
  content: string;
  sceneHeading?: string;
  act: number;
}

const actNames: Record<number, string> = {
  1: "Discovery",
  2: "Confrontation",
  3: "Resolution",
};

const BeatBoard = () => {
  const { token, user } = useAuthStore();
  const [beats, setBeats] = useState<Beat[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"corkboard" | "list">("corkboard");
  const [showModal, setShowModal] = useState(false);
  const [editingBeat, setEditingBeat] = useState<Beat | null>(null);
  const [formData, setFormData] = useState({
    content: "",
    sceneHeading: "",
    act: 1,
  });

  useEffect(() => {
    fetchBeats();
  }, []);

  const fetchBeats = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/notes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setBeats(data);
      }
    } catch (err) {
      console.error("Failed to fetch beats:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingBeat
        ? `${import.meta.env.VITE_API_URL}/api/notes/${editingBeat.id}`
        : `${import.meta.env.VITE_API_URL}/api/notes`;
      const method = editingBeat ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: formData.content,
          sceneHeading: formData.sceneHeading,
          act: formData.act,
          projectId: "default", 
        }),
      });

      if (res.ok) {
        fetchBeats();
        closeModal();
      }
    } catch (err) {
      console.error("Failed to save beat:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this beat?")) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/notes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setBeats(beats.filter((b) => b.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete beat:", err);
    }
  };

  const openModal = (beat?: Beat) => {
    if (beat) {
      setEditingBeat(beat);
      setFormData({
        content: beat.content,
        sceneHeading: beat.sceneHeading || "",
        act: beat.act,
      });
    } else {
      setEditingBeat(null);
      setFormData({ content: "", sceneHeading: "", act: 1 });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingBeat(null);
  };

  const acts = [1, 2, 3];

  if (loading) {
    return (
      <div className="min-h-screen bg-vellum-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-vellum-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-vellum-background text-vellum-on-surface font-body flex flex-col">
      <nav className="bg-[#131314] border-b border-vellum-outline/10 px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <Link to="/dashboard" className="p-2 text-vellum-on-surface-variant hover:text-vellum-primary transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <div className="flex flex-col">
            <h1 className="text-xl font-headline font-extrabold tracking-tight text-on-surface">Visual Outline</h1>
            <p className="text-[10px] text-vellum-on-surface-variant font-bold uppercase tracking-widest opacity-60">
              {user?.name || "Project"}'s Script
            </p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <ThemeToggle />
          <div className="flex bg-surface-container-low p-1.5 rounded-xl border border-vellum-outline/10 text-xs font-bold uppercase tracking-widest font-label">
            <button
              onClick={() => setViewMode("corkboard")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${viewMode === "corkboard" ? "bg-vellum-primary text-on-primary shadow-lg shadow-vellum-primary/10" : "text-vellum-on-surface-variant hover:text-vellum-primary"}`}
            >
              <LayoutGrid size={14} /> Corkboard
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${viewMode === "list" ? "bg-vellum-primary text-on-primary shadow-lg shadow-vellum-primary/10" : "text-vellum-on-surface-variant hover:text-vellum-primary"}`}
            >
              <List size={14} /> List View
            </button>
          </div>
          <button onClick={() => openModal()} className="bg-vellum-primary text-on-primary rounded-xl px-6 py-3 font-label font-bold text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all flex items-center gap-3">
            <Plus size={16} /> New Beat
          </button>
        </div>
      </nav>

      {viewMode === "corkboard" ? (
        <main className="flex-1 p-12 flex gap-10 overflow-x-auto no-scrollbar">
          {acts.map((act) => (
            <div key={act} className="flex flex-col gap-8 w-96 shrink-0 h-full">
              <header className="flex justify-between items-end border-b border-vellum-outline/10 pb-4 px-2">
                <div>
                  <h2 className="text-xs font-label font-bold text-vellum-primary uppercase tracking-[0.3em]">Act {act}</h2>
                  <h3 className="font-headline font-bold text-2xl mt-1">{actNames[act]}</h3>
                </div>
                <span className="text-[10px] font-bold text-vellum-on-surface-variant uppercase tracking-widest">
                  {beats.filter((b) => b.act === act).length} BEATS
                </span>
              </header>

              <div className="flex-1 space-y-6">
                {beats
                  .filter((b) => b.act === act)
                  .map((beat) => (
                    <motion.div
                      key={beat.id}
                      layoutId={beat.id}
                      whileHover={{ y: -5 }}
                      className="p-8 rounded-2xl border border-vellum-outline/5 bg-surface-container-low min-h-[180px] cursor-pointer group relative overflow-hidden flex flex-col justify-between"
                    >
                      <div className="absolute top-0 left-0 w-1 h-full bg-vellum-primary opacity-20 group-hover:opacity-100 transition-opacity" />
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-headline font-bold text-on-surface">{beat.sceneHeading || "Untitled Beat"}</h3>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          <button onClick={() => openModal(beat)} className="p-1.5 hover:bg-surface-container-high rounded-lg">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => handleDelete(beat.id)} className="p-1.5 hover:bg-red-500/10 text-red-500 rounded-lg">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-vellum-on-surface-variant leading-relaxed font-medium">
                        {beat.content}
                      </p>
                      <div className="mt-8 flex justify-between items-center text-[9px] font-bold text-vellum-on-surface-variant uppercase tracking-widest">
                        <span className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-vellum-primary" /> BEAT
                        </span>
                      </div>
                    </motion.div>
                  ))}
                <button
                  onClick={() => {
                    setFormData({ ...formData, act });
                    openModal();
                  }}
                  className="w-full py-10 rounded-2xl border-2 border-dashed border-vellum-outline/10 text-vellum-on-surface-variant hover:border-vellum-primary/40 hover:text-vellum-primary hover:bg-vellum-primary/5 transition-all flex flex-col items-center justify-center gap-2 group"
                >
                  <Plus size={24} className="group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Add Beat Card</span>
                </button>
              </div>
            </div>
          ))}
        </main>
      ) : (
        <main className="flex-1 p-12">
          <div className="max-w-4xl mx-auto space-y-4">
            {acts.map((act) => (
              <div key={act}>
                <h2 className="text-xs font-label font-bold text-vellum-primary uppercase tracking-[0.3em] mb-4">
                  Act {act} - {actNames[act]}
                </h2>
                <div className="space-y-3">
                  {beats
                    .filter((b) => b.act === act)
                    .map((beat) => (
                      <div
                        key={beat.id}
                        className="flex items-center gap-4 p-4 rounded-xl bg-surface-container-low border border-vellum-outline/5 hover:border-vellum-primary/20 transition-colors"
                      >
                        <div className="w-2 h-2 rounded-full bg-vellum-primary" />
                        <div className="flex-1">
                          <h4 className="font-bold">{beat.sceneHeading || "Untitled Beat"}</h4>
                          <p className="text-sm text-vellum-on-surface-variant">{beat.content}</p>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => openModal(beat)} className="p-2 hover:bg-surface-container-high rounded-lg">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => handleDelete(beat.id)} className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </main>
      )}

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface-container-high rounded-3xl p-8 w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="font-headline text-2xl font-bold">
                  {editingBeat ? "Edit Beat" : "New Beat"}
                </h2>
                <button onClick={closeModal} className="p-2 hover:bg-surface-container-low rounded-lg">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-2">Beat Title</label>
                  <input
                    type="text"
                    value={formData.sceneHeading}
                    onChange={(e) => setFormData({ ...formData, sceneHeading: e.target.value })}
                    className="w-full bg-surface-container-low border border-vellum-outline/10 rounded-xl px-4 py-3 focus:outline-none focus:border-vellum-primary"
                    placeholder="e.g., The Inciting Incident"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-2">Description</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full bg-surface-container-low border border-vellum-outline/10 rounded-xl px-4 py-3 focus:outline-none focus:border-vellum-primary h-32 resize-none"
                    placeholder="Describe what happens in this beat..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-2">Act</label>
                  <div className="flex gap-3">
                    {acts.map((actNum) => (
                      <button
                        key={actNum}
                        type="button"
                        onClick={() => setFormData({ ...formData, act: actNum })}
                        className={`flex-1 py-3 rounded-xl border transition-all font-bold text-sm ${
                          formData.act === actNum
                            ? "border-vellum-primary bg-vellum-primary/10 text-vellum-primary"
                            : "border-vellum-outline/10 hover:border-vellum-primary/30"
                        }`}
                      >
                        Act {actNum}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={closeModal} className="flex-1 py-3 rounded-xl border border-vellum-outline/10 hover:bg-surface-container-low transition-colors font-bold text-sm">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 py-3 rounded-xl bg-vellum-primary text-on-primary font-bold text-sm hover:brightness-110">
                    {editingBeat ? "Save Changes" : "Create Beat"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BeatBoard;
