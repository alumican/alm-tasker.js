import { Task } from '../core/Task';
export type CallbackFunction = (complete: () => void) => void;
export declare class Callback extends Task {
    constructor(f: CallbackFunction);
    protected implRun(task: Task): void;
    protected implInterrupt(task: Task): void;
    protected implDispose(task: Task): void;
    private f;
}
