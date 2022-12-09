import { Task } from '../core/Task';
import { TaskEvent, TaskEventType } from '../core/TaskEvent';
import { TaskState } from '../core/TaskState';
import { TaskList } from '../core/TaskList';

export class Serial extends TaskList {
	// --------------------------------------------------
	//
	// CONSTRUCTOR
	//
	// --------------------------------------------------

	constructor(...tasks: (Task | Function)[]) {
		super(...tasks);
		this.currentTask = null;
		this.position = -1;
		this.isPaused = false;
		this.isCompleteOnPaused = false;
	}

	// --------------------------------------------------
	//
	// METHOD
	//
	// --------------------------------------------------

	public addTask(...tasks: (Task | Function)[]): void {
		super.addTask(...tasks);
	}

	public insertTask(...tasks: (Task | Function)[]): void {
		super.insertTaskAt(this.position + 1, ...tasks);
	}

	public addTaskArray(tasks: (Task | Function)[]): void {
		this.addTask(...tasks);
	}

	public insertTaskArray(tasks: (Task | Function)[]): void {
		this.insertTask(...tasks);
	}

	private next(): void {
		this.currentTask = this.getTaskByIndex(this.position);
		this.currentTask.addEventListener(TaskEventType.complete, this.completeHandler);
		this.currentTask.run();
	}

	private completeHandler = (event: TaskEvent): void => {
		this.currentTask.removeEventListener(TaskEventType.complete, this.completeHandler);
		this.currentTask = null;
		if (++this.position >= this.getLength()) {
			this.notifyComplete();
		} else {
			this.next();
		}
	};

	protected implRun(task: Task): void {
		this.position = 0;
		if (this.getLength() > 0) {
			this.next();
		} else {
			this.notifyComplete();
		}
	}

	protected implInterrupt(task: Task): void {
		if (this.currentTask) {
			this.currentTask.removeEventListener(TaskEventType.complete, this.completeHandler);
			this.currentTask.interrupt();
			this.currentTask = null;
		}
		this.position = -1;
		super.implInterrupt(task);
	}

	protected implDispose(task: Task): void {
		if (this.currentTask) {
			this.currentTask.removeEventListener(TaskEventType.complete, this.completeHandler);
			this.currentTask.dispose();
			this.currentTask = null;
		}
		this.position = -1;
		this.isPaused = false;
		this.isCompleteOnPaused = false;
		super.implDispose(task);
	}

	protected implNotifyBreak(): void {
		if (this.currentTask.getState() === TaskState.running) {
			this.currentTask.removeEventListener(TaskEventType.complete, this.completeHandler);
			this.currentTask.interrupt();
		}
		this.notifyComplete();
	}

	protected implNotifyReturn(): void {
		if (this.currentTask.getState() === TaskState.running) {
			this.currentTask.removeEventListener(TaskEventType.complete, this.completeHandler);
			this.currentTask.interrupt();
		}
		const f: Function = this.getParent()['notifyReturn'];
		if (f) f();
		this.dispose();
	}

	// --------------------------------------------------
	//
	// MEMBER
	//
	// --------------------------------------------------

	private position: number;
	private currentTask: Task;
	private isPaused: boolean;
	private isCompleteOnPaused: boolean;
}
