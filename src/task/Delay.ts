import { Task } from '../core/Task';

export class Delay extends Task {
	// --------------------------------------------------
	//
	// CONSTRUCTOR
	//
	// --------------------------------------------------

	constructor(time: number) {
		super();
		this.time = time;
		this.timerId = -1;
	}

	// --------------------------------------------------
	//
	// METHOD
	//
	// --------------------------------------------------

	protected implRun(task: Task): void {
		if (this.time > 0) {
			this.timerId = window.setTimeout(this.completeHandler, this.time);
		} else {
			this.notifyComplete();
		}
	}

	protected implInterrupt(task: Task): void {
		this.cancel();
	}

	protected implDispose(task: Task): void {
		this.cancel();
	}

	private cancel(): void {
		if (this.timerId !== -1) {
			clearTimeout(this.timerId);
			this.timerId = -1;
		}
	}

	private completeHandler = (): void => {
		this.notifyComplete();
	};

	// --------------------------------------------------
	//
	// MEMBER
	//
	// --------------------------------------------------

	private time: number;
	private timerId: number;
}
