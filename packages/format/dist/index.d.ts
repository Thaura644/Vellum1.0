export interface ScreenplayNode {
    type: string;
    content?: string | any[];
    [key: string]: any;
}
export declare const toFountain: (nodes: ScreenplayNode[]) => string;
export declare const toFDX: (nodes: ScreenplayNode[]) => string;
