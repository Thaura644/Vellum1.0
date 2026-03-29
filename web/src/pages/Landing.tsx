import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Zap, Globe, FileText } from "lucide-react";

const Landing = () => {
    return (
        <div className="min-h-screen bg-vellum-background text-vellum-on-surface font-body selection:bg-vellum-primary/30 overflow-hidden">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-vellum-surface/95 shadow-sm dark:shadow-none dark:bg-[#131314]/80 backdrop-blur-xl border-b border-vellum-outline/10 flex justify-between items-center px-8 h-16 transition-colors duration-300">
                <div className="text-xl font-headline font-extrabold tracking-tight text-vellum-primary">Vellum</div>
                <div className="hidden md:flex gap-8 font-headline font-semibold text-sm">
                    <a href="#features" className="text-vellum-on-surface hover:text-vellum-primary transition-colors">Features</a>
                    <a href="#pricing" className="text-vellum-on-surface hover:text-vellum-primary transition-colors">Enterprise</a>
                    <a href="#about" className="text-vellum-on-surface hover:text-vellum-primary transition-colors">Open Source</a>
                </div>
                <div className="flex gap-4 items-center">
                    <Link to="/login" className="hidden sm:block text-vellum-on-surface-variant hover:text-vellum-primary font-label text-xs font-bold uppercase tracking-widest transition-colors mr-4">Sign In</Link>
                    <Link to="/signup" className="bg-vellum-primary text-on-primary px-5 py-2 rounded-lg font-label text-xs font-bold uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-vellum-primary/10">
                        Get Started
                    </Link>
                </div>
            </nav>

            <main className="pt-16">
                {/* Hero Section */}
                <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 text-center overflow-hidden">
                    <div className="absolute inset-0 z-0">
                        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-vellum-primary/10 dark:bg-vellum-primary/10 blur-[120px] rounded-full animate-pulse" />
                        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-tertiary-container/30 dark:bg-tertiary/5 blur-[120px] rounded-full animate-pulse delay-700" />
                    </div>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative z-10 max-w-4xl"
                    >
                        <h1 className="font-headline text-6xl md:text-8xl font-extrabold tracking-tighter mb-8 leading-tight">
                            Structured Dreaming <br/>
                            <span className="text-vellum-primary italic font-medium">Refined</span>.
                        </h1>
                        <p className="text-vellum-on-surface-variant text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
                            The open-source interface designed for the cinematic mind. Experience the tactile flow of paper with the infinite power of a modern digital engine.
                        </p>
                        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                            <Link to="/dashboard" className="w-full md:w-auto bg-vellum-primary text-on-primary px-10 py-5 rounded-xl font-label text-sm font-bold uppercase tracking-widest shadow-2xl shadow-vellum-primary/20 hover:scale-105 active:scale-95 transition-all">
                                Start Writing Free
                            </Link>
                            <button className="w-full md:w-auto px-10 py-5 rounded-xl font-label text-sm font-bold uppercase tracking-widest border border-vellum-outline/30 text-vellum-on-surface hover:bg-vellum-surface transition-all">
                                View Documentation
                            </button>
                        </div>
                    </motion.div>
                </section>

                {/* Feature Bento Grid */}
                <section className="py-32 px-6 max-w-7xl mx-auto" id="features">
                    <div className="mb-20 text-center lg:text-left lg:max-w-2xl">
                        <span className="font-label text-xs font-bold uppercase tracking-[0.3em] text-vellum-primary">Capabilities</span>
                        <h2 className="font-headline text-4xl md:text-5xl font-bold mt-4 leading-tight">Built for the craft, <br/>not just the page.</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                        {/* Large Feature */}
                        <motion.div 
                            whileHover={{ y: -5 }}
                            className="md:col-span-8 bg-surface-container-low rounded-3xl p-10 md:p-16 overflow-hidden relative group border border-vellum-outline/5"
                        >
                            <div className="relative z-10">
                                <h3 className="font-headline text-3xl font-bold mb-6 text-vellum-on-surface">Real-time Cinematic Collaboration</h3>
                                <p className="text-vellum-on-surface-variant text-lg max-w-md leading-relaxed">
                                    Invite directors, producers, or co-writers to your project. Track every change with architectural precision using our immutable history engine.
                                </p>
                            </div>
                            <div className="absolute top-0 right-0 w-64 h-64 bg-vellum-primary/5 rounded-full blur-3xl group-hover:bg-vellum-primary/10 transition-colors" />
                        </motion.div>

                        {/* Mid Feature */}
                        <motion.div 
                            whileHover={{ y: -5 }}
                            className="md:col-span-4 bg-vellum-surface rounded-3xl p-10 border border-vellum-outline/10 flex flex-col justify-between"
                        >
                            <Zap className="text-tertiary w-12 h-12 mb-8" />
                            <div>
                                <h3 className="font-headline text-2xl font-bold mb-4">Distraction Free</h3>
                                <p className="text-sm text-vellum-on-surface-variant leading-relaxed">
                                    Focus Mode hides everything but your thoughts. Fade the world to 10% opacity and let the words flow.
                                </p>
                            </div>
                        </motion.div>

                        {/* Bottom Features */}
                        <div className="md:col-span-5 bg-surface-container-highest/20 rounded-3xl p-10 border border-vellum-outline/10 h-[400px] flex flex-col justify-center">
                             <Globe className="text-vellum-primary w-12 h-12 mb-8" />
                             <h3 className="font-headline text-2xl font-bold mb-4">World Engine</h3>
                             <p className="text-sm text-vellum-on-surface-variant leading-relaxed">
                                Maintain a living database of characters, locations, and lore—integrated directly into your writing environment.
                             </p>
                        </div>

                        <div className="md:col-span-7 bg-surface-container-low rounded-3xl p-10 md:p-16 flex flex-col justify-between border border-vellum-outline/10 relative overflow-hidden">
                             <FileText className="text-vellum-on-surface/20 w-48 h-48 absolute -right-8 -bottom-8 rotate-12" />
                             <div className="relative z-10">
                                <h3 className="font-headline text-3xl font-bold mb-6">Industry-Standard PDF Engine</h3>
                                <p className="text-vellum-on-surface-variant text-lg leading-relaxed max-w-sm">
                                    Every script is perfectly typeset to 12pt Courier Prime, compliant with WGA standards by default.
                                </p>
                             </div>
                             <button className="mt-12 self-start text-vellum-primary font-label text-xs font-bold uppercase tracking-widest flex items-center gap-2 group">
                                Export Sample <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                             </button>
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="py-40 bg-surface-container-lowest text-center px-6">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="font-headline text-5xl md:text-6xl font-extrabold mb-10 tracking-tight leading-tight">
                            The ink is ready. <br/>
                            Where will your <span className="text-tertiary">dream</span> lead?
                        </h2>
                        <Link to="/dashboard" className="inline-block bg-vellum-primary text-on-primary px-14 py-6 rounded-xl font-label text-sm font-bold uppercase tracking-widest shadow-2xl shadow-vellum-primary/10 hover:scale-105 active:scale-95 transition-all">
                            Get Started with Vellum
                        </Link>
                        <p className="mt-10 text-vellum-on-surface-variant text-xs font-label uppercase tracking-[0.3em] opacity-60">Free. Open Source. Forever.</p>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="w-full py-20 border-t border-vellum-outline/10 bg-surface-container-lowest font-label text-[10px] uppercase tracking-widest flex flex-col items-center justify-center space-y-8">
                <div className="flex gap-12 text-vellum-on-surface-variant">
                    <a href="#" className="hover:text-vellum-primary transition-colors underline decoration-vellum-primary/20">Terms</a>
                    <a href="#" className="hover:text-vellum-primary transition-colors underline decoration-vellum-primary/20">Privacy</a>
                    <a href="#" className="hover:text-vellum-primary transition-colors underline decoration-vellum-primary/20">Support</a>
                    <a href="#" className="hover:text-vellum-primary transition-colors underline decoration-vellum-primary/20">API</a>
                </div>
                <div className="text-vellum-primary opacity-60">© 2024 Vellum. The Professional Standard.</div>
            </footer>
        </div>
    );
};

export default Landing;
