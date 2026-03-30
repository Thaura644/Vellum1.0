import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, Bell, Settings, Archive, Users, FileText, Clock, X, PlusCircle, TrendingUp
} from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState("recent");
  const [projects, setProjects] = useState<any[]>([]);
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("BLANK");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/projects", {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setProjects(data);
        }
      } catch (err) { console.error("Failed to fetch projects"); }
    };
    fetchProjects();
  }, [token]);

  const handleCreateProject = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/projects/new", {
        method: "POST",
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ title: newProjectTitle, template: selectedTemplate })
      });
      if (response.ok) {
        const project = await response.json();
        navigate(`/editor/${project.id}`);
      }
    } catch (err) { console.error("Failed to create project"); }
  };

  const templates = [
    { id: "BLANK", name: "Blank Script", desc: "Start from scratch" },
    { id: "FEATURE", name: "Feature Film", desc: "Industry standard 90-120 min" },
    { id: "TV_DRAMA", name: "TV Drama", desc: "60-min dramatic structure" },
    { id: "SITCOM", name: "Sitcom", desc: "30-min multi-cam comedy" },
  ];

  return (
    <div className="min-h-screen bg-vellum-background text-vellum-on-surface flex flex-col font-jakarta">
      <aside className="fixed left-0 top-0 h-full w-20 flex flex-col items-center py-10 glass-panel border-r border-vellum-outline/5 z-40">
         <div className="w-12 h-12 bg-vellum-primary rounded-2xl flex items-center justify-center mb-12 shadow-lg"><span className="text-on-primary font-bold text-xl">V</span></div>
         <div className="flex flex-col gap-10 text-vellum-on-surface-variant">
            <button onClick={() => setCurrentView("recent")} className={`transition-all ${currentView === 'recent' ? 'text-vellum-primary' : 'hover:text-vellum-primary'}`}><FileText size={24} /></button>
            <button onClick={() => setCurrentView("library")} className={`transition-all ${currentView === 'library' ? 'text-vellum-primary' : 'hover:text-vellum-primary'}`}><Archive size={24} /></button>
            <button onClick={() => setCurrentView("community")} className={`transition-all ${currentView === 'community' ? 'text-vellum-primary' : 'hover:text-vellum-primary'}`}><Users size={24} /></button>
         </div>
      </aside>

      <main className="ml-20 flex-1 p-12 max-w-7xl mx-auto w-full">
        <header className="flex justify-between items-center mb-16">
           <div>
              <h1 className="font-headline font-bold text-4xl mb-2 tracking-tight">Writer's Vault</h1>
              <p className="text-vellum-on-surface-variant font-medium opacity-80">Welcome back, {user?.name || "Author"}.</p>
           </div>
           <div className="flex items-center gap-6">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-vellum-on-surface-variant opacity-40 group-focus-within:text-vellum-primary transition-all" size={18} />
                <input type="text" placeholder="Find a manuscript..." className="bg-surface-container-low border border-vellum-outline/10 rounded-2xl pl-12 pr-6 py-3.5 text-sm w-72 focus:outline-none focus:ring-1 ring-vellum-primary" />
              </div>
           </div>
        </header>

        {currentView === "recent" ? (
          <div className="grid grid-cols-12 gap-10">
            <div className="col-span-12 lg:col-span-8 space-y-8">
              <h2 className="font-headline font-bold text-xl uppercase tracking-widest opacity-40 mb-10">Recent Projects</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.map((script) => (
                  <Link to={`/editor/${script.id}`} key={script.id}>
                    <motion.div whileHover={{ y: -5, scale: 1.01 }} className="bg-surface-container-low rounded-3xl p-8 border border-vellum-outline/5 hover:border-vellum-primary/30 transition-all script-shadow group">
                      <div className="flex justify-between items-start mb-10">
                         <div className="w-12 h-16 bg-surface-container-highest rounded-lg flex items-center justify-center border border-vellum-outline/10 group-hover:bg-vellum-primary/10 transition-colors"><FileText size={20} className="text-vellum-on-surface-variant group-hover:text-vellum-primary" /></div>
                         <Clock size={16} className="text-vellum-on-surface-variant opacity-30" />
                      </div>
                      <h3 className="font-headline font-bold text-xl mb-2 text-on-surface">{script.title}</h3>
                      <p className="text-[10px] text-vellum-on-surface-variant font-bold uppercase tracking-[0.2em] mb-8 opacity-60">Updated {new Date(script.updatedAt).toLocaleDateString()}</p>
                      <div className="flex items-center justify-between text-xs font-bold text-vellum-primary uppercase tracking-widest"><span>Continue Writing</span><Plus className="rotate-45" size={16} /></div>
                    </motion.div>
                  </Link>
                ))}
                <button onClick={() => setActiveModal("newProject")} className="border-2 border-dashed border-vellum-outline/10 rounded-3xl flex flex-col items-center justify-center p-12 hover:border-vellum-primary/40 hover:bg-vellum-primary/5 transition-all group min-h-[200px]">
                  <div className="w-14 h-14 rounded-full bg-surface-container-highest flex items-center justify-center mb-6 group-hover:bg-vellum-primary group-hover:text-on-primary transition-colors"><Plus size={28} /></div>
                  <span className="font-headline font-bold text-lg">Start New Project</span>
                </button>
              </div>
            </div>
            <div className="col-span-12 lg:col-span-4">
               <div className="bg-surface-container-low rounded-3xl p-10 border border-vellum-outline/5">
                  <h3 className="font-headline font-bold text-xl mb-8 flex items-center gap-3"><TrendingUp className="text-vellum-primary w-5 h-5" />Writing Velocity</h3>
                  <div className="flex items-end gap-3 h-40 mb-8 px-2">
                     {[40, 65, 30, 85, 95, 70, 20].map((h, i) => (<div key={i} style={{ height: `${h}%` }} className={`flex-1 rounded-t-lg ${h > 80 ? 'bg-vellum-primary' : 'bg-surface-container-highest'}`} />))}
                  </div>
               </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-96 text-center border-2 border-dashed border-vellum-outline/10 rounded-3xl">
             <Archive size={48} className="text-vellum-on-surface-variant opacity-50 mb-6" />
             <h2 className="font-headline text-2xl font-bold mb-2">Personal Library</h2>
          </div>
        )}
      </main>

      <AnimatePresence>
        {activeModal === "newProject" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
             <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-surface-container-lowest border border-vellum-outline/10 rounded-3xl p-10 max-w-2xl w-full shadow-2xl relative">
                <button onClick={() => setActiveModal(null)} className="absolute top-6 right-6 text-vellum-on-surface-variant hover:text-vellum-primary transition-colors"><X size={24} /></button>
                <h2 className="font-headline text-3xl font-bold mb-8">Initialize Script</h2>
                <div className="space-y-8">
                   <div>
                      <label className="text-[10px] font-bold text-vellum-on-surface-variant uppercase tracking-widest block mb-3">Script Title</label>
                      <input value={newProjectTitle} onChange={(e) => setNewProjectTitle(e.target.value)} placeholder="Untitled Masterpiece..." className="w-full bg-surface-container border border-vellum-outline/10 rounded-2xl px-6 py-4 text-lg font-bold focus:outline-none focus:ring-1 ring-vellum-primary" />
                   </div>
                   <div>
                      <label className="text-[10px] font-bold text-vellum-on-surface-variant uppercase tracking-widest block mb-4">Select Blueprint</label>
                      <div className="grid grid-cols-2 gap-4">
                        {templates.map(t => (
                          <button key={t.id} onClick={() => setSelectedTemplate(t.id)} className={`text-left p-5 rounded-2xl border transition-all ${selectedTemplate === t.id ? 'bg-vellum-primary/5 border-vellum-primary ring-1 ring-vellum-primary' : 'bg-surface-container border-vellum-outline/5 hover:border-vellum-primary/30'}`}>
                             <h4 className={`font-bold text-sm mb-1 ${selectedTemplate === t.id ? 'text-vellum-primary' : 'text-on-surface'}`}>{t.name}</h4>
                             <p className="text-[11px] text-vellum-on-surface-variant opacity-70">{t.desc}</p>
                          </button>
                        ))}
                      </div>
                   </div>
                   <button onClick={handleCreateProject} className="w-full bg-vellum-primary text-on-primary font-bold uppercase py-5 rounded-2xl tracking-[0.2em] text-xs hover:brightness-110 shadow-xl active:scale-[0.98] transition-all">Forge Document</button>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
