import { Task } from './Task';
export declare abstract class TaskList extends Task {
    protected constructor(...tasks: (Task | Function)[]);
    addTask(...tasks: (Task | Function)[]): void;
    insertTask(...tasks: (Task | Function)[]): void;
    protected insertTaskAt(index: number, ...tasks: (Task | Function)[]): void;
    addTaskArray(tasks: (Task | Function)[]): void;
    insertTaskArray(tasks: (Task | Function)[]): void;
    protected insertTaskArrayAt(index: number, tasks: (Task | Function)[]): void;
    getLength(): number;
    getTaskByIndex(index: number): Task;
    getTasks(): Task[];
    private preProcess;
    protected implRun(task: Task): void;
    protected implInterrupt(task: Task): void;
    protected implDispose(task: Task): void;
    protected abstract implNotifyBreak(): void;
    protected abstract implNotifyReturn(): void;
    private tasks;
}
