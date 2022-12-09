import { Task } from '../core/Task';

export class Return extends Task {
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
		const f: Function = this.getParent()['notifyReturn'];
		if (f) f();
		this.notifyComplete();
	}

	protected implInterrupt(task: Task): void {}

	protected implDispose(task: Task): void {}
}
