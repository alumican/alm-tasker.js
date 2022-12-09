import { Task } from '../core/Task';
import { TaskList } from '../core/TaskList';
export declare class Serial extends TaskList {
    constructor(...tasks: (Task | Function)[]);
    addTask(...tasks: (Task | Function)[]): void;
    insertTask(...tasks: (Task | Function)[]): void;
    addTaskArray(tasks: (Task | Function)[]): void;
    insertTaskArray(tasks: (Task | Function)[]): void;
    private next;
    private completeHandler;
    protected implRun(task: Task): void;
    protected implInterrupt(task: Task): void;
    protected implDispose(task: Task): void;
    protected implNotifyBreak(): void;
    protected implNotifyReturn(): void;
    private position;
    private currentTask;
    private isPaused;
    private isCompleteOnPaused;
}
