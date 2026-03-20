/* eslint-disable  @typescript-eslint/no-explicit-any */
export type ContextKey = string;
export type WorkflowContext = Record<ContextKey, any>;

export type ContextPatch = {
    key: ContextKey;
    value: any;
    sourceWidgetId?: string;
};

type Subscriber = (ctx: WorkflowContext, patch: ContextPatch) => void;

export class ContextBus {
    private ctx: WorkflowContext;
    private subs: Map<string, Subscriber> = new Map();

    constructor(initial?: WorkflowContext) {
        this.ctx = { ...(initial ?? {}) };
    }

    get snapshot(): WorkflowContext {
        return { ...this.ctx };
    }

    setAll(next: WorkflowContext) {
        this.ctx = { ...next };
        const patch: ContextPatch = { key: '__full__', value: this.ctx };
        this.subs.forEach((fn) => fn(this.snapshot, patch));
    }

    subscribe(id: string, fn: Subscriber): () => void {
        this.subs.set(id, fn);
        return () => this.subs.delete(id);
    }

    publish(patch: ContextPatch) {
        this.ctx = { ...this.ctx, [patch.key]: patch.value };
        this.subs.forEach((fn) => fn(this.snapshot, patch));
    }
}

export function createContextBus(initial?: WorkflowContext): ContextBus {
    return new ContextBus(initial);
}
