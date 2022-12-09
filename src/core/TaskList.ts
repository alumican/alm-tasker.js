import { Type } from 'alm_coreutil';
import { Task } from './Task';
import { Call } from '../task/Call';
import { Nop } from '../task/Nop';

export abstract class TaskList extends Task {
	// --------------------------------------------------
	//
	// CONSTRUCTOR
	//
	// --------------------------------------------------

	protected constructor(...tasks: (Task | Function)[]) {
		super();
		this.tasks = [];
		this.addTask(...tasks);
	}

	// --------------------------------------------------
	//
	// METHOD
	//
	// --------------------------------------------------

	public addTask(...tasks: (Task | Function)[]): void {
		if (tasks.length > 0) {
			this.preProcess(tasks);
			this.tasks = this.getTasks().concat(<Task[]>tasks);
		}
	}

	public insertTask(...tasks: (Task | Function)[]): void {
		this.insertTaskAt(0, ...tasks);
	}

	protected insertTaskAt(index: number, ...tasks: (Task | Function)[]): void {
		if (tasks.length > 0) {
			this.preProcess(tasks);
			Array.prototype.splice.apply(this.getTasks(), (<any[]>[index, 0]).concat(tasks));
		}
	}

	public addTaskArray(tasks: (Task | Function)[]): void {
		this.addTask(...tasks);
	}

	public insertTaskArray(tasks: (Task | Function)[]): void {
		this.insertTask(...tasks);
	}

	protected insertTaskArrayAt(index: number, tasks: (Task | Function)[]): void {
		this.insertTaskAt(index, ...tasks);
	}

	public getLength(): number {
		return this.tasks.length;
	}

	public getTaskByIndex(index: number): Task {
		return this.tasks[index];
	}

	public getTasks(): Task[] {
		return this.tasks;
	}

	private preProcess(tasks: (Task | Function)[]): void {
		const taskCount: number = tasks.length;
		let task: Task | Function;
		for (let i: number = 0; i < taskCount; ++i) {
			task = tasks[i];
			if (task) {
				// function
				if (Type.isFunction(task)) {
					tasks[i] = task = new Call(<Function>task);
				}
			} else {
				// null
				tasks[i] = task = new Nop();
			}
			(<Task>task).setParent(this);
		}
	}

	protected implRun(task: Task): void {
		this.notifyComplete();
	}

	protected implInterrupt(task: Task): void {}

	protected implDispose(task: Task): void {}

	protected abstract implNotifyBreak(): void;
	protected abstract implNotifyReturn(): void;

	// --------------------------------------------------
	//
	// MEMBER
	//
	// --------------------------------------------------

	private tasks: Task[];
}
