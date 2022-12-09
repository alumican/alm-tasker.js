export enum TaskEventType {
	complete = 'complete',
}

export class TaskEvent extends CustomEvent<void> {
	// --------------------------------------------------
	//
	// CONSTRUCTOR
	//
	// --------------------------------------------------

	constructor(type: TaskEventType) {
		super(type);
	}
}
