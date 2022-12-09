import { Task } from '../core/Task';
export declare class Log extends Task {
    constructor(...messages: any[]);
    protected implRun(task: Task): void;
    protected implInterrupt(task: Task): void;
    protected implDispose(task: Task): void;
    private messages;
}
