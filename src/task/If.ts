import { Type } from 'alm_coreutil';
import { Task } from '../core/Task';
import { TaskEvent, TaskEventType } from '../core/TaskEvent';

export type Condition = boolean | ((...args: any) => boolean);

export class If extends Task {
	// --------------------------------------------------
	//
	// CONSTRUCTOR
	//
	// --------------------------------------------------

	constructor(condition: Condition, then: Task, reject: Task) {
		super();
		this.condition = condition;
		this.then = then;
		this.reject = reject;
		this.selectedTask = null;
	}

	// --------------------------------------------------
	//
	// METHOD
	//
	// --------------------------------------------------

	protected implRun(task: Task): void {
		let result: boolean;
		if (Type.isFunction(this.condition)) {
			result = (<Function>this.condition)();
		} else {
			result = <boolean>this.condition;
		}

		if (result) {
			if (this.then) {
				this.selectedTask = this.then;
			}
		} else {
			if (this.reject) {
				this.selectedTask = this.reject;
			}
		}

		if (this.selectedTask) {
			this.selectedTask.addEventListener(TaskEventType.complete, this.completeHandler);
			this.selectedTask.run();
		} else {
			this.notifyComplete();
		}
	}

	protected implInterrupt(task: Task): void {
		if (this.selectedTask) {
			this.selectedTask.removeEventListener(TaskEventType.complete, this.completeHandler);
			this.selectedTask.interrupt();
			this.selectedTask = null;
		}
	}

	protected implDispose(task: Task): void {
		if (this.selectedTask) {
			this.selectedTask.removeEventListener(TaskEventType.complete, this.completeHandler);
			this.selectedTask.dispose();
			this.selectedTask = null;
		}

		this.condition = null;
		this.then = null;
		this.reject = null;
	}

	private completeHandler = (event: TaskEvent): void => {
		this.selectedTask.removeEventListener(TaskEventType.complete, this.completeHandler);
		this.selectedTask = null;
		this.notifyComplete();
	};

	// --------------------------------------------------
	//
	// MEMBER
	//
	// --------------------------------------------------

	private condition: Condition;
	private then: Task;
	private reject: Task;
	private selectedTask: Task;
}
