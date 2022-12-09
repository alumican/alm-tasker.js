import { Task } from './core/Task';

export function dispose(task: Task): null {
	if (task) {
		task.dispose();
	}
	return null;
}
