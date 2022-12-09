export declare enum TaskEventType {
    complete = "complete"
}
export declare class TaskEvent extends CustomEvent<void> {
    constructor(type: TaskEventType);
}
