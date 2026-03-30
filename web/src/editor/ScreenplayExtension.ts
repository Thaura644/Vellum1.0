import { Node, mergeAttributes, nodeInputRule } from "@tiptap/core";

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
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "sceneHeading", class: "scene-heading" }), 0];
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
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "action", class: "action" }), 0];
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
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "character", class: "character" }), 0];
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
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "dialogue", class: "dialogue" }), 0];
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
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "parenthetical", class: "parenthetical" }), 0];
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
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "transition", class: "transition" }), 0];
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
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "stageDirection", class: "stage-direction" }), 0];
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
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "shot", class: "shot" }), 0];
  },
});

export const ScreenplayShortcuts = Node.create({
  name: "screenplayShortcuts",
  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        const { state } = editor;
        const { selection } = state;
        const { $from } = selection;
        const node = $from.parent;
        const text = node.textContent.trim();

        if (node.type.name === "character") {
          if (text === "") return editor.chain().setNode("action").run();
          return editor.chain().splitBlock().setNode("dialogue").focus().run();
        }
        if (node.type.name === "parenthetical") {
          return editor.chain().splitBlock().setNode("dialogue").focus().run();
        }
        if (node.type.name === "dialogue") {
          if (text === "") return editor.chain().setNode("action").run();
          return editor.chain().splitBlock().setNode("action").focus().run();
        }
        if (["sceneHeading", "transition", "shot"].includes(node.type.name)) {
           return editor.chain().splitBlock().setNode("action").focus().run();
        }
        return false;
      },
      Tab: ({ editor }) => {
        const { state } = editor;
        const { selection } = state;
        const { $from } = selection;
        const node = $from.parent;
        const cycleMap: Record<string, string> = {
          "action": "character",
          "character": "parenthetical",
          "parenthetical": "dialogue",
          "dialogue": "transition",
          "transition": "sceneHeading",
          "sceneHeading": "action"
        };
        const nextType = cycleMap[node.type.name];
        if (nextType) return editor.chain().setNode(nextType).run();
        return false;
      },
    };
  },
});
