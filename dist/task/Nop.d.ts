import { Task } from '../core/Task';
export declare class Nop extends Task {
    constructor();
    protected implRun(task: Task): void;
    protected implInterrupt(task: Task): void;
    protected implDispose(task: Task): void;
}
