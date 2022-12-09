import { EasingFunction } from 'alm_coreutil';
import { Callback, CallbackFunction } from './task/Callback';
import { Call } from './task/Call';
import { Delay } from './task/Delay';
import { Parallel } from './task/Parallel';
import { Serial } from './task/Serial';
import { Task } from './core/Task';
import { Break } from './task/Break';
import { Return } from './task/Return';
import { Nop } from './task/Nop';
import { Condition, If } from './task/If';
import { Listen } from './task/Listen';
import { Log } from './task/Log';
import { Tween } from './task/Tween';

export function call(f: Function, args: any[] = null, eventTarget: EventTarget = null, eventType: string = null): Call {
	return new Call(f, args, eventTarget, eventType);
}

export function callback(f: CallbackFunction): Callback {
	return new Callback(f);
}

export function delay(time: number): Delay {
	return new Delay(time);
}

export function branch(condition: Condition, then: Task, reject: Task): If {
	return new If(condition, then, reject);
}

export function listen(eventTarget: EventTarget, eventType: string): Listen {
	return new Listen(eventTarget, eventType);
}

export function log(...messages: any[]): Log {
	return new (Function.prototype.bind.call(Log, null, ...messages))();
}

export function tween(duration: number, easing: EasingFunction): Tween {
	return new Tween(duration, easing);
}

export function serial(...tasks: (Task | Function)[]): Serial {
	return new (Function.prototype.bind.call(Serial, null, ...tasks))();
}

export function parallel(...tasks: (Task | Function)[]): Parallel {
	return new (Function.prototype.bind.call(Parallel, null, ...tasks))();
}

export function br(): Break {
	return new Break();
}

export function ret(): Return {
	return new Return();
}

export function nop(): Nop {
	return new Nop();
}
