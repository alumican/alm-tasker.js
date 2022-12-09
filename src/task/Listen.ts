import { Task } from '../core/Task';

export class Listen extends Task {
	// --------------------------------------------------
	//
	// CONSTRUCTOR
	//
	// --------------------------------------------------

	constructor(eventTarget: EventTarget, eventType: string) {
		super();
		this.eventTarget = eventTarget;
		this.eventType = eventType;
	}

	// --------------------------------------------------
	//
	// METHOD
	//
	// --------------------------------------------------

	protected implRun(task: Task): void {
		if (this.eventTarget && this.eventType) {
			this.eventTarget.addEventListener(this.eventType, this.completeHandler);
		}
	}

	protected implInterrupt(task: Task): void {
		if (this.eventTarget && this.eventType) {
			this.eventTarget.removeEventListener(this.eventType, this.completeHandler);
		}
	}

	protected implDispose(task: Task): void {
		if (this.eventTarget && this.eventType) {
			this.eventTarget.removeEventListener(this.eventType, this.completeHandler);
		}

		this.eventType = null;
		this.eventTarget = null;
	}

	private completeHandler = (event: Event): void => {
		this.notifyComplete();
	};

	// --------------------------------------------------
	//
	// MEMBER
	//
	// --------------------------------------------------

	private eventTarget: EventTarget;
	private eventType: string;
}
