import { Task } from '../core/Task';

export class Nop extends Task {
	// --------------------------------------------------
	//
	// CONSTRUCTOR
	//
	// --------------------------------------------------

	constructor() {
		super();
	}

	// --------------------------------------------------
	//
	// METHOD
	//
	// --------------------------------------------------

	protected implRun(task: Task): void {
		this.notifyComplete();
	}

	protected implInterrupt(task: Task): void {}

	protected implDispose(task: Task): void {}
}
