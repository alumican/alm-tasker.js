import { Type } from 'alm_coreutil';
import { Task } from '../core/Task';

export type CallbackFunction = (complete: () => void) => void;

export class Callback extends Task {
	// --------------------------------------------------
	//
	// CONSTRUCTOR
	//
	// --------------------------------------------------

	constructor(f: CallbackFunction) {
		super();
		this.f = f;
	}

	// --------------------------------------------------
	//
	// METHOD
	//
	// --------------------------------------------------

	protected implRun(task: Task): void {
		if (Type.isFunction(this.f)) {
			this.f((): void => {
				this.notifyComplete();
			});
		} else {
			this.notifyComplete();
		}
	}

	protected implInterrupt(task: Task): void {}

	protected implDispose(task: Task): void {
		this.f = null;
	}

	// --------------------------------------------------
	//
	// MEMBER
	//
	// --------------------------------------------------

	private f: CallbackFunction;
}
