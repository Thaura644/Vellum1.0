import { Extension } from "@tiptap/core";
import Suggestion from "@tiptap/suggestion";
import { PluginKey } from "@tiptap/pm/state";

const SmartTypePluginKey = new PluginKey("smartType");

export const SmartType = Extension.create({
  name: "smartType",

  addOptions() {
    return {
      suggestion: {
        char: "/", // Using a standard trigger for now to debug
        pluginKey: SmartTypePluginKey,
        command: ({ editor, range, props }: any) => {
          editor.chain().focus().insertContentAt(range, props.id).run();
        },
        items: ({ query: _query }: { query: string }) => {
          return [];
        },
        render: () => ({
          onStart: () => {},
          onUpdate: () => {},
          onKeyDown: () => false,
          onExit: () => {},
        }),
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
