import { Task } from '../core/Task';
export type Condition = boolean | ((...args: any) => boolean);
export declare class If extends Task {
    constructor(condition: Condition, then: Task, reject: Task);
    protected implRun(task: Task): void;
    protected implInterrupt(task: Task): void;
    protected implDispose(task: Task): void;
    private completeHandler;
    private condition;
    private then;
    private reject;
    private selectedTask;
}
