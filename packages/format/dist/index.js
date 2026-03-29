"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toFDX = exports.toFountain = void 0;
const xmlbuilder2_1 = require("xmlbuilder2");
const toFountain = (nodes) => {
    return nodes
        .map((node) => {
        const type = node.type;
        const text = node.content && typeof node.content === "string" ? node.content : "";
        switch (type) {
            case "sceneHeading":
                return text.toUpperCase();
            case "character":
                return `\n${text.toUpperCase()}`;
            case "dialogue":
                return text;
            case "parenthetical":
                return `(${text})`;
            case "transition":
                return `\n${text.toUpperCase()}`;
            case "action":
                return `\n${text}`;
            case "shot":
                return `\n${text.toUpperCase()}`;
            case "stageDirection":
                return `\n[[${text}]]`;
            default:
                return text;
        }
    })
        .join("\n");
};
exports.toFountain = toFountain;
const toFDX = (nodes) => {
    const root = (0, xmlbuilder2_1.create)({ version: "1.0", encoding: "UTF-8" })
        .ele("FinalDraft", { DocumentType: "Script", Version: "12" })
        .ele("Content");
    nodes.forEach((node) => {
        const text = node.content && typeof node.content === "string" ? node.content : "";
        let fdxType = "General";
        switch (node.type) {
            case "sceneHeading":
                fdxType = "Scene Heading";
                break;
            case "character":
                fdxType = "Character";
                break;
            case "dialogue":
                fdxType = "Dialogue";
                break;
            case "parenthetical":
                fdxType = "Parenthetical";
                break;
            case "transition":
                fdxType = "Transition";
                break;
            case "action":
                fdxType = "Action";
                break;
            case "shot":
                fdxType = "Shot";
                break;
        }
        root.ele("Paragraph", { Type: fdxType }).ele("Text").txt(text);
    });
    return root.end({ prettyPrint: true });
};
exports.toFDX = toFDX;
