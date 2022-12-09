import { Type } from 'alm_coreutil';
import { Task } from '../core/Task';

export class Call extends Task {
	// --------------------------------------------------
	//
	// CONSTRUCTOR
	//
	// --------------------------------------------------

	constructor(f: Function, args: any[] = null, eventTarget: EventTarget = null, eventType: string = null) {
		super();
		this.f = f;
		this.args = args;
		this.eventTarget = eventTarget;
		this.eventType = eventType;
	}

	// --------------------------------------------------
	//
	// METHOD
	//
	// --------------------------------------------------

	protected implRun(task: Task): void {
		if (Type.isFunction(this.f)) {
			if (this.eventTarget && this.eventType) {
				this.eventTarget.addEventListener(this.eventType, this.completeHandler);
				if (this.args) {
					this.f(...this.args);
				} else {
					this.f();
				}
			} else {
				if (this.args) {
					this.f(...this.args);
				} else {
					this.f();
				}
				this.notifyComplete();
			}
		} else {
			this.notifyComplete();
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

		this.f = null;
		this.args = null;
		this.eventTarget = null;
		this.eventType = null;
	}

	private completeHandler = (event: Event): void => {
		this.notifyComplete();
	};

	// --------------------------------------------------
	//
	// MEMBER
	//
	// --------------------------------------------------

	private f: Function;
	private args: any[];
	private eventTarget: EventTarget;
	private eventType: string;
}
