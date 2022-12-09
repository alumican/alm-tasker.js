import { DateUtil, EasingFunction, Type } from 'alm_coreutil';
import { AnimFrame } from 'alm_animframe';
import { Task } from '../core/Task';

export type TweenCallbackFunction = (tween: Tween) => void;

export interface TweenOptions {
	from?: number;
	suffix?: string;
	prefix?: string;
}

export interface TweenTarget {
	scope: object;
	property: string;
	from: number;
	to: number;
	suffix: string;
	prefix: string;

	_from: number;
	_value: number;
}

export enum TweenEventType {
	play = 'play',
	stop = 'stop',
	reset = 'reset',
	jump = 'jump',
	update = 'update',
	complete = 'complete',
}

export class TweenEvent extends CustomEvent<void> {
	// --------------------------------------------------
	//
	// CONSTRUCTOR
	//
	// --------------------------------------------------

	constructor(type: TweenEventType) {
		super(type);
	}
}

export class Tween extends Task {
	// --------------------------------------------------
	//
	// CONSTRUCTOR
	//
	// --------------------------------------------------

	constructor(duration: number, easing: EasingFunction) {
		super();

		this.duration = duration;
		this.easing = easing;

		this.targets = [];
		this.isPlaying = false;
		this.isPaused = false;

		this.progressTime = 0;
		this.progressValue = this.easing(this.progressTime);

		this.addEventListener(TweenEventType.play, this.playHandler);
		this.addEventListener(TweenEventType.stop, this.stopHandler);
		this.addEventListener(TweenEventType.reset, this.resetHandler);
		this.addEventListener(TweenEventType.jump, this.jumpHandler);
		this.addEventListener(TweenEventType.update, this.updateHandler);
		this.addEventListener(TweenEventType.complete, this.completeHandler);
	}

	// --------------------------------------------------
	//
	// METHOD
	//
	// --------------------------------------------------

	public target(scope: object, property: string, to: number, options?: TweenOptions): Tween {
		this.targets.push({
			scope: scope,
			property: property,
			to: to,
			from: options?.from,
			suffix: options?.suffix,
			prefix: options?.prefix,
			_from: null,
			_value: null,
		});
		return this;
	}

	public onPlay(f: TweenCallbackFunction): Tween {
		this.onPlayFunction = f;
		return this;
	}

	public onStop(f: TweenCallbackFunction): Tween {
		this.onStopFunction = f;
		return this;
	}

	public onReset(f: TweenCallbackFunction): Tween {
		this.onResetFunction = f;
		return this;
	}

	public onJump(f: TweenCallbackFunction): Tween {
		this.onJumpFunction = f;
		return this;
	}

	public onUpdate(f: TweenCallbackFunction): Tween {
		this.onUpdateFunction = f;
		return this;
	}

	public onComplete(f: TweenCallbackFunction): Tween {
		this.onCompleteFunction = f;
		return this;
	}

	protected implRun(task: Task): void {
		if (this.isPlaying || this.progressTime === 1) return;
		this.isPlaying = true;

		if (this.isPaused) {
			this.isPaused = false;
			this.startTime = DateUtil.now() - this.elapsedTimePaused;
			AnimFrame.addEventListener(this.requestAnimationFrameHandler);
			this.dispatchEvent(new TweenEvent(TweenEventType.play));
		} else {
			this.prepare();
			this.startTime = DateUtil.now();
			this.elapsedTime = 0;

			if (this.duration > 0) {
				this.apply(0);
				AnimFrame.addEventListener(this.requestAnimationFrameHandler);
				this.dispatchEvent(new TweenEvent(TweenEventType.play));
			} else {
				this.apply(0);
				this.dispatchEvent(new TweenEvent(TweenEventType.play));
				this.apply(1);
				this.dispatchEvent(new TweenEvent(TweenEventType.update));
				this.isPlaying = false;
				this.dispatchEvent(new TweenEvent(TweenEventType.complete));
			}
		}
	}

	protected implInterrupt(task: Task): void {
		this.implDispose(task);
	}

	protected implDispose(task: Task): void {
		AnimFrame.removeEventListener(this.requestAnimationFrameHandler);
		this.isPlaying = false;
		this.isPaused = false;
		this.targets = null;
		this.easing = null;
		this.onPlayFunction = null;
		this.onStopFunction = null;
		this.onResetFunction = null;
		this.onJumpFunction = null;
		this.onUpdateFunction = null;
		this.onCompleteFunction = null;
	}

	public stop(): void {
		if (!this.isPlaying) return;
		this.isPlaying = false;

		this.isPaused = true;
		this.elapsedTimePaused = this.elapsedTime;
		AnimFrame.removeEventListener(this.requestAnimationFrameHandler);
		this.dispatchEvent(new TweenEvent(TweenEventType.stop));
	}

	public togglePlaying(): void {
		this.isPlaying ? this.stop() : this.run();
	}

	public reset(): void {
		if (!this.isPlaying) return;
		this.isPlaying = false;

		this.elapsedTime = 0;
		this.apply(0);
		AnimFrame.removeEventListener(this.requestAnimationFrameHandler);
		this.dispatchEvent(new TweenEvent(TweenEventType.reset));
	}

	public jump(progress: number): void {
		if (this.progressTime === progress) return;

		this.elapsedTime = progress * this.duration;
		if (this.isPlaying) {
			this.startTime = DateUtil.now() - this.elapsedTime;
		}
		if (this.isPaused) {
			this.elapsedTimePaused = this.elapsedTime;
		}

		this.prepare();
		this.apply(progress);
		this.dispatchEvent(new TweenEvent(TweenEventType.jump));
	}

	private requestAnimationFrameHandler = (): void => {
		if (this.isPlaying) {
			this.elapsedTime = DateUtil.now() - this.startTime;
			if (this.elapsedTime >= this.duration) {
				this.elapsedTime = this.duration;
				this.apply(1);
				AnimFrame.removeEventListener(this.requestAnimationFrameHandler);
				this.dispatchEvent(new TweenEvent(TweenEventType.update));
				this.isPlaying = false;
				this.dispatchEvent(new TweenEvent(TweenEventType.complete));
				this.notifyComplete();
			} else {
				this.apply(this.elapsedTime / this.duration);
				this.dispatchEvent(new TweenEvent(TweenEventType.update));
			}
		}
	};

	private prepare(): void {
		const targetCount = this.targets.length;
		for (let i = 0; i < targetCount; ++i) {
			const target = this.targets[i];
			target._from = Type.isNumber(target.from) ? target.from : Tween.getValue(target);
		}
	}

	private apply(timeRatio: number): void {
		this.progressTime = timeRatio;
		this.progressValue = this.easing(this.progressTime);
		const targetCount = this.targets.length;
		for (let i = 0; i < targetCount; ++i) {
			const target = this.targets[i];
			Tween.setValue(target, Tween.map(this.progressValue, target._from, target.to));
		}
	}

	private static map(progress: number, from: number, to: number): number {
		return progress * (to - from) + from;
	}

	private static setValue(target: TweenTarget, value: number): void {
		target._value = value;
		Tween.setProperty(value, target.scope, target.property, target.prefix, target.suffix);
	}

	private static getValue(target: TweenTarget): number {
		return (target._value = Tween.getProperty(target.scope, target.property, target.prefix, target.suffix));
	}

	private static setProperty(value: number, scope: object, property: string, prefix: string, suffix: string): void {
		if (prefix) {
			value = <any>(prefix + value);
		}
		if (suffix) {
			value = <any>(value + suffix);
		}
		scope[property] = value;
	}

	private static getProperty(scope: object, property: string, prefix: string, suffix: string): number {
		return prefix || suffix ? parseFloat(scope[property]) || 0 : scope[property];
	}

	public getIsPlaying(): boolean {
		return this.isPlaying;
	}

	public getProgressTime(): number {
		return this.progressTime;
	}

	public getProgressValue(): number {
		return this.progressValue;
	}

	public getDuration(): number {
		return this.duration;
	}

	private playHandler = (): void => {
		if (this.onPlayFunction) {
			this.onPlayFunction(this);
		}
	};

	private stopHandler = (): void => {
		if (this.onStopFunction) {
			this.onStopFunction(this);
		}
	};

	private resetHandler = (): void => {
		if (this.onResetFunction) {
			this.onResetFunction(this);
		}
	};

	private jumpHandler = (): void => {
		if (this.onJumpFunction) {
			this.onJumpFunction(this);
		}
	};

	private updateHandler = (): void => {
		if (this.onUpdateFunction) {
			this.onUpdateFunction(this);
		}
	};

	private completeHandler = (): void => {
		if (this.onCompleteFunction) {
			this.onCompleteFunction(this);
		}
	};

	// --------------------------------------------------
	//
	// MEMBER
	//
	// --------------------------------------------------

	private targets: TweenTarget[];
	private duration: number;
	private easing: EasingFunction;

	private isPlaying: boolean;
	private isPaused: boolean;
	private progressTime: number;
	private progressValue: number;
	private startTime: number;
	private elapsedTimePaused: number;
	private elapsedTime: number;

	private onPlayFunction: TweenCallbackFunction;
	private onStopFunction: TweenCallbackFunction;
	private onResetFunction: TweenCallbackFunction;
	private onJumpFunction: TweenCallbackFunction;
	private onUpdateFunction: TweenCallbackFunction;
	private onCompleteFunction: TweenCallbackFunction;
}
