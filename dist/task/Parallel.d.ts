import { Task } from '../core/Task';
import { TaskList } from '../core/TaskList';
export declare class Parallel extends TaskList {
    constructor(...tasks: (Task | Function)[]);
    addTask(...tasks: (Task | Function)[]): void;
    insertTask(...tasks: (Task | Function)[]): void;
    addTaskArray(tasks: (Task | Function)[]): void;
    insertTaskArray(tasks: (Task | Function)[]): void;
    private completeHandler;
    protected implRun(task: Task): void;
    protected implInterrupt(task: Task): void;
    protected implDispose(task: Task): void;
    protected implNotifyBreak(): void;
    protected implNotifyReturn(): void;
    private completeCount;
    private currentTask;
    private isPaused;
    private isCompleteOnPaused;
}
