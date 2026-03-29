import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Editor from "./editor/Editor";
import BeatBoard from "./pages/BeatBoard";
import CharacterGallery from "./pages/CharacterGallery";
import WorldEngine from "./pages/WorldEngine";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

function App() {
  useEffect(() => {
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        document.documentElement.classList.toggle('dark', e.matches);
      }
    };

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/editor" element={<Editor />} />
        <Route path="/editor/:id" element={<Editor />} />
        <Route path="/beat-board" element={<BeatBoard />} />
        <Route path="/characters" element={<CharacterGallery />} />
        <Route path="/world" element={<WorldEngine />} />
      </Routes>
    </Router>
  );
}

export default App;
