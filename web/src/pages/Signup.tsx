import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, User } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";

const Signup = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const setAuth = useAuthStore(state => state.setAuth);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const res = await fetch("http://localhost:3001/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to register");
            
            setAuth(data.token, data.user);
            navigate("/dashboard");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="min-h-screen bg-vellum-background text-vellum-on-surface font-body flex items-center justify-center p-6">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-surface-container-low p-10 rounded-3xl border border-vellum-outline/10 shadow-2xl"
            >
                <div className="text-center mb-10">
                    <Link to="/" className="text-3xl font-headline font-extrabold tracking-tight text-vellum-primary mb-4 inline-block">Vellum</Link>
                    <h1 className="text-2xl font-bold font-headline mt-4">Start Your Journey</h1>
                    <p className="text-vellum-on-surface-variant text-sm mt-2 font-medium">Join the next generation of storytellers.</p>
                </div>

                <form className="space-y-6" onSubmit={handleSignup}>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-vellum-on-surface-variant ml-1">Full Name</label>
                        <div className="relative flex items-center">
                            <User size={18} className="absolute left-4 text-vellum-on-surface-variant" />
                            <input 
                                type="text" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="John Doe" 
                                required
                                className="w-full bg-surface-container-lowest border border-vellum-outline/20 rounded-xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-vellum-primary/20 focus:border-vellum-primary transition-all outline-none text-sm font-medium"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-vellum-on-surface-variant ml-1">Email Address</label>
                        <div className="relative flex items-center">
                            <Mail size={18} className="absolute left-4 text-vellum-on-surface-variant" />
                            <input 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com" 
                                required
                                className="w-full bg-surface-container-lowest border border-vellum-outline/20 rounded-xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-vellum-primary/20 focus:border-vellum-primary transition-all outline-none text-sm font-medium"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-vellum-on-surface-variant ml-1">Password</label>
                        <div className="relative flex items-center">
                            <Lock size={18} className="absolute left-4 text-vellum-on-surface-variant" />
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••" 
                                required
                                className="w-full bg-surface-container-lowest border border-vellum-outline/20 rounded-xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-vellum-primary/20 focus:border-vellum-primary transition-all outline-none text-sm font-medium"
                            />
                        </div>
                    </div>

                    {error && <div className="text-red-500 text-xs font-bold text-center bg-red-500/10 py-2 rounded-lg border border-red-500/20">{error}</div>}

                    <button type="submit" disabled={loading} className="w-full block bg-vellum-primary text-on-primary rounded-xl py-4 font-label font-bold text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-vellum-primary/10 text-center disabled:opacity-50">
                        {loading ? "Creating Account..." : "Create Account"}
                    </button>
                </form>

                <div className="mt-10 pt-10 border-t border-vellum-outline/10 text-center">
                    <p className="text-xs text-vellum-on-surface-variant font-medium">
                        Already have an account? <Link to="/login" className="text-vellum-primary font-bold hover:underline">Sign In</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Signup;
