import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Bell, Settings, FileText, TrendingUp, History, HelpCircle, Archive, PlusCircle, X, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "../components/ThemeToggle";
import { WalkthroughModal } from "../components/WalkthroughModal";
import { useAuthStore } from "../store/useAuthStore";

const Dashboard = () => {
  const [currentView, setCurrentView] = useState<"scripts" | "library" | "community" | "dashboard">("scripts");
  const [activeModal, setActiveModal] = useState<"newProject" | "settings" | "profile" | "notifications" | "archive" | "history" | "newAsset" | "shareProject" | null>(null);
  
  // New Project Wizard State
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState("Feature");
  const [newExcerpt, setNewExcerpt] = useState("");
  
  // Profile Mutability State
  const [mutableGoal, setMutableGoal] = useState<number>(2000);
  const [mutableName, setMutableName] = useState<string>("");
  const [mutableColor, setMutableColor] = useState<string>("#ffb612");
  
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const [scripts, setScripts] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Library State
  const [libraryAssets, setLibraryAssets] = useState<any[]>([]);
  const [libraryCategory, setLibraryCategory] = useState<string>("all");
  
  // Community State
  const [communityProjects, setCommunityProjects] = useState<any[]>([]);
  const [sharedProjects, setSharedProjects] = useState<any[]>([]);
  
  // New Asset Form State
  const [assetName, setAssetName] = useState("");
  const [assetCategory, setAssetCategory] = useState("character_template");
  const [assetDescription, setAssetDescription] = useState("");
  const [assetContent, setAssetContent] = useState("");
  
  // Share Project Form State
  const [shareTitle, setShareTitle] = useState("");
  const [shareExcerpt, setShareExcerpt] = useState("");
  const [shareType, setShareType] = useState("Feature");
  const [shareIsPublic, setShareIsPublic] = useState(false);
  const [shareProjectId, setShareProjectId] = useState("");

  const totalWords = scripts.reduce((acc, s) => acc + (s.words || 0), 0);
  const dailyGoal = profile?.goal || 2000;
  
  // Filter active scripts (opened/edited in last 7 days)
  const activeScriptsCount = scripts.filter(s => new Date(s.updatedAt) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length;
  
  // Natively compute velocity against the user's real total words for today
  const todaysVelocity = Math.min(100, Math.floor((totalWords / Math.max(1, dailyGoal)) * 100));
  const velocityData = [0, 0, 0, 0, 0, 0, todaysVelocity];

  useEffect(() => {
    if (activeModal === "newProject") {
      setNewTitle("");
      setNewType("Feature");
      setNewExcerpt("");
    }
  }, [activeModal]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = useAuthStore.getState().token;
        const res = await fetch("http://localhost:3001/api/projects", {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
            const data = await res.json();
            setScripts(data);
        }
      } catch (err) {
        console.error("Failed to load projects", err);
      } finally {
        setLoading(false);
      }
    };
    const fetchProfile = async () => {
      try {
        const token = useAuthStore.getState().token;
        const res = await fetch("http://localhost:3001/api/auth/me", {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
            const data = await res.json();
            setProfile(data);
            setMutableGoal(data.goal || 2000);
            setMutableName(data.name || "Writer");
            setMutableColor(data.color || "#ffb612");
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      }
    };
    
    fetchProfile();
    fetchProjects();
  }, []);

  useEffect(() => {
    if (currentView !== "library") return;
    const fetchLibrary = async () => {
      try {
        const token = useAuthStore.getState().token;
        const url = libraryCategory === "all" 
          ? "http://localhost:3001/api/library"
          : `http://localhost:3001/api/library?category=${libraryCategory}`;
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setLibraryAssets(data);
        }
      } catch (err) {
        console.error("Failed to load library", err);
      }
    };
    fetchLibrary();
  }, [currentView, libraryCategory]);

  useEffect(() => {
    if (currentView !== "community") return;
    const fetchCommunity = async () => {
      try {
        const token = useAuthStore.getState().token;
        const [sharedRes, publicRes] = await Promise.all([
          fetch("http://localhost:3001/api/community/shared", {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch("http://localhost:3001/api/community/public")
        ]);
        if (sharedRes.ok) {
          const sharedData = await sharedRes.json();
          setSharedProjects(sharedData);
        }
        if (publicRes.ok) {
          const publicData = await publicRes.json();
          setCommunityProjects(publicData);
        }
      } catch (err) {
        console.error("Failed to load community", err);
      }
    };
    fetchCommunity();
  }, [currentView]);

  const updateProfile = async () => {
      try {
          const token = useAuthStore.getState().token;
          const res = await fetch("http://localhost:3001/api/auth/me", {
              method: "PATCH",
              headers: { 
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}` 
              },
              body: JSON.stringify({ name: mutableName, goal: mutableGoal, color: mutableColor })
          });
          if (res.ok) {
              const data = await res.json();
              setProfile(data);
              setActiveModal(null);
          }
      } catch (err) {
          console.error("Failed to update profile", err);
      }
  };

  const createNewProject = async () => {
      try {
          const token = useAuthStore.getState().token;
          const res = await fetch("http://localhost:3001/api/projects/new", {
              method: "POST",
              headers: { 
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}` 
              },
              body: JSON.stringify({
                  title: newTitle || "Untitled Project",
                  type: newType || "Feature",
                  excerpt: newExcerpt || "A brilliant new narrative."
              })
          });
          if (res.ok) {
              const data = await res.json();
              setActiveModal(null);
              navigate(`/editor/${data.id}`);
          }
      } catch (err) {
          console.error("Failed to create project", err);
      }
  };

  return (
    <div className="min-h-screen bg-vellum-background text-vellum-on-surface font-body selection:bg-vellum-primary/30 flex">
      <WalkthroughModal />
      {/* Sidebar */}
      <aside className="w-64 fixed left-0 top-0 h-full bg-surface-container-low border-r border-vellum-outline/10 flex flex-col z-40">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10 group cursor-pointer">
             <div className="w-10 h-10 rounded-lg bg-vellum-primary/10 flex items-center justify-center text-vellum-primary border border-vellum-primary/20 group-hover:bg-vellum-primary group-hover:text-on-primary transition-all">
                <FileText size={20} />
             </div>
             <div>
                <div className="font-headline font-bold text-vellum-primary leading-tight">Vellum</div>
                <div className="text-[10px] text-vellum-on-surface-variant uppercase tracking-widest font-bold">Pro Suite</div>
             </div>
          </div>

          <nav className="space-y-1.5">
            <NavItem icon={<History size={18} />} label="Dashboard" active={currentView === "dashboard" || currentView as any === "scripts"} onClick={() => setCurrentView("dashboard")} />
            <NavItem icon={<TrendingUp size={18} />} label="Library" active={currentView === "library"} onClick={() => setCurrentView("library")} />
            <NavItem icon={<PlusCircle size={18} />} label="Community" active={currentView === "community"} onClick={() => setCurrentView("community")} />
          </nav>
        </div>

        <div className="mt-auto p-6 space-y-4">
               <button onClick={() => setActiveModal("newProject")} className="flex items-center gap-3 bg-vellum-primary text-on-primary px-8 py-3.5 rounded-full font-label font-bold text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-vellum-primary/20 cursor-pointer">
                  <Plus size={16} /> <span>Start New Project</span>
               </button>
           <div className="space-y-1">
              <NavItem icon={<HelpCircle size={18} />} label="Help" onClick={() => alert("Loading Vellum Documentation...")} />
              <NavItem icon={<Archive size={18} />} label="Archive" onClick={() => setActiveModal("archive")} />
              <div className="pt-2 mt-2 border-t border-vellum-outline/10">
                 <button onClick={handleLogout} className="w-full text-left font-label rounded-xl px-4 py-2.5 flex items-center gap-3 transition-all active:scale-95 duration-100 text-red-500 hover:bg-red-500/10 hover:text-red-400">
                    <span className="opacity-80 scale-90"><User size={18} /></span>
                    <span className="font-bold text-[13px] tracking-tight">Sign Out</span>
                 </button>
              </div>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-12">
        <header className="flex justify-between items-end mb-16">
          <div className="space-y-2">
            <h1 className="font-headline text-5xl font-extrabold tracking-tight">Writer's Dashboard</h1>
            <p className="text-vellum-on-surface-variant font-medium">Welcome back, <span className="text-vellum-primary">{profile?.name || "Writer"}</span>. You have {activeScriptsCount} active manuscripts.</p>
          </div>
          <div className="flex gap-4 items-center">
             <ThemeToggle />
             <div className="bg-surface-container-low px-8 py-5 rounded-2xl flex items-center gap-5 border border-vellum-outline/5 hover:bg-surface-container transition-colors">
                <div className="p-3 rounded-full border border-tertiary/30 text-tertiary">
                   <TrendingUp size={20} />
                </div>
                <div>
                   <div className="text-[10px] uppercase tracking-widest text-vellum-on-surface-variant font-label font-bold">Daily Goal</div>
                   <div className="font-headline font-bold text-xl leading-tight">{totalWords.toLocaleString()} / {dailyGoal.toLocaleString()} <span className="text-xs font-normal text-vellum-on-surface-variant">words</span></div>
                </div>
             </div>
             <button onClick={() => setActiveModal("profile")} className="w-12 h-12 ml-4 rounded-full bg-surface-container overflow-hidden border border-vellum-primary/20 flex items-center justify-center text-xs font-bold text-vellum-on-surface-variant hover:border-vellum-primary transition-colors focus:ring-2 focus:ring-vellum-primary/40">
                 <User size={20} />
             </button>
          </div>
        </header>

        {currentView === "dashboard" || currentView === "scripts" ? (
        <div className="grid grid-cols-12 gap-10">
          {/* Scripts Grid */}
          <div className="col-span-12 lg:col-span-8 space-y-10">
            <div className="flex items-center justify-between">
               <h2 className="font-headline text-2xl font-bold">Active Manuscripts</h2>
               <button className="text-vellum-primary text-sm font-bold hover:underline decoration-vellum-primary/30">View All</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {loading ? (
                <div className="col-span-2 text-center text-vellum-on-surface-variant text-xs font-bold uppercase tracking-widest py-10">Loading your manuscripts...</div>
              ) : scripts.length === 0 ? (
                <div className="col-span-2 bg-surface-container-low border border-dashed border-vellum-outline/20 rounded-3xl p-12 text-center">
                    <p className="text-vellum-on-surface-variant font-medium mb-6">You haven't crafted any stories yet.</p>
                    <button onClick={() => setActiveModal("newProject")} className="inline-flex items-center gap-3 bg-surface-container-high px-6 py-3 rounded-full font-label font-bold text-xs uppercase tracking-widest hover:bg-surface-container-highest transition-colors">
                        <Plus size={16} /> Start Writing
                    </button>
                </div>
              ) : scripts.map(script => (
                <Link to={`/editor/${script.id}`} key={script.id}>
                  <motion.div 
                    whileHover={{ y: -5 }}
                    className="bg-surface-container-low p-10 rounded-3xl border border-vellum-outline/5 hover:border-vellum-primary/20 transition-all relative overflow-hidden group"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-vellum-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex justify-between items-start mb-8">
                       <span className="bg-vellum-primary/10 text-vellum-primary text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest">{script.type}</span>
                       <span className="text-vellum-on-surface-variant text-[10px] font-bold uppercase tracking-widest">
                           {script.updatedAt ? formatDistanceToNow(new Date(script.updatedAt), { addSuffix: true }) : 'Just now'}
                       </span>
                    </div>
                    <h3 className="font-headline text-3xl font-bold mb-4">{script.title}</h3>
                    <p className="text-vellum-on-surface-variant text-sm mb-10 leading-relaxed font-medium">
                       {script.excerpt}
                    </p>
                    <div className="space-y-3">
                       <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
                          <span className="text-vellum-on-surface-variant">Progress</span>
                          <span>{script.progress}%</span>
                       </div>
                       <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${script.progress}%` }}
                            className="h-full bg-vellum-primary" 
                          />
                       </div>
                    </div>
                  </motion.div>
                </Link>
              ))}

              <button onClick={() => setActiveModal("newProject")} className="border-2 border-dashed border-vellum-outline/10 rounded-3xl flex flex-col items-center justify-center p-12 hover:border-vellum-primary/40 hover:bg-vellum-primary/5 transition-all group">
                <div className="w-14 h-14 rounded-full bg-surface-container-highest flex items-center justify-center mb-6 group-hover:bg-vellum-primary group-hover:text-on-primary transition-colors">
                   <Plus size={28} />
                </div>
                <span className="font-headline font-bold text-lg">Start New Project</span>
                <span className="text-xs text-vellum-on-surface-variant mt-2 font-bold uppercase tracking-widest opacity-60">Blank page or Template</span>
              </button>
            </div>
          </div>

          {/* Stats & Activity */}
          <div className="col-span-12 lg:col-span-4 space-y-10">
            <div className="bg-surface-container-low rounded-3xl p-10 border border-vellum-outline/5">
               <h3 className="font-headline font-bold text-xl mb-8 flex items-center gap-3">
                  <TrendingUp className="text-vellum-primary w-5 h-5" />
                  Writing Velocity
               </h3>
               <div className="flex items-end gap-3 h-40 mb-8 px-2">
                  {velocityData.map((h, i) => (
                    <motion.div 
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      className={`flex-1 rounded-t-lg ${h > 0 ? (h > 80 ? 'bg-vellum-primary' : 'bg-surface-container-highest') : 'bg-surface-container border-b-2 border-vellum-outline/10'}`} 
                    />
                  ))}
               </div>
               <div className="flex justify-between text-[10px] text-vellum-on-surface-variant font-bold uppercase tracking-widest px-1">
                  <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
               </div>
            </div>

            <div className="bg-surface-container-low rounded-3xl p-10 border border-vellum-outline/5">
               <h3 className="font-headline font-bold text-xl mb-8 flex items-center gap-3">
                  <History className="text-tertiary w-5 h-5" />
                  Recent Activity
               </h3>
               <div className="space-y-8">
                  <ActivityItem dot="bg-vellum-primary" title="Edited Scene 24 in 'Neon Shadows'" time="15 minutes ago" />
                  <ActivityItem dot="bg-tertiary" title="Added Character Bio: 'Agent K'" time="3 hours ago" />
                  <ActivityItem dot="bg-vellum-outline" title="Exported PDF Draft 1.1" time="Yesterday" />
               </div>
               <button onClick={() => setActiveModal("history")} className="w-full mt-10 py-3 text-[10px] font-bold text-vellum-on-surface-variant hover:text-vellum-primary transition-colors uppercase tracking-[0.2em] border border-vellum-outline/10 rounded-xl">
                  View Full History
               </button>
            </div>
          </div>
        </div>
        ) : currentView === "library" ? (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="font-headline text-2xl font-bold">Personal Library</h2>
              <button onClick={() => setActiveModal("newAsset")} className="flex items-center gap-2 bg-vellum-primary text-on-primary px-6 py-3 rounded-full font-label font-bold text-xs uppercase tracking-widest hover:brightness-110">
                <Plus size={16} /> Add Asset
              </button>
            </div>
            <div className="flex gap-3 flex-wrap">
              {["all", "character_template", "location_template", "beat_sheet", "outline", "reference"].map(cat => (
                <button key={cat} onClick={() => setLibraryCategory(cat)} className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-colors ${libraryCategory === cat ? 'bg-vellum-primary text-on-primary' : 'bg-surface-container-high text-vellum-on-surface-variant hover:bg-surface-container-highest'}`}>
                  {cat.replace("_", " ")}
                </button>
              ))}
            </div>
            {libraryAssets.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center border-2 border-dashed border-vellum-outline/10 rounded-3xl">
                <Archive size={48} className="text-vellum-on-surface-variant opacity-50 mb-6" />
                <p className="text-vellum-on-surface-variant max-w-sm">No assets yet. Add character templates, location templates, beat sheets, and more.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {libraryAssets.map(asset => (
                  <div key={asset.id} className="bg-surface-container-low p-6 rounded-2xl border border-vellum-outline/10 hover:border-vellum-primary/20 transition-colors">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        asset.category === "character_template" ? "bg-blue-500/10 text-blue-500" :
                        asset.category === "location_template" ? "bg-green-500/10 text-green-500" :
                        asset.category === "beat_sheet" ? "bg-purple-500/10 text-purple-500" :
                        "bg-orange-500/10 text-orange-500"
                      }`}>
                        <FileText size={18} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-vellum-on-surface">{asset.name}</h3>
                        <p className="text-[10px] text-vellum-on-surface-variant uppercase tracking-widest">{asset.category?.replace("_", " ")}</p>
                      </div>
                    </div>
                    {asset.description && <p className="text-sm text-vellum-on-surface-variant mb-4">{asset.description}</p>}
                    <p className="text-[10px] text-vellum-on-surface-variant">Added {formatDistanceToNow(new Date(asset.createdAt), { addSuffix: true })}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-headline text-2xl font-bold">Community Connect</h2>
                <p className="text-vellum-on-surface-variant">Discover scripts, collaborate, and get feedback</p>
              </div>
              <button onClick={() => setActiveModal("shareProject")} className="flex items-center gap-2 bg-vellum-primary text-on-primary px-6 py-3 rounded-full font-label font-bold text-xs uppercase tracking-widest hover:brightness-110">
                <Plus size={16} /> Share Script
              </button>
            </div>
            
            {sharedProjects.length > 0 && (
              <div>
                <h3 className="font-headline text-lg font-bold mb-4">Your Shared Scripts</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sharedProjects.map(project => (
                    <div key={project.id} className="bg-surface-container-low p-6 rounded-2xl border border-vellum-primary/20">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-bold text-lg">{project.title}</h4>
                        <span className={`text-[10px] px-2 py-1 rounded-full ${project.isPublic ? "bg-green-500/20 text-green-500" : "bg-gray-500/20 text-gray-500"}`}>
                          {project.isPublic ? "Public" : "Private"}
                        </span>
                      </div>
                      <p className="text-sm text-vellum-on-surface-variant mb-4">{project.excerpt}</p>
                      <div className="flex items-center gap-2 text-xs text-vellum-on-surface-variant">
                        <div className="w-6 h-6 rounded-full bg-vellum-primary/20 flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: project.owner?.color + "20" }}>
                          {project.owner?.name?.charAt(0)}
                        </div>
                        <span>{project.owner?.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div>
              <h3 className="font-headline text-lg font-bold mb-4">Discover Scripts</h3>
              {communityProjects.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center border-2 border-dashed border-vellum-outline/10 rounded-3xl">
                  <PlusCircle size={48} className="text-vellum-primary opacity-50 mb-6" />
                  <p className="text-vellum-on-surface-variant max-w-sm">No public scripts available yet. Be the first to share!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {communityProjects.map(project => (
                    <div key={project.id} className="bg-surface-container-low p-6 rounded-2xl border border-vellum-outline/10 hover:border-vellum-primary/20 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <span className="bg-vellum-primary/10 text-vellum-primary text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest">{project.type}</span>
                        <span className="text-[10px] text-vellum-on-surface-variant">{formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}</span>
                      </div>
                      <h4 className="font-headline font-bold text-xl mb-2">{project.title}</h4>
                      <p className="text-sm text-vellum-on-surface-variant mb-4 line-clamp-2">{project.excerpt}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: project.owner?.color + "20", color: project.owner?.color }}>
                            {project.owner?.name?.charAt(0)}
                          </div>
                          <span className="text-xs font-medium">{project.owner?.name}</span>
                        </div>
                        <button className="text-xs font-bold text-vellum-primary uppercase tracking-widest hover:underline">View</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Floating Toolbar */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 glass-panel px-8 py-4 rounded-full flex items-center gap-10 border border-white/5 shadow-2xl z-50">
         <div className="flex items-center gap-2 text-vellum-primary font-bold">
            <div className="w-2 h-2 rounded-full bg-vellum-primary animate-pulse" />
            <span className="text-[10px] uppercase tracking-widest">Sync Active</span>
         </div>
         <div className="w-[1px] h-6 bg-vellum-outline/20" />
         <div className="flex gap-6 text-vellum-on-surface-variant">
            <button onClick={() => setActiveModal("notifications")} className="hover:text-vellum-primary transition-colors"><Bell size={20} /></button>
            <button onClick={() => setActiveModal("settings")} className="hover:text-vellum-primary transition-colors"><Settings size={20} /></button>
            <button onClick={() => alert("Loading Help Center...")} className="hover:text-vellum-primary transition-colors"><HelpCircle size={20} /></button>
         </div>
      </div>

      {/* Global Modals overlay */}
      <AnimatePresence>
        {activeModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
             <motion.div 
               initial={{ scale: 0.95, y: 20 }}
               animate={{ scale: 1, y: 0 }}
               exit={{ scale: 0.95, y: 20 }}
               className="bg-surface-container-lowest border border-vellum-outline/10 rounded-3xl p-8 max-w-md w-full shadow-2xl relative"
             >
                <button 
                  onClick={() => setActiveModal(null)} 
                  className="absolute top-6 right-6 text-vellum-on-surface-variant hover:text-vellum-primary"
                >
                    <X size={20} />
                </button>
                 <div className="mb-8">
                    <h2 className="font-headline text-2xl font-bold uppercase tracking-wide">
                       {activeModal === "newProject" && "New Project"}
                       {activeModal === "settings" && "Preferences"}
                       {activeModal === "profile" && "Writer Profile"}
                       {activeModal === "notifications" && "Alerts"}
                       {activeModal === "archive" && "Vault"}
                       {activeModal === "history" && "Activity Log"}
                       {activeModal === "newAsset" && "Add Library Asset"}
                       {activeModal === "shareProject" && "Share Script"}
                    </h2>
                 </div>
                 <div className="flex flex-col gap-4">
                    <p className="text-vellum-on-surface-variant text-sm">
                       {activeModal === "newProject" && "Define the architecture of your next great narrative below to properly initialize your environment."}
                       {activeModal === "settings" && "Configure application theme, PDF export defaults, and cloud synching settings."}
                       {activeModal === "profile" && "Update your pen name, email address, and WGA registry information."}
                       {activeModal === "notifications" && "You have 2 new comments on 'Quiet Hours' from your co-writer."}
                       {activeModal === "archive" && "Here you can find all projects you've marked as archived or moved to the vault."}
                       {activeModal === "history" && "Detailed breakdown of all edits, saves, and character adjustments over the past 30 days."}
                       {activeModal === "newAsset" && "Add templates and assets to your personal library."}
                       {activeModal === "shareProject" && "Share your script with the community or collaborate with specific writers."}
                    </p>
                   {activeModal === "newProject" && (
                       <div className="space-y-4 mt-4 text-left">
                           <div>
                               <label className="text-[10px] font-bold text-vellum-on-surface-variant uppercase tracking-widest">Manuscript Title</label>
                               <input value={newTitle} onChange={e => setNewTitle(e.target.value)} type="text" placeholder="e.g. Neon Shadows" className="w-full bg-surface-container rounded-xl px-4 py-3 mt-1 text-sm outline-none focus:ring-1 focus:ring-vellum-primary/50 text-vellum-on-surface" />
                           </div>
                           <div>
                               <label className="text-[10px] font-bold text-vellum-on-surface-variant uppercase tracking-widest">Format Template</label>
                               <select value={newType} onChange={e => setNewType(e.target.value)} className="w-full bg-surface-container rounded-xl px-4 py-3 mt-1 text-sm outline-none focus:ring-1 focus:ring-vellum-primary/50 text-vellum-on-surface">
                                   <option value="Feature">Feature Screenplay</option>
                                   <option value="TV Pilot">TV Pilot (One-Hour)</option>
                                   <option value="Sitcom">Sitcom (Half-Hour)</option>
                                   <option value="Novel">Novel / Prose</option>
                               </select>
                           </div>
                           <div>
                               <label className="text-[10px] font-bold text-vellum-on-surface-variant uppercase tracking-widest">Logline / Notes</label>
                               <input value={newExcerpt} onChange={e => setNewExcerpt(e.target.value)} type="text" placeholder="A brief summary..." className="w-full bg-surface-container rounded-xl px-4 py-3 mt-1 text-sm outline-none focus:ring-1 focus:ring-vellum-primary/50 text-vellum-on-surface" />
                           </div>
                            <button onClick={createNewProject} className="w-full mt-4 bg-vellum-primary text-on-primary font-bold uppercase py-3 rounded-xl tracking-widest text-xs hover:brightness-110 shadow-lg">
                                Initialize Script
                            </button>
                        </div>
                    )}
                    {activeModal === "newAsset" && (
                        <div className="space-y-4 mt-4 text-left">
                            <div>
                                <label className="text-[10px] font-bold text-vellum-on-surface-variant uppercase tracking-widest">Asset Name</label>
                                <input value={assetName} onChange={e => setAssetName(e.target.value)} type="text" placeholder="e.g. Character Bio Template" className="w-full bg-surface-container rounded-xl px-4 py-3 mt-1 text-sm outline-none focus:ring-1 focus:ring-vellum-primary/50 text-vellum-on-surface" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-vellum-on-surface-variant uppercase tracking-widest">Category</label>
                                <select value={assetCategory} onChange={e => setAssetCategory(e.target.value)} className="w-full bg-surface-container rounded-xl px-4 py-3 mt-1 text-sm outline-none focus:ring-1 focus:ring-vellum-primary/50 text-vellum-on-surface">
                                    <option value="character_template">Character Template</option>
                                    <option value="location_template">Location Template</option>
                                    <option value="beat_sheet">Beat Sheet</option>
                                    <option value="outline">Outline</option>
                                    <option value="reference">Reference</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-vellum-on-surface-variant uppercase tracking-widest">Description</label>
                                <input value={assetDescription} onChange={e => setAssetDescription(e.target.value)} type="text" placeholder="Brief description..." className="w-full bg-surface-container rounded-xl px-4 py-3 mt-1 text-sm outline-none focus:ring-1 focus:ring-vellum-primary/50 text-vellum-on-surface" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-vellum-on-surface-variant uppercase tracking-widest">Content (Optional)</label>
                                <textarea value={assetContent} onChange={e => setAssetContent(e.target.value)} placeholder="Template content or notes..." className="w-full bg-surface-container rounded-xl px-4 py-3 mt-1 text-sm outline-none focus:ring-1 focus:ring-vellum-primary/50 text-vellum-on-surface h-24 resize-none" />
                            </div>
                            <button onClick={async () => {
                                try {
                                    const token = useAuthStore.getState().token;
                                    await fetch("http://localhost:3001/api/library", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                                        body: JSON.stringify({ name: assetName, category: assetCategory, description: assetDescription, content: assetContent })
                                    });
                                    setActiveModal(null);
                                    setAssetName(""); setAssetCategory("character_template"); setAssetDescription(""); setAssetContent("");
                                    window.location.reload();
                                } catch (err) {
                                    console.error("Failed to create asset", err);
                                }
                            }} className="w-full mt-4 bg-vellum-primary text-on-primary font-bold uppercase py-3 rounded-xl tracking-widest text-xs hover:brightness-110 shadow-lg">
                                Add to Library
                            </button>
                        </div>
                    )}
                    {activeModal === "shareProject" && (
                        <div className="space-y-4 mt-4 text-left">
                            <div>
                                <label className="text-[10px] font-bold text-vellum-on-surface-variant uppercase tracking-widest">Project to Share</label>
                                <select value={shareProjectId} onChange={e => {
                                    setShareProjectId(e.target.value);
                                    const proj = scripts.find(s => s.id === e.target.value);
                                    if (proj) { setShareTitle(proj.title); setShareExcerpt(proj.excerpt); setShareType(proj.type); }
                                }} className="w-full bg-surface-container rounded-xl px-4 py-3 mt-1 text-sm outline-none focus:ring-1 focus:ring-vellum-primary/50 text-vellum-on-surface">
                                    <option value="">Select a project...</option>
                                    {scripts.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-vellum-on-surface-variant uppercase tracking-widest">Title</label>
                                <input value={shareTitle} onChange={e => setShareTitle(e.target.value)} type="text" placeholder="Public title" className="w-full bg-surface-container rounded-xl px-4 py-3 mt-1 text-sm outline-none focus:ring-1 focus:ring-vellum-primary/50 text-vellum-on-surface" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-vellum-on-surface-variant uppercase tracking-widest">Logline</label>
                                <input value={shareExcerpt} onChange={e => setShareExcerpt(e.target.value)} type="text" placeholder="Brief summary..." className="w-full bg-surface-container rounded-xl px-4 py-3 mt-1 text-sm outline-none focus:ring-1 focus:ring-vellum-primary/50 text-vellum-on-surface" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-vellum-on-surface-variant uppercase tracking-widest">Visibility</label>
                                <div className="flex gap-4 mt-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" checked={shareIsPublic} onChange={() => setShareIsPublic(true)} className="accent-vellum-primary" />
                                        <span className="text-sm">Public</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" checked={!shareIsPublic} onChange={() => setShareIsPublic(false)} className="accent-vellum-primary" />
                                        <span className="text-sm">Private (invite only)</span>
                                    </label>
                                </div>
                            </div>
                            <button onClick={async () => {
                                try {
                                    const token = useAuthStore.getState().token;
                                    await fetch("http://localhost:3001/api/community/share", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                                        body: JSON.stringify({ title: shareTitle, excerpt: shareExcerpt, type: shareType, projectId: shareProjectId, isPublic: shareIsPublic })
                                    });
                                    setActiveModal(null);
                                    setShareTitle(""); setShareExcerpt(""); setShareType("Feature"); setShareIsPublic(false); setShareProjectId("");
                                    window.location.reload();
                                } catch (err) {
                                    console.error("Failed to share project", err);
                                }
                            }} className="w-full mt-4 bg-vellum-primary text-on-primary font-bold uppercase py-3 rounded-xl tracking-widest text-xs hover:brightness-110 shadow-lg">
                                Share Script
                            </button>
                        </div>
                    )}
                 </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Profile Modal */}
      {activeModal === "profile" && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-surface-container-low p-8 rounded-3xl w-full max-w-md relative border border-vellum-outline/10 shadow-2xl">
                <button onClick={() => setActiveModal(null)} className="absolute top-6 right-6 text-vellum-on-surface-variant hover:text-vellum-primary"><X size={20}/></button>
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 rounded-full bg-surface-container-highest border border-vellum-primary/30 flex items-center justify-center text-xl font-bold">{profile?.name?.charAt(0) || "U"}</div>
                    <div>
                        <input value={mutableName} onChange={e => setMutableName(e.target.value)} className="text-2xl font-headline font-bold bg-transparent border-b border-vellum-outline/20 focus:border-vellum-primary outline-none text-vellum-on-surface w-full" placeholder="Your Name" />
                        <p className="text-sm text-vellum-on-surface-variant font-medium mt-1">{profile?.email}</p>
                    </div>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="text-[10px] font-bold text-vellum-on-surface-variant uppercase tracking-widest">Target Daily Goal (Words)</label>
                        <input type="number" value={mutableGoal} onChange={e => setMutableGoal(parseInt(e.target.value) || 0)} className="w-full bg-surface-container rounded-xl px-4 py-3 mt-1 text-sm outline-none focus:ring-1 focus:ring-vellum-primary/50 text-vellum-on-surface font-bold" />
                    </div>
                    <div><label className="text-[10px] font-bold text-vellum-on-surface-variant uppercase tracking-widest">Account Color Identity</label>
                        <div className="flex gap-2 mt-2">
                            {['#ffb612', '#ef4444', '#3b82f6', '#10b981', '#a855f7'].map(c => (
                                <div key={c} onClick={() => setMutableColor(c)} className={`w-8 h-8 rounded-full border-2 ${mutableColor === c ? 'border-vellum-on-surface-variant' : 'border-transparent'} cursor-pointer transition-all hover:scale-110`} style={{ backgroundColor: c }} />
                            ))}
                        </div>
                    </div>
                    <button onClick={updateProfile} className="w-full mt-6 bg-vellum-primary text-on-primary font-bold uppercase py-3 rounded-xl tracking-widest text-xs hover:brightness-110 shadow-lg active:scale-95 transition-all">Save Changes</button>
                </div>
            </motion.div>
        </div>
      )}
      
      {/* Archive Modal */}
      {activeModal === "archive" && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-surface-container-low p-8 rounded-3xl w-full max-w-lg relative border border-vellum-outline/10 shadow-2xl">
                <button onClick={() => setActiveModal(null)} className="absolute top-6 right-6 text-vellum-on-surface-variant hover:text-vellum-primary"><X size={20}/></button>
                <h2 className="text-2xl font-headline font-bold mb-2">Archived Projects</h2>
                <p className="text-xs text-vellum-on-surface-variant font-medium mb-8">Projects here are hidden from your main dashboard but can be safely restored at any time.</p>
                <div className="bg-surface-container-highest border border-dashed border-vellum-outline/20 rounded-2xl p-12 text-center text-sm text-vellum-on-surface-variant font-medium">
                    No archived projects found.
                </div>
            </motion.div>
        </div>
      )}
    </div>
  );
};

const NavItem = ({ icon, label, active = false, onClick }: any) => (
  <button onClick={onClick} className={`w-full ${active ? 'bg-surface-container-highest text-vellum-primary border-l-2 border-vellum-primary' : 'text-vellum-on-surface-variant hover:bg-surface-container hover:text-on-surface border-l-2 border-transparent'} font-label rounded-e-xl px-5 py-3 flex items-center gap-4 active:scale-95 duration-100 transition-all`}>
    <span className="opacity-80">{icon}</span>
    <span className="font-bold text-sm tracking-tight">{label}</span>
  </button>
);

const ActivityItem = ({ dot, title, time }: any) => (
  <div className="flex gap-5">
    <div className={`w-2.5 h-2.5 rounded-full ${dot} mt-1.5 shrink-0 shadow-[0_0_10px_rgba(0,0,0,0.5)]`} />
    <div>
      <div className="text-sm font-bold text-vellum-on-surface leading-snug">{title}</div>
      <div className="text-[10px] text-vellum-on-surface-variant font-bold uppercase tracking-widest mt-1 opacity-60">{time}</div>
    </div>
  </div>
);

export default Dashboard;
