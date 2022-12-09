import { TaskState } from './TaskState';
export declare abstract class Task extends EventTarget {
    protected constructor();
    run(): void;
    interrupt(): void;
    dispose(): void;
    protected notifyComplete(): void;
    getState(): TaskState;
    getParent(): Task;
    setParent(parent: Task): void;
    getSelf(): Task;
    protected abstract implRun(task: Task): void;
    protected abstract implInterrupt(task: Task): void;
    protected abstract implDispose(task: Task): void;
    private state;
    private parent;
    private self;
}
