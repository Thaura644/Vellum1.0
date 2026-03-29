import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, X, ChevronRight, PenTool, CheckCircle2, Film } from "lucide-react";

const walkthroughSteps = [
    {
        title: "1. Develop the Core Concept",
        icon: <BookOpen className="text-vellum-primary w-8 h-8" />,
        content: (
            <div className="space-y-3 mt-4 text-sm text-vellum-on-surface-variant">
                <p>Before writing scenes, you must have a solid foundation.</p>
                <ul className="space-y-2 list-disc pl-4 marker:text-vellum-primary">
                    <li><strong className="text-vellum-on-surface">Logline:</strong> Summarize your movie in one or two sentences. It should include the protagonist, their goal, the conflict, and the stakes.</li>
                    <li><strong className="text-vellum-on-surface">Characters:</strong> Create compelling characters with clear motivations, flaws, and desires. Define a protagonist and an antagonist.</li>
                    <li><strong className="text-vellum-on-surface">Structure (Three-Act):</strong>
                        <ul className="pl-4 mt-1 space-y-1 text-xs opacity-80">
                            <li>• Act I (Setup): Introduce the world and the conflict.</li>
                            <li>• Act II (Confrontation): The protagonist faces obstacles.</li>
                            <li>• Act III (Resolution): The climax and final outcome.</li>
                        </ul>
                    </li>
                </ul>
            </div>
        )
    },
    {
        title: "2. Outline and Treat",
        icon: <PenTool className="text-vellum-primary w-8 h-8" />,
        content: (
            <div className="space-y-3 mt-4 text-sm text-vellum-on-surface-variant">
                <ul className="space-y-2 list-disc pl-4 marker:text-vellum-primary">
                    <li><strong className="text-vellum-on-surface">Beat Sheet:</strong> List the major plot points (beats) of your story in order.</li>
                    <li><strong className="text-vellum-on-surface">Treatment:</strong> Write a prose version of your movie, like a short story, detailing the scenes and character arcs before you write a single line of dialogue.</li>
                </ul>
            </div>
        )
    },
    {
        title: "3. Master Formatting",
        icon: <Film className="text-vellum-primary w-8 h-8" />,
        content: (
            <div className="space-y-3 mt-4 text-sm text-vellum-on-surface-variant">
                <p>Industry standards are crucial. Vellum handles these natively:</p>
                <ul className="space-y-2 list-disc pl-4 marker:text-vellum-primary">
                    <li><strong className="text-vellum-on-surface">Font & Margins:</strong> 12-point Courier, 1.5-inch left, 1-inch right.</li>
                    <li><strong className="text-vellum-on-surface">Scene Headings:</strong> Indicate if it's interior/exterior, location, and time (e.g., <span className="font-mono text-vellum-primary bg-vellum-primary/10 px-1">INT. COFFEE SHOP - DAY</span>).</li>
                    <li><strong className="text-vellum-on-surface">Action Lines:</strong> Describe what is happening visually in present tense.</li>
                    <li><strong className="text-vellum-on-surface">Characters & Dialogue:</strong> Centered naturally, concise.</li>
                </ul>
            </div>
        )
    },
    {
        title: "4. Write the First Draft",
        icon: <CheckCircle2 className="text-vellum-primary w-8 h-8" />,
        content: (
            <div className="space-y-3 mt-4 text-sm text-vellum-on-surface-variant">
                <ul className="space-y-2 list-disc pl-4 marker:text-vellum-primary">
                    <li><strong className="text-vellum-on-surface">Show, Don't Tell:</strong> Focus on visual storytelling. Describe actions that show emotion.</li>
                    <li><strong className="text-vellum-on-surface">Dialogue:</strong> Keep it natural. Avoid "on-the-nose" dialogue where characters state their motives bluntly.</li>
                    <li><strong className="text-vellum-on-surface">Finish:</strong> Focus on completing the draft, not perfecting it. Keep moving forward!</li>
                </ul>
                <div className="mt-6 p-4 bg-tertiary-container/30 border-l-4 border-tertiary rounded-r-xl">
                    <p className="text-tertiary font-bold text-xs uppercase tracking-widest mb-1">Final Pro-Tip</p>
                    <p className="text-xs">Take a break. Let the script sit before editing to gain fresh perspective. Tighten scenes (arrive late, leave early). Above all, action beats dialogue.</p>
                </div>
            </div>
        )
    }
];

export const WalkthroughModal = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        const hasSeen = localStorage.getItem("vellum_has_seen_walkthrough");
        if (!hasSeen) {
            setIsOpen(true);
        }
    }, []);

    const dismiss = () => {
        localStorage.setItem("vellum_has_seen_walkthrough", "true");
        setIsOpen(false);
    };

    const nextStep = () => {
        if (currentStep < walkthroughSteps.length - 1) {
            setCurrentStep(c => c + 1);
        } else {
            dismiss();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={dismiss}
                    />
                    
                    <motion.div 
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="relative w-full max-w-2xl bg-surface-container-highest border border-vellum-outline/10 shadow-2xl rounded-3xl overflow-hidden flex flex-col md:flex-row"
                    >
                        {/* Sidebar Timeline */}
                        <div className="hidden md:block w-1/3 bg-surface-container-low p-6 border-r border-vellum-outline/10">
                            <h3 className="font-headline font-bold text-lg mb-8">Screenplay Guide</h3>
                            <div className="space-y-6 relative before:absolute before:inset-y-2 before:left-[11px] before:w-px before:bg-vellum-outline/20">
                                {walkthroughSteps.map((step, idx) => (
                                    <div key={idx} className="relative flex items-start gap-4">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center -ml-[2px] transition-all z-10 ${currentStep >= idx ? 'bg-vellum-primary text-on-primary ring-4 ring-surface-container-low' : 'bg-surface-container-highest text-vellum-on-surface-variant ring-4 ring-surface-container-low'}`}>
                                            <span className="text-[10px] font-bold">{idx + 1}</span>
                                        </div>
                                        <span className={`text-xs font-bold font-label transition-colors pt-1 ${currentStep >= idx ? 'text-on-surface' : 'text-vellum-on-surface-variant'}`}>
                                            {step.title.split('. ')[1]}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Main Content Area */}
                        <div className="flex-1 p-8 md:p-10 flex flex-col min-h-[400px]">
                            <button onClick={dismiss} className="absolute top-6 right-6 text-vellum-on-surface-variant hover:text-white transition-colors">
                                <X size={20} />
                            </button>

                            <AnimatePresence mode="wait">
                                <motion.div 
                                    key={currentStep}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex-1"
                                >
                                    <div className="mb-6 inline-flex p-4 rounded-2xl bg-vellum-primary/10">
                                        {walkthroughSteps[currentStep].icon}
                                    </div>
                                    <h2 className="text-2xl font-headline font-bold">{walkthroughSteps[currentStep].title}</h2>
                                    {walkthroughSteps[currentStep].content}
                                </motion.div>
                            </AnimatePresence>

                            <div className="mt-8 pt-6 border-t border-vellum-outline/10 flex justify-between items-center">
                                <p className="text-xs text-vellum-on-surface-variant font-bold uppercase tracking-widest underline cursor-pointer hover:text-on-surface transition-colors" onClick={dismiss}>
                                    Skip
                                </p>
                                <button 
                                    onClick={nextStep}
                                    className="bg-vellum-primary text-on-primary px-6 py-2.5 rounded-xl font-bold font-label text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
                                >
                                    {currentStep === walkthroughSteps.length - 1 ? 'Start Writing' : 'Next Step'} <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
