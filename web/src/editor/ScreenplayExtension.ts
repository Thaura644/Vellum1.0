import { Node, mergeAttributes, nodeInputRule } from "@tiptap/core";
// import { Plugin, PluginKey } from "@tiptap/pm/state";

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
  parseHTML() {
    return [{ tag: 'div[data-type="sceneHeading"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "sceneHeading" }), 0];
  },
  addInputRules() {
    return [
      nodeInputRule({
        find: /^(INT|EXT|INT\/EXT|EST)\.\s$/i,
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
        find: /^([A-Z\s]{2,})\.\s$/i, // Typing "CHARACTER NAME." followed by space
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

// Main extension to handle keyboard logic
export const ScreenplayShortcuts = Node.create({
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
