import React, { useMemo } from "react";

interface Scene {
  id: string;
  heading: string;
  pos: number;
}

interface NavigatorProps {
  editor: any;
}

const Navigator: React.FC<NavigatorProps> = ({ editor }) => {
  const scenes = useMemo(() => {
    if (!editor) return [];
    const foundScenes: Scene[] = [];
    editor.state.doc.descendants((node: any, pos: number) => {
      if (node.type.name === "sceneHeading") {
        foundScenes.push({
          id: Math.random().toString(36).substr(2, 9),
          heading: node.textContent || "Untitled Scene",
          pos,
        });
      }
      return true;
    });
    return foundScenes;
  }, [editor?.state.doc]);

  const goToScene = (pos: number) => {
    editor.chain().focus().setTextSelection(pos).scrollIntoView().run();
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-100 w-64 overflow-hidden shrink-0">
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">Navigator</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {scenes.length === 0 ? (
          <div className="p-4 text-xs text-gray-400 italic">No scenes found.</div>
        ) : (
          scenes.map((scene) => (
            <button
              key={scene.id}
              onClick={() => goToScene(scene.pos)}
              className="w-full text-left p-2 rounded hover:bg-gray-50 transition-colors group"
            >
              <span className="text-[10px] font-bold text-gray-400 group-hover:text-blue-500 mr-2">
                SCENE
              </span>
              <span className="text-xs font-semibold text-gray-700 truncate block uppercase">
                {scene.heading}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default Navigator;
