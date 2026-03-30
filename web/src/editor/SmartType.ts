import { Extension } from "@tiptap/core";
import Suggestion from "@tiptap/suggestion";
import { PluginKey } from "@tiptap/pm/state";
import { ReactRenderer } from "@tiptap/react";
import tippy from "tippy.js";
import { SlashCommandList } from "./SmartTypePopup";
import type { CommandItem } from "./SmartTypePopup";

const SmartTypePluginKey = new PluginKey("smartType");

const SCENE_HEADING_COMMANDS: CommandItem[] = [
  { id: "int", title: "INT.", description: "Interior scene", icon: "🎬", shortcut: ".int" },
  { id: "ext", title: "EXT.", description: "Exterior scene", icon: "🌳", shortcut: ".ext" },
  { id: "int-ext", title: "INT./EXT.", description: "Both interior and exterior", icon: "🔄", shortcut: ".int/ext" },
  { id: "est", title: "EST.", description: "Establishing shot", icon: "📍", shortcut: ".est" },
  { id: "i-e", title: "I/E.", description: "Interior/Exterior (shorthand)", icon: "↔️", shortcut: ".i/e" },
];

const TRANSITION_COMMANDS: CommandItem[] = [
  { id: "cut-to", title: "CUT TO:", description: "Standard cut transition", icon: "✂️" },
  { id: "fade-in", title: "FADE IN:", description: "Fade in from black", icon: "🌅" },
  { id: "fade-out", title: "FADE OUT.", description: "Fade to black", icon: "🌃" },
  { id: "dissolve", title: "DISSOLVE TO:", description: "Cross dissolve", icon: "💫" },
  { id: "smash-cut", title: "SMASH CUT TO:", description: "Abrupt hard cut", icon: "⚡" },
  { id: "match-cut", title: "MATCH CUT TO:", description: "Continuity cut", icon: "🎯" },
];

const ELEMENT_COMMANDS: CommandItem[] = [
  { id: "character", title: "Character", description: "Character name (auto-caps)", icon: "👤" },
  { id: "dialogue", title: "Dialogue", description: "Character dialogue", icon: "💬" },
  { id: "parenthetical", title: "Parenthetical", description: "Acting direction", icon: "📝" },
  { id: "action", title: "Action", description: "Action/description", icon: "🏃" },
  { id: "shot", title: "Shot", description: "Camera shot", icon: "📷" },
  { id: "transition", title: "Transition", description: "Scene transition", icon: "➡️" },
];

const createSuggestionItems = (query: string): CommandItem[] => {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery === "." || lowerQuery === ".i" || lowerQuery === ".in" || lowerQuery === ".int" || lowerQuery === ".e" || lowerQuery === ".ex") {
    return SCENE_HEADING_COMMANDS.filter(cmd => 
      cmd.shortcut?.toLowerCase().startsWith(lowerQuery) || cmd.title.toLowerCase().startsWith(lowerQuery.replace(".", ""))
    );
  }
  
  if (lowerQuery.startsWith(".cut") || lowerQuery.startsWith(".fade") || lowerQuery.startsWith(".diss") || lowerQuery.startsWith(".smash") || lowerQuery.startsWith(".match")) {
    return TRANSITION_COMMANDS.filter(cmd => 
      cmd.title.toLowerCase().includes(lowerQuery.replace(".", ""))
    );
  }
  
  if (lowerQuery.startsWith(".char") || lowerQuery.startsWith(".dialog") || lowerQuery.startsWith(".paren") || lowerQuery.startsWith(".action") || lowerQuery.startsWith(".shot") || lowerQuery.startsWith(".trans")) {
    return ELEMENT_COMMANDS.filter(cmd => 
      cmd.title.toLowerCase().includes(lowerQuery.replace(".", ""))
    );
  }
  
  if (lowerQuery === "") {
    return [...SCENE_HEADING_COMMANDS.slice(0, 3), ...ELEMENT_COMMANDS.slice(0, 3)];
  }
  
  const allCommands = [...SCENE_HEADING_COMMANDS, ...TRANSITION_COMMANDS, ...ELEMENT_COMMANDS];
  return allCommands.filter(cmd => 
    cmd.title.toLowerCase().includes(lowerQuery.replace(".", "")) ||
    cmd.id.toLowerCase().includes(lowerQuery.replace(".", ""))
  ).slice(0, 8);
};

const renderItems = () => {
  let component: ReactRenderer;
  let popup: any;

  return {
    onStart: (props: any) => {
      const items = createSuggestionItems(props.query);
      
      if (!items.length) {
        return;
      }

      component = new ReactRenderer(SlashCommandList, {
        props: {
          items,
          command: (item: CommandItem) => {
            props.command(item);
          },
        },
        editor: props.editor,
      });

      popup = tippy("body", {
        getReferenceClientRect: props.clientRect,
        appendTo: () => document.body,
        content: component.element,
        showOnCreate: true,
        interactive: true,
        trigger: "manual",
        placement: "bottom-start",
        zIndex: 9999,
      });
    },
    onUpdate: (props: any) => {
      const items = createSuggestionItems(props.query);
      
      component?.updateProps({
        items,
        command: (item: CommandItem) => {
          props.command(item);
        },
      });

      if (!items.length) {
        popup?.[0]?.hide();
        return;
      }

      popup?.[0]?.setProps({
        getReferenceClientRect: props.clientRect,
      });
      
      popup?.[0]?.show();
    },
    onKeyDown: (props: any) => {
      if (props.event.key === "Escape") {
        popup?.[0]?.hide();
        return true;
      }
      return false;
    },
    onExit: () => {
      popup?.[0]?.destroy();
      component?.destroy();
    },
  };
};

export const SmartType = Extension.create({
  name: "smartType",

  addOptions() {
    return {
      suggestion: {
        char: ".",
        pluginKey: SmartTypePluginKey,
        command: ({ editor, range, props }: any) => {
          const item = props as CommandItem;
          
          if (["int", "ext", "int-ext", "est", "i-e"].includes(item.id)) {
            const scenePrefixes: Record<string, string> = {
              "int": "INT. ",
              "ext": "EXT. ",
              "int-ext": "INT./EXT. ",
              "est": "EST. ",
              "i-e": "I/E. ",
            };
            editor.chain().focus().deleteRange(range).setNode("sceneHeading", { 
              keepMarks: false 
            }).run();
            setTimeout(() => {
              editor.chain().focus().insertContent(scenePrefixes[item.id] || item.title + " ").run();
            }, 0);
            return;
          }
          
          if (item.id === "cut-to") {
            editor.chain().focus().deleteRange(range).setNode("transition").run();
            setTimeout(() => {
              editor.chain().focus().insertContent("CUT TO:").run();
            }, 0);
            return;
          }
          if (item.id === "fade-in") {
            editor.chain().focus().deleteRange(range).setNode("transition").run();
            setTimeout(() => {
              editor.chain().focus().insertContent("FADE IN:").run();
            }, 0);
            return;
          }
          if (item.id === "fade-out") {
            editor.chain().focus().deleteRange(range).setNode("transition").run();
            setTimeout(() => {
              editor.chain().focus().insertContent("FADE OUT.").run();
            }, 0);
            return;
          }
          if (item.id === "dissolve") {
            editor.chain().focus().deleteRange(range).setNode("transition").run();
            setTimeout(() => {
              editor.chain().focus().insertContent("DISSOLVE TO:").run();
            }, 0);
            return;
          }
          if (item.id === "smash-cut") {
            editor.chain().focus().deleteRange(range).setNode("transition").run();
            setTimeout(() => {
              editor.chain().focus().insertContent("SMASH CUT TO:").run();
            }, 0);
            return;
          }
          if (item.id === "match-cut") {
            editor.chain().focus().deleteRange(range).setNode("transition").run();
            setTimeout(() => {
              editor.chain().focus().insertContent("MATCH CUT TO:").run();
            }, 0);
            return;
          }
          
          const nodeMap: Record<string, string> = {
            "character": "character",
            "dialogue": "dialogue",
            "parenthetical": "parenthetical",
            "action": "action",
            "shot": "shot",
            "transition": "transition",
          };
          
          if (nodeMap[item.id]) {
            editor.chain().focus().deleteRange(range).setNode(nodeMap[item.id]).run();
          }
        },
        items: ({ query }: { query: string }) => {
          return createSuggestionItems(query);
        },
        render: renderItems,
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

export type { CommandItem };
export default SmartType;
