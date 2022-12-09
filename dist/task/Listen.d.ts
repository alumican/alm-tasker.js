import { Task } from '../core/Task';
export declare class Listen extends Task {
    constructor(eventTarget: EventTarget, eventType: string);
    protected implRun(task: Task): void;
    protected implInterrupt(task: Task): void;
    protected implDispose(task: Task): void;
    private completeHandler;
    private eventTarget;
    private eventType;
}
