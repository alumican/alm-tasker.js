import { TaskEvent, TaskEventType } from './TaskEvent';
import { TaskState } from './TaskState';

export abstract class Task extends EventTarget {
	// --------------------------------------------------
	//
	// CONSTRUCTOR
	//
	// --------------------------------------------------

	protected constructor() {
		super();
		this.state = TaskState.sleeping;
		this.self = this;
		this.parent = null;
	}

	// --------------------------------------------------
	//
	// METHOD
	//
	// --------------------------------------------------

	public run(): void {
		if (this.state > TaskState.sleeping) {
			throw new Error('[Task.run] + Task is already running.');
		}
		this.state = TaskState.running;
		this.implRun.call(this, this);
	}

	public interrupt(): void {
		if (this.state === TaskState.running) {
			this.state = TaskState.interrupting;
			this.implInterrupt.call(this, this);
		}
	}

	public dispose(): void {
		this.state = TaskState.sleeping;
		this.implDispose.call(this, this);
		this.parent = null;
	}

	protected notifyComplete(): void {
		switch (this.state) {
			case TaskState.sleeping:
				break;
			case TaskState.running:
				this.dispatchEvent(new TaskEvent(TaskEventType.complete));
				this.dispose();
				break;
			case TaskState.interrupting:
				this.dispatchEvent(new TaskEvent(TaskEventType.complete));
				this.dispose();
				break;
		}
	}

	public getState(): TaskState {
		return this.state;
	}

	public getParent(): Task {
		return this.parent;
	}

	public setParent(parent: Task): void {
		this.parent = parent;
	}

	public getSelf(): Task {
		return this.self;
	}

	protected abstract implRun(task: Task): void;

	protected abstract implInterrupt(task: Task): void;

	protected abstract implDispose(task: Task): void;

	// --------------------------------------------------
	//
	// MEMBER
	//
	// --------------------------------------------------

	private state: TaskState;
	private parent: Task;
	private self: Task;
}
