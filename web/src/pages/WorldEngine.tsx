import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, Plus, X, Edit2, Trash2, Globe, MapPin, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../store/useAuthStore";

interface Location {
  id: string;
  name: string;
  description?: string;
  notes?: string;
  intExt: string;
  timeOfDay: string;
}

type TabType = "lore" | "locations" | "magic";

const WorldEngine = () => {
  const { token } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>("locations");
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    notes: "",
    intExt: "INT",
    timeOfDay: "DAY",
  });

  useEffect(() => {
    if (activeTab === "locations") {
      fetchLocations();
    }
  }, [activeTab]);

  const fetchLocations = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/locations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setLocations(data);
      }
    } catch (err) {
      console.error("Failed to fetch locations:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingLocation
        ? `${import.meta.env.VITE_API_URL}/api/locations/${editingLocation.id}`
        : `${import.meta.env.VITE_API_URL}/api/locations`;
      const method = editingLocation ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        fetchLocations();
        closeModal();
      }
    } catch (err) {
      console.error("Failed to save location:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this location?")) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/locations/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setLocations(locations.filter((l) => l.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete location:", err);
    }
  };

  const openModal = (location?: Location) => {
    if (location) {
      setEditingLocation(location);
      setFormData({
        name: location.name,
        description: location.description || "",
        notes: location.notes || "",
        intExt: location.intExt,
        timeOfDay: location.timeOfDay,
      });
    } else {
      setEditingLocation(null);
      setFormData({ name: "", description: "", notes: "", intExt: "INT", timeOfDay: "DAY" });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingLocation(null);
  };

  const intExtOptions = ["INT", "EXT", "INT/EXT"];
  const timeOptions = ["DAY", "NIGHT", "DAWN", "DUSK", "CONTINUOUS"];

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
        {activeTab === "locations" && (
          <button onClick={() => openModal()} className="bg-tertiary text-on-tertiary rounded-xl px-10 py-4 font-label font-bold text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all flex items-center gap-3 shadow-lg shadow-tertiary/10">
            <Plus size={18} /> New Location
          </button>
        )}
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="md:col-span-1 space-y-4">
          <WorldTab icon={<Globe size={16}/>} label="Lore & History" active={activeTab === "lore"} onClick={() => setActiveTab("lore")} />
          <WorldTab icon={<MapPin size={16}/>} label="Locations" active={activeTab === "locations"} onClick={() => setActiveTab("locations")} />
          <WorldTab icon={<Sparkles size={16}/>} label="Magic/Tech Rules" active={activeTab === "magic"} onClick={() => setActiveTab("magic")} />
        </div>

        <div className="md:col-span-3">
          {activeTab === "locations" && (
            loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-8 h-8 border-2 border-vellum-primary border-t-transparent rounded-full" />
              </div>
            ) : locations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {locations.map((location) => (
                  <motion.div
                    key={location.id}
                    whileHover={{ y: -5 }}
                    className="bg-surface-container-low rounded-3xl p-8 border border-vellum-outline/5 relative overflow-hidden group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-tertiary/10 flex items-center justify-center">
                          <MapPin size={20} className="text-tertiary" />
                        </div>
                        <div>
                          <h3 className="font-headline text-xl font-bold">{location.name}</h3>
                          <span className="text-xs font-bold uppercase tracking-widest text-tertiary">
                            {location.intExt} • {location.timeOfDay}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openModal(location)} className="p-2 hover:bg-surface-container-high rounded-lg transition-colors">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(location.id)} className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    {location.description && (
                      <p className="text-sm text-vellum-on-surface-variant">{location.description}</p>
                    )}
                    {location.notes && (
                      <p className="text-xs text-vellum-on-surface-variant/60 mt-2 italic">"{location.notes}"</p>
                    )}
                  </motion.div>
                ))}
                <button onClick={() => openModal()} className="border-2 border-dashed border-vellum-outline/10 rounded-3xl flex flex-col items-center justify-center p-8 hover:border-tertiary/40 hover:bg-tertiary/5 transition-all group min-h-[200px]">
                  <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center mb-4 group-hover:bg-tertiary group-hover:text-on-tertiary transition-colors">
                    <Plus size={24} />
                  </div>
                  <span className="font-headline font-bold">Add Location</span>
                </button>
              </div>
            ) : (
              <div className="bg-surface-container-low rounded-3xl min-h-[400px] border border-vellum-outline/5 p-12 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 rounded-full bg-surface-container-highest flex items-center justify-center mb-10 text-vellum-on-surface-variant/40">
                  <MapPin size={48} />
                </div>
                <h2 className="font-headline text-2xl font-bold mb-4">No Locations Yet</h2>
                <p className="text-vellum-on-surface-variant max-w-sm mb-12">Every scene needs a place. Create locations for your story to bring your world to life.</p>
                <button onClick={() => openModal()} className="bg-tertiary/10 text-tertiary px-8 py-3 rounded-xl font-label text-[10px] font-bold uppercase tracking-widest hover:bg-tertiary hover:text-on-tertiary transition-all">
                  Create First Location
                </button>
              </div>
            )
          )}

          {(activeTab === "lore" || activeTab === "magic") && (
            <div className="bg-surface-container-low rounded-3xl min-h-[400px] border border-vellum-outline/5 p-12 flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 rounded-full bg-surface-container-highest flex items-center justify-center mb-10 text-vellum-on-surface-variant/40">
                {activeTab === "lore" ? <Globe size={48} /> : <Sparkles size={48} />}
              </div>
              <h2 className="font-headline text-2xl font-bold mb-4">
                {activeTab === "lore" ? "No Lore Entries Yet" : "No Rules Defined Yet"}
              </h2>
              <p className="text-vellum-on-surface-variant max-w-sm">
                {activeTab === "lore" 
                  ? "Every great story starts with a foundation. Define your world's history."
                  : "Define the magic systems, technology, or rules that govern your world."
                }
              </p>
            </div>
          )}
        </div>
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
                  {editingLocation ? "Edit Location" : "New Location"}
                </h2>
                <button onClick={closeModal} className="p-2 hover:bg-surface-container-low rounded-lg">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-2">Location Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-surface-container-low border border-vellum-outline/10 rounded-xl px-4 py-3 focus:outline-none focus:border-tertiary"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest mb-2">Interior/Exterior</label>
                    <select
                      value={formData.intExt}
                      onChange={(e) => setFormData({ ...formData, intExt: e.target.value })}
                      className="w-full bg-surface-container-low border border-vellum-outline/10 rounded-xl px-4 py-3 focus:outline-none focus:border-tertiary"
                    >
                      {intExtOptions.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest mb-2">Time of Day</label>
                    <select
                      value={formData.timeOfDay}
                      onChange={(e) => setFormData({ ...formData, timeOfDay: e.target.value })}
                      className="w-full bg-surface-container-low border border-vellum-outline/10 rounded-xl px-4 py-3 focus:outline-none focus:border-tertiary"
                    >
                      {timeOptions.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-2">Description</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-surface-container-low border border-vellum-outline/10 rounded-xl px-4 py-3 focus:outline-none focus:border-tertiary"
                    placeholder="Brief description of the location..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-2">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full bg-surface-container-low border border-vellum-outline/10 rounded-xl px-4 py-3 focus:outline-none focus:border-tertiary h-24 resize-none"
                    placeholder="Additional notes about this location..."
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={closeModal} className="flex-1 py-3 rounded-xl border border-vellum-outline/10 hover:bg-surface-container-low transition-colors font-bold text-sm">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 py-3 rounded-xl bg-tertiary text-on-tertiary font-bold text-sm hover:brightness-110">
                    {editingLocation ? "Save Changes" : "Create Location"}
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

const WorldTab = ({ icon, label, active = false, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick: () => void }) => (
  <button onClick={onClick} className={`w-full text-left font-label rounded-xl px-6 py-4 flex items-center gap-4 transition-all ${active ? 'bg-surface-container-highest text-tertiary border border-tertiary/10' : 'text-vellum-on-surface-variant hover:bg-surface-container-low'}`}>
    <span className="opacity-80">{icon}</span>
    <span className="font-bold text-sm tracking-tight">{label}</span>
  </button>
);

export default WorldEngine;
