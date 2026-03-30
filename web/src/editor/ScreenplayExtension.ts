import { Node, Extension, mergeAttributes, nodeInputRule } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";

export const AutoCapitalize = Extension.create({
  name: "autoCapitalize",
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("autoCapitalize"),
        appendTransaction: (_transactions, _oldState, newState) => {
          const tr = newState.tr;
          let modified = false;
          
          newState.doc.descendants((node, pos) => {
            if (node.type.name === "character" && node.textContent) {
              const text = node.textContent;
              const upperText = text.toUpperCase();
              if (text !== upperText && /^[A-Z\s]+$/.test(text)) {
                const start = pos;
                const end = pos + node.nodeSize;
                tr.replaceWith(start, end, newState.schema.text(upperText));
                modified = true;
              }
            }
            return true;
          });
          
          return modified ? tr : null;
        },
      }),
    ];
  },
});

export const ScreenplayExtension = Node.create({
  name: "screenplay",
  group: "block",
  content: "block+",

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },
});

export const SceneHeading = Node.create({
  name: "sceneHeading",
  group: "block",
  content: "inline*",
  addStorage() {
    return {
      slashCommands: [".int", ".ext", ".int/ext", ".est", ".i/e", ".int.", ".ext."],
    };
  },
  parseHTML() {
    return [{ tag: 'div[data-type="sceneHeading"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "sceneHeading" }), 0];
  },
  addInputRules() {
    return [
      nodeInputRule({
        find: /^(INT|EXT|INT\/EXT|EST|I\/E)\.\s$/i,
        type: this.type,
      }),
    ];
  },
});

export const Action = Node.create({
  name: "action",
  group: "block",
  content: "inline*",
  parseHTML() {
    return [{ tag: 'div[data-type="action"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "action" }), 0];
  },
});

export const Character = Node.create({
  name: "character",
  group: "block",
  content: "inline*",
  parseHTML() {
    return [{ tag: 'div[data-type="character"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "character" }), 0];
  },
  addInputRules() {
    return [
      nodeInputRule({
        find: /^([A-Z\s]{2,})\.\s$/i,
        type: this.type,
      }),
    ];
  },
});

export const Dialogue = Node.create({
  name: "dialogue",
  group: "block",
  content: "inline*",
  parseHTML() {
    return [{ tag: 'div[data-type="dialogue"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "dialogue" }), 0];
  },
});

export const Parenthetical = Node.create({
  name: "parenthetical",
  group: "block",
  content: "inline*",
  parseHTML() {
    return [{ tag: 'div[data-type="parenthetical"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "parenthetical" }), 0];
  },
});

export const Transition = Node.create({
  name: "transition",
  group: "block",
  content: "inline*",
  parseHTML() {
    return [{ tag: 'div[data-type="transition"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "transition" }), 0];
  },
});

export const StageDirection = Node.create({
  name: "stageDirection",
  group: "block",
  content: "inline*",
  parseHTML() {
    return [{ tag: 'div[data-type="stageDirection"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "stageDirection" }), 0];
  },
});

export const Shot = Node.create({
  name: "shot",
  group: "block",
  content: "inline*",
  parseHTML() {
    return [{ tag: 'div[data-type="shot"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "shot" }), 0];
  },
});

// Outlining line - notes that don't appear in PDF export
export const OutlineNote = Node.create({
  name: "outlineNote",
  group: "block",
  content: "inline*",
  parseHTML() {
    return [{ tag: 'div[data-type="outlineNote"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "outlineNote", class: "outline-note" }), 0];
  },
});

// Dual Dialogue - for two characters speaking simultaneously
export const DualDialogue = Node.create({
  name: "dualDialogue",
  group: "block",
  content: "block+",
  defining: true,
  parseHTML() {
    return [{ tag: 'div[data-type="dualDialogue"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "dualDialogue", class: "dual-dialogue" }), 0];
  },
});

// Keyboard shortcuts extension
export const KeyboardShortcuts = Extension.create({
  name: "keyboardShortcuts",
  addKeyboardShortcuts() {
    return {
      "Mod-1": () => this.editor.commands.setNode("sceneHeading"),
      "Mod-2": () => this.editor.commands.setNode("action"),
      "Mod-3": () => this.editor.commands.setNode("character"),
      "Mod-4": () => this.editor.commands.setNode("dialogue"),
      "Mod-5": () => this.editor.commands.setNode("parenthetical"),
      "Mod-6": () => this.editor.commands.setNode("transition"),
      "Mod-7": () => this.editor.commands.setNode("shot"),
      "Mod-8": () => this.editor.commands.setNode("stageDirection"),
      "Mod-0": () => this.editor.commands.setNode("outlineNote"),
      // Auto-capitalize character names
      "Shift-Enter": ({ editor }) => {
        const { state } = editor;
        const { selection } = state;
        const { $from } = selection;
        const node = $from.parent;
        if (node.type.name === "character") {
          // Auto-capitalize
          const text = node.textContent;
          if (text && text !== text.toUpperCase()) {
            editor.commands.command(({ tr }) => {
              const start = $from.start();
              const end = $from.end();
              tr.replaceWith(start, end, state.schema.text(text.toUpperCase()));
              return true;
            });
          }
        }
        return false;
      },
    };
  },
});

// Main extension to handle keyboard logic
export const ScreenplayShortcuts = Extension.create({
  name: "screenplayShortcuts",
  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        const { state } = editor;
        const { selection } = state;
        const { $from } = selection;
        const node = $from.parent;

        if (node.type.name === "character" || node.type.name === "parenthetical") {
          return editor.chain().splitBlock().setNode("dialogue").focus().run();
        }
        if (node.type.name === "sceneHeading" || node.type.name === "transition" || node.type.name === "shot") {
          return editor.chain().splitBlock().setNode("action").focus().run();
        }
        if (node.type.name === "dialogue" && node.content.size === 0) {
           return editor.chain().setNode("action").run();
        }
        if (node.type.name === "dialogue") {
          return editor.chain().splitBlock().setNode("character").focus().run();
        }

        return false;
      },
      Tab: ({ editor }) => {
        const { state } = editor;
        const { selection } = state;
        const { $from } = selection;
        const node = $from.parent;

        const cycle = ["action", "character", "parenthetical", "dialogue", "sceneHeading", "transition"];
        const currentIndex = cycle.indexOf(node.type.name);
        if (currentIndex === -1) return false;
        const nextIndex = (currentIndex + 1) % cycle.length;

        return editor.chain().setNode(cycle[nextIndex]).run();
      },
    };
  },
});
