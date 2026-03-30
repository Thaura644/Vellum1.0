import { Mark } from "@tiptap/core";

export const Comment = Mark.create({
  name: "comment",
  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-comment-id"),
        renderHTML: (attributes) => {
          return {
            "data-comment-id": attributes.id,
            class: "comment-highlight",
          };
        },
      },
    };
  },
  parseHTML() {
    return [
      {
        tag: "span[data-comment-id]",
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      {
        ...HTMLAttributes,
        "data-comment-id": HTMLAttributes.id,
        class: "comment-highlight cursor-pointer hover:bg-yellow-200 dark:hover:bg-yellow-800 rounded px-0.5",
      },
      0,
    ];
  },
});

export default Comment;
