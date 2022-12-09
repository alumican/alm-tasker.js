import { Task } from '../core/Task';
export declare class Call extends Task {
    constructor(f: Function, args?: any[], eventTarget?: EventTarget, eventType?: string);
    protected implRun(task: Task): void;
    protected implInterrupt(task: Task): void;
    protected implDispose(task: Task): void;
    private completeHandler;
    private f;
    private args;
    private eventTarget;
    private eventType;
}
