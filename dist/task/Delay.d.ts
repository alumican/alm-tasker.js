import { Task } from '../core/Task';
export declare class Delay extends Task {
    constructor(time: number);
    protected implRun(task: Task): void;
    protected implInterrupt(task: Task): void;
    protected implDispose(task: Task): void;
    private cancel;
    private completeHandler;
    private time;
    private timerId;
}
