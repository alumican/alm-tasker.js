import { Task } from '../core/Task';

export class Log extends Task {
	// --------------------------------------------------
	//
	// CONSTRUCTOR
	//
	// --------------------------------------------------

	constructor(...messages: any[]) {
		super();
		this.messages = messages;
	}

	// --------------------------------------------------
	//
	// METHOD
	//
	// --------------------------------------------------

	protected implRun(task: Task): void {
		console.log.apply(console, Array.prototype.slice.call(this.messages));
		this.notifyComplete();
	}

	protected implInterrupt(task: Task): void {}

	protected implDispose(task: Task): void {
		this.messages = null;
	}

	// --------------------------------------------------
	//
	// MEMBER
	//
	// --------------------------------------------------

	private messages: any[];
}
