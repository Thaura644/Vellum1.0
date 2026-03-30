import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, Plus, X, Edit2, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../store/useAuthStore";

interface Character {
  id: string;
  name: string;
  description?: string;
  notes?: string;
  color: string;
  projectId?: string;
}

const CharacterGallery = () => {
  const { token } = useAuthStore();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    notes: "",
    color: "#ffb612",
  });

  useEffect(() => {
    fetchCharacters();
  }, []);

  const fetchCharacters = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/characters`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCharacters(data);
      }
    } catch (err) {
      console.error("Failed to fetch characters:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingCharacter
        ? `${import.meta.env.VITE_API_URL}/api/characters/${editingCharacter.id}`
        : `${import.meta.env.VITE_API_URL}/api/characters`;
      const method = editingCharacter ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        fetchCharacters();
        closeModal();
      }
    } catch (err) {
      console.error("Failed to save character:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this character?")) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/characters/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setCharacters(characters.filter((c) => c.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete character:", err);
    }
  };

  const openModal = (character?: Character) => {
    if (character) {
      setEditingCharacter(character);
      setFormData({
        name: character.name,
        description: character.description || "",
        notes: character.notes || "",
        color: character.color,
      });
    } else {
      setEditingCharacter(null);
      setFormData({ name: "", description: "", notes: "", color: "#ffb612" });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCharacter(null);
    setFormData({ name: "", description: "", notes: "", color: "#ffb612" });
  };

  const colors = [
    "#ffb612", "#e11d48", "#7c3aed", "#0891b2", "#16a34a",
    "#ea580c", "#6366f1", "#db2777", "#0d9488", "#4f46e5",
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-vellum-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-vellum-primary border-t-transparent rounded-full" />
      </div>
    );
  }

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
        <button onClick={() => openModal()} className="bg-vellum-primary text-on-primary rounded-xl px-10 py-4 font-label font-bold text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all flex items-center gap-3">
          <Plus size={18} /> New Character
        </button>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {characters.map((character) => (
          <motion.div
            key={character.id}
            whileHover={{ y: -5 }}
            className="bg-surface-container-low rounded-3xl p-10 border border-vellum-outline/5 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-vellum-primary/5 rounded-full blur-2xl group-hover:bg-vellum-primary/10 transition-all" />
            <div className="flex justify-between items-start">
              <div
                className="w-20 h-20 rounded-2xl bg-surface-container-highest mb-8 border border-vellum-outline/10 flex items-center justify-center font-headline font-bold text-3xl"
                style={{ color: character.color }}
              >
                {character.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openModal(character)} className="p-2 hover:bg-surface-container-high rounded-lg transition-colors">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => handleDelete(character.id)} className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <h3 className="font-headline text-2xl font-bold mb-2">{character.name}</h3>
            {character.description && (
              <p className="text-[10px] text-vellum-primary font-bold uppercase tracking-widest mb-6">{character.description}</p>
            )}
            {character.notes && (
              <p className="text-sm text-vellum-on-surface-variant leading-relaxed line-clamp-2 italic">"{character.notes}"</p>
            )}
          </motion.div>
        ))}

        <button onClick={() => openModal()} className="border-2 border-dashed border-vellum-outline/10 rounded-3xl flex flex-col items-center justify-center p-12 hover:border-vellum-primary/40 hover:bg-vellum-primary/5 transition-all group aspect-square">
          <div className="w-14 h-14 rounded-full bg-surface-container-highest flex items-center justify-center mb-6 group-hover:bg-vellum-primary group-hover:text-on-primary transition-colors">
            <Plus size={28} />
          </div>
          <span className="font-headline font-bold text-lg">Add Character</span>
        </button>
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
                  {editingCharacter ? "Edit Character" : "New Character"}
                </h2>
                <button onClick={closeModal} className="p-2 hover:bg-surface-container-low rounded-lg">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-surface-container-low border border-vellum-outline/10 rounded-xl px-4 py-3 focus:outline-none focus:border-vellum-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-2">Description</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-surface-container-low border border-vellum-outline/10 rounded-xl px-4 py-3 focus:outline-none focus:border-vellum-primary"
                    placeholder="e.g., Protagonist, Tech-Thief"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-2">Notes / Quote</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full bg-surface-container-low border border-vellum-outline/10 rounded-xl px-4 py-3 focus:outline-none focus:border-vellum-primary h-24 resize-none"
                    placeholder="Character notes or signature quote..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-2">Color</label>
                  <div className="flex gap-3">
                    {colors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData({ ...formData, color })}
                        className={`w-10 h-10 rounded-xl transition-transform ${formData.color === color ? "ring-2 ring-offset-2 ring-vellum-primary scale-110" : "hover:scale-105"}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={closeModal} className="flex-1 py-3 rounded-xl border border-vellum-outline/10 hover:bg-surface-container-low transition-colors font-bold text-sm">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 py-3 rounded-xl bg-vellum-primary text-on-primary font-bold text-sm hover:brightness-110">
                    {editingCharacter ? "Save Changes" : "Create Character"}
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

export default CharacterGallery;
