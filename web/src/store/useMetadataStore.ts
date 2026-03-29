import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";

const API_URL = "http://localhost:3001/api/projects";

export const useMetadataStore = create<any>((set, get) => ({
  characters: [],
  locations: [],
  notes: [],
  loading: false,

  fetchMetadata: async (projectId: string) => {
    set({ loading: true });
    const token = useAuthStore.getState().token;
    try {
      const res = await fetch(`${API_URL}/${projectId}`, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      set({ characters: data.characters, locations: data.locations, notes: data.notes, loading: false });
    } catch (err) { set({ loading: false }); }
  },

  addCharacter: async (projectId: string, name: string, description?: string) => {
    const token = useAuthStore.getState().token;
    const res = await fetch(`${API_URL}/${projectId}/characters`, {
      method: "POST",
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ name, description })
    });
    const character = await res.json();
    set((state: any) => ({ characters: [...state.characters, character] }));
  },

  deleteCharacter: async (id: string) => {
    const token = useAuthStore.getState().token;
    await fetch(`${API_URL}/characters/${id}`, { method: "DELETE", headers: { 'Authorization': `Bearer ${token}` } });
    set((state: any) => ({ characters: state.characters.filter((c: any) => c.id !== id) }));
  },

  addLocation: async (projectId: string, name: string, description?: string) => {
    const token = useAuthStore.getState().token;
    const res = await fetch(`${API_URL}/${projectId}/locations`, {
      method: "POST",
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ name, description })
    });
    const location = await res.json();
    set((state: any) => ({ locations: [...state.locations, location] }));
  },

  deleteLocation: async (id: string) => {
    const token = useAuthStore.getState().token;
    await fetch(`${API_URL}/locations/${id}`, { method: "DELETE", headers: { 'Authorization': `Bearer ${token}` } });
    set((state: any) => ({ locations: state.locations.filter((l: any) => l.id !== id) }));
  },

  addNote: async (projectId: string, content: string, type?: string) => {
    const token = useAuthStore.getState().token;
    const res = await fetch(`${API_URL}/${projectId}/notes`, {
      method: "POST",
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ content, type })
    });
    const note = await res.json();
    set((state: any) => ({ notes: [...state.notes, note] }));
  },

  deleteNote: async (id: string) => {
    const token = useAuthStore.getState().token;
    await fetch(`${API_URL}/notes/${id}`, { method: "DELETE", headers: { 'Authorization': `Bearer ${token}` } });
    set((state: any) => ({ notes: state.notes.filter((n: any) => n.id !== id) }));
  },
}));
