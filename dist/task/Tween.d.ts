import { EasingFunction } from 'alm_coreutil';
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
export declare enum TweenEventType {
    play = "play",
    stop = "stop",
    reset = "reset",
    jump = "jump",
    update = "update",
    complete = "complete"
}
export declare class TweenEvent extends CustomEvent<void> {
    constructor(type: TweenEventType);
}
export declare class Tween extends Task {
    constructor(duration: number, easing: EasingFunction);
    target(scope: object, property: string, to: number, options?: TweenOptions): Tween;
    onPlay(f: TweenCallbackFunction): Tween;
    onStop(f: TweenCallbackFunction): Tween;
    onReset(f: TweenCallbackFunction): Tween;
    onJump(f: TweenCallbackFunction): Tween;
    onUpdate(f: TweenCallbackFunction): Tween;
    onComplete(f: TweenCallbackFunction): Tween;
    protected implRun(task: Task): void;
    protected implInterrupt(task: Task): void;
    protected implDispose(task: Task): void;
    stop(): void;
    togglePlaying(): void;
    reset(): void;
    jump(progress: number): void;
    private requestAnimationFrameHandler;
    private prepare;
    private apply;
    private static map;
    private static setValue;
    private static getValue;
    private static setProperty;
    private static getProperty;
    getIsPlaying(): boolean;
    getProgressTime(): number;
    getProgressValue(): number;
    getDuration(): number;
    private playHandler;
    private stopHandler;
    private resetHandler;
    private jumpHandler;
    private updateHandler;
    private completeHandler;
    private targets;
    private duration;
    private easing;
    private isPlaying;
    private isPaused;
    private progressTime;
    private progressValue;
    private startTime;
    private elapsedTimePaused;
    private elapsedTime;
    private onPlayFunction;
    private onStopFunction;
    private onResetFunction;
    private onJumpFunction;
    private onUpdateFunction;
    private onCompleteFunction;
}
