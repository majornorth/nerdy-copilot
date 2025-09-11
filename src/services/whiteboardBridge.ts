export type InsertPayload =
  | { type: 'text'; text: string; meta?: Record<string, any> }
  | { type: 'url'; url: string; meta?: Record<string, any> }
  | { type: 'html'; html: string; meta?: Record<string, any> }
  | { type: 'math'; latex: string; display?: boolean; meta?: Record<string, any> };

type InsertHandler = (payload: InsertPayload) => Promise<void> | void;

let handler: InsertHandler | null = null;

export function registerInsertHandler(h: InsertHandler) {
  handler = h;
}

export async function addToBoard(payload: InsertPayload): Promise<boolean> {
  try {
    if (!handler) return false;
    await handler(payload);
    return true;
  } catch (e) {
    console.warn('addToBoard failed', e);
    return false;
  }
}
