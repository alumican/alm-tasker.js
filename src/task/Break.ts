import { Task } from '../core/Task';

export class Break extends Task {
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
		const f: Function = this.getParent()['notifyBreak'];
		if (f) f();
		this.notifyComplete();
	}

	protected implInterrupt(task: Task): void {}

	protected implDispose(task: Task): void {}
}
