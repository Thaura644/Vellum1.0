import { Extension } from "@tiptap/core";
import Suggestion from "@tiptap/suggestion";

export const SmartType = Extension.create({
  name: "smartType",

  addOptions() {
    return {
      suggestion: {
        char: "", // Triggered on any text in specific nodes
        allowSpaces: true,
        startOfLine: true,
        pluginKey: "smartType",
        command: ({ editor, range, props }: any) => {
          editor.chain().focus().insertContentAt(range, props.id).run();
        },
        items: ({ query }: { query: string }) => {
          // The actual filtering happens in the Editor configuration
          return [query]; // Minimal use to satisfy lint
        },
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});

export const getSuggestions = (doc: any, type: string) => {
  const suggestions: string[] = [];
  doc.descendants((node: any) => {
    if (node.type.name === type) {
      const text = node.textContent.trim().toUpperCase();
      if (text && !suggestions.includes(text)) {
        suggestions.push(text);
      }
    }
    return true;
  });
  return suggestions;
};

export default SmartType;
