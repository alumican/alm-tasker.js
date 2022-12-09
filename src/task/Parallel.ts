import { Task } from '../core/Task';
import { TaskEvent, TaskEventType } from '../core/TaskEvent';
import { TaskState } from '../core/TaskState';
import { TaskList } from '../core/TaskList';

export class Parallel extends TaskList {
	// --------------------------------------------------
	//
	// CONSTRUCTOR
	//
	// --------------------------------------------------

	constructor(...tasks: (Task | Function)[]) {
		super(...tasks);
		this.completeCount = 0;
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
		this.addTask(...tasks);
	}

	public addTaskArray(tasks: (Task | Function)[]): void {
		this.addTask(...tasks);
	}

	public insertTaskArray(tasks: (Task | Function)[]): void {
		this.addTask(...tasks);
	}

	private completeHandler = (event: TaskEvent): void => {
		if (++this.completeCount >= this.getLength()) {
			this.notifyComplete();
		}
	};

	protected implRun(task: Task): void {
		this.completeCount = 0;
		const length: number = this.getLength();
		if (length > 0) {
			const tasks: Task[] = this.getTasks();
			let task: Task;
			for (let i: number = 0; i < length; ++i) {
				task = tasks[i];
				task.addEventListener(TaskEventType.complete, this.completeHandler);
				task.run();
			}
		} else {
			this.notifyComplete();
		}
	}

	protected implInterrupt(task: Task): void {
		const length: number = this.getLength();
		if (length > 0) {
			const tasks: Task[] = this.getTasks();
			let task: Task;
			for (let i: number = 0; i < length; ++i) {
				task = tasks[i];
				task.removeEventListener(TaskEventType.complete, this.completeHandler);
				task.interrupt();
			}
		}
		super.implInterrupt(task);
	}

	protected implDispose(task: Task): void {
		const length: number = this.getLength();
		if (length > 0) {
			const tasks: Task[] = this.getTasks();
			let task: Task;
			for (let i: number = 0; i < length; ++i) {
				task = tasks[i];
				task.removeEventListener(TaskEventType.complete, this.completeHandler);
				task.dispose();
			}
		}
		super.implDispose(task);
	}

	protected implNotifyBreak(): void {
		const length: number = this.getLength();
		if (length > 0) {
			const tasks: Task[] = this.getTasks();
			let task: Task;
			for (let i: number = 0; i < length; ++i) {
				task = tasks[i];
				if (task.getState() === TaskState.running) {
					task.removeEventListener(TaskEventType.complete, this.completeHandler);
					task.interrupt();
				}
			}
		}
		this.notifyComplete();
	}

	protected implNotifyReturn(): void {
		const length: number = this.getLength();
		if (length > 0) {
			const tasks: Task[] = this.getTasks();
			let task: Task;
			for (let i: number = 0; i < length; ++i) {
				task = tasks[i];
				if (task.getState() === TaskState.running) {
					task.removeEventListener(TaskEventType.complete, this.completeHandler);
					task.interrupt();
				}
			}
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

	private completeCount: number;
	private currentTask: Task;
	private isPaused: boolean;
	private isCompleteOnPaused: boolean;
}
