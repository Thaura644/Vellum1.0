import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, Plus, X, Edit2, Trash2, Layers } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../store/useAuthStore";

interface Act {
  id: string;
  title: string;
  summary?: string;
  order: number;
}

const defaultActs = [
  { id: "1", title: "Act One - Setup", summary: "Introduce the world, characters, and the inciting incident that kicks off the story.", order: 1 },
  { id: "2", title: "Act Two - Confrontation", summary: "The protagonist faces obstacles, allies, and enemies while pursuing their goal.", order: 2 },
  { id: "3", title: "Act Three - Resolution", summary: "The climax and final resolution of the story's conflicts.", order: 3 },
];

const ActsPage = () => {
  const { token } = useAuthStore();
  const [acts, setActs] = useState<Act[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAct, setEditingAct] = useState<Act | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    order: 1,
  });

  useEffect(() => {
    fetchActs();
  }, []);

  const fetchActs = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/acts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) {
          setActs(data);
        } else {
          setActs(defaultActs);
        }
      } else {
        setActs(defaultActs);
      }
    } catch (err) {
      console.error("Failed to fetch acts:", err);
      setActs(defaultActs);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingAct
        ? `${import.meta.env.VITE_API_URL}/api/acts/${editingAct.id}`
        : `${import.meta.env.VITE_API_URL}/api/acts`;
      const method = editingAct ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          summary: formData.summary,
          order: formData.order,
          projectId: "default",
        }),
      });

      if (res.ok) {
        fetchActs();
        closeModal();
      }
    } catch (err) {
      console.error("Failed to save act:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this act?")) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/acts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setActs(acts.filter((a) => a.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete act:", err);
    }
  };

  const openModal = (act?: Act) => {
    if (act) {
      setEditingAct(act);
      setFormData({
        title: act.title,
        summary: act.summary || "",
        order: act.order,
      });
    } else {
      setEditingAct(null);
      setFormData({ title: "", summary: "", order: acts.length + 1 });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingAct(null);
  };

  const sortedActs = [...acts].sort((a, b) => a.order - b.order);

  if (loading) {
    return (
      <div className="min-h-screen bg-vellum-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-vellum-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-vellum-background text-vellum-on-surface font-body p-12">
      <header className="flex justify-between items-end mb-16 max-w-4xl mx-auto">
        <div className="space-y-4">
          <Link to="/dashboard" className="flex items-center gap-2 text-vellum-on-surface-variant hover:text-vellum-primary transition-colors font-label font-bold text-[10px] uppercase tracking-widest">
            <ChevronLeft size={14} /> Back to Dashboard
          </Link>
          <h1 className="font-headline text-5xl font-extrabold tracking-tight">Act Structure</h1>
          <p className="text-vellum-on-surface-variant font-medium">Define the three-act structure of your screenplay.</p>
        </div>
        <button onClick={() => openModal()} className="bg-vellum-primary text-on-primary rounded-xl px-10 py-4 font-label font-bold text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all flex items-center gap-3">
          <Plus size={18} /> New Act
        </button>
      </header>

      <main className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px bg-vellum-outline/10" />
          <span className="text-xs font-bold uppercase tracking-widest text-vellum-on-surface-variant">Screenplay Structure</span>
          <div className="flex-1 h-px bg-vellum-outline/10" />
        </div>

        {sortedActs.map((act, index) => (
          <motion.div
            key={act.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative"
          >
            <div className="absolute -left-12 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-vellum-primary/10 flex items-center justify-center">
              <span className="font-headline font-bold text-vellum-primary">{act.order}</span>
            </div>
            <div className="bg-surface-container-low rounded-3xl p-8 border border-vellum-outline/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-vellum-primary/5 rounded-full blur-2xl" />
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-headline text-2xl font-bold">{act.title}</h3>
                  <span className="text-xs font-bold uppercase tracking-widest text-vellum-primary">Act {act.order}</span>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openModal(act)} className="p-2 hover:bg-surface-container-high rounded-lg transition-colors">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(act.id)} className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              {act.summary && (
                <p className="text-vellum-on-surface-variant leading-relaxed">{act.summary}</p>
              )}
              
              <div className="mt-8 pt-6 border-t border-vellum-outline/5">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-vellum-on-surface-variant">
                  <Layers size={14} />
                  <span>{index === 0 ? "25%" : index === 1 ? "50%" : "25%"} of Script</span>
                </div>
              </div>
            </div>
            {index < sortedActs.length - 1 && (
              <div className="absolute left-[calc(-3rem+10px)] top-full w-0.5 h-8 bg-vellum-outline/10" />
            )}
          </motion.div>
        ))}
      </main>

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
                  {editingAct ? "Edit Act" : "New Act"}
                </h2>
                <button onClick={closeModal} className="p-2 hover:bg-surface-container-low rounded-lg">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-2">Act Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-surface-container-low border border-vellum-outline/10 rounded-xl px-4 py-3 focus:outline-none focus:border-vellum-primary"
                    placeholder="e.g., Act One - Setup"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-2">Summary</label>
                  <textarea
                    value={formData.summary}
                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                    className="w-full bg-surface-container-low border border-vellum-outline/10 rounded-xl px-4 py-3 focus:outline-none focus:border-vellum-primary h-32 resize-none"
                    placeholder="Describe what happens in this act..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-2">Order</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                    className="w-full bg-surface-container-low border border-vellum-outline/10 rounded-xl px-4 py-3 focus:outline-none focus:border-vellum-primary"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={closeModal} className="flex-1 py-3 rounded-xl border border-vellum-outline/10 hover:bg-surface-container-low transition-colors font-bold text-sm">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 py-3 rounded-xl bg-vellum-primary text-on-primary font-bold text-sm hover:brightness-110">
                    {editingAct ? "Save Changes" : "Create Act"}
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

export default ActsPage;
