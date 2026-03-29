import * as Y from "yjs";

export enum TemplateType {
  BLANK = "BLANK",
  FEATURE = "FEATURE",
  TV_DRAMA = "TV_DRAMA",
  SITCOM = "SITCOM",
}

export const generateTemplateContent = (type: TemplateType): Buffer => {
  const ydoc = new Y.Doc();
  const xmlFragment = ydoc.getXmlFragment("default");

  const createNode = (nodeType: string, content: string = "") => {
    const element = new Y.XmlElement(nodeType);
    const text = new Y.XmlText(content);
    element.insert(0, [text]);
    return element;
  };

  switch (type) {
    case TemplateType.FEATURE:
      xmlFragment.insert(0, [
        createNode("sceneHeading", "EXT. LOCATION - DAY"),
        createNode("action", "The sun beats down on the desolate landscape."),
        createNode("character", "PROTAGONIST"),
        createNode("dialogue", "This is where it all begins."),
      ]);
      break;
    case TemplateType.TV_DRAMA:
      xmlFragment.insert(0, [
        createNode("sceneHeading", "ACT ONE"),
        createNode("sceneHeading", "INT. OFFICE - NIGHT"),
        createNode("action", "Papers are strewn across the desk. A single lamp flickers."),
      ]);
      break;
    case TemplateType.SITCOM:
      xmlFragment.insert(0, [
        createNode("sceneHeading", "SCENE A"),
        createNode("sceneHeading", "INT. LIVING ROOM - DAY"),
        createNode("action", "The COUCH is the centerpiece. The TV is blaring."),
      ]);
      break;
    default:
      xmlFragment.insert(0, [createNode("sceneHeading", "INT. NEW SCENE - DAY")]);
  }

  return Buffer.from(Y.encodeStateAsUpdate(ydoc));
};
