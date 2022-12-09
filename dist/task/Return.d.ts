import { Task } from '../core/Task';
export declare class Return extends Task {
    constructor();
    protected implRun(task: Task): void;
    protected implInterrupt(task: Task): void;
    protected implDispose(task: Task): void;
}
