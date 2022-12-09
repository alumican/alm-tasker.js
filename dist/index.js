/*! alm-tasker.js 1.0.0 (c) 2022 alumican, licensed under the MIT, more information https://github.com/alumican/alm-tasker.js */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('alm_coreutil'), require('alm_animframe')) :
    typeof define === 'function' && define.amd ? define(['exports', 'alm_coreutil', 'alm_animframe'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.tasker = global.tasker || {}, global.alm_coreutil, global.alm_animframe));
})(this, (function (exports, alm_coreutil, alm_animframe) { 'use strict';

    var TaskEventType;
    (function (TaskEventType) {
        TaskEventType["complete"] = "complete";
    })(TaskEventType || (TaskEventType = {}));
    class TaskEvent extends CustomEvent {
        // --------------------------------------------------
        //
        // CONSTRUCTOR
        //
        // --------------------------------------------------
        constructor(type) {
            super(type);
        }
    }

    var TaskState;
    (function (TaskState) {
        TaskState[TaskState["sleeping"] = 0] = "sleeping";
        TaskState[TaskState["running"] = 1] = "running";
        TaskState[TaskState["interrupting"] = 2] = "interrupting";
    })(TaskState || (TaskState = {}));

    class Task extends EventTarget {
        // --------------------------------------------------
        //
        // CONSTRUCTOR
        //
        // --------------------------------------------------
        constructor() {
            super();
            this.state = TaskState.sleeping;
            this.self = this;
            this.parent = null;
        }
        // --------------------------------------------------
        //
        // METHOD
        //
        // --------------------------------------------------
        run() {
            if (this.state > TaskState.sleeping) {
                throw new Error('[Task.run] + Task is already running.');
            }
            this.state = TaskState.running;
            this.implRun.call(this, this);
        }
        interrupt() {
            if (this.state === TaskState.running) {
                this.state = TaskState.interrupting;
                this.implInterrupt.call(this, this);
            }
        }
        dispose() {
            this.state = TaskState.sleeping;
            this.implDispose.call(this, this);
            this.parent = null;
        }
        notifyComplete() {
            switch (this.state) {
                case TaskState.sleeping:
                    break;
                case TaskState.running:
                    this.dispatchEvent(new TaskEvent(TaskEventType.complete));
                    this.dispose();
                    break;
                case TaskState.interrupting:
                    this.dispatchEvent(new TaskEvent(TaskEventType.complete));
                    this.dispose();
                    break;
            }
        }
        getState() {
            return this.state;
        }
        getParent() {
            return this.parent;
        }
        setParent(parent) {
            this.parent = parent;
        }
        getSelf() {
            return this.self;
        }
    }

    class Call extends Task {
        // --------------------------------------------------
        //
        // CONSTRUCTOR
        //
        // --------------------------------------------------
        constructor(f, args = null, eventTarget = null, eventType = null) {
            super();
            this.completeHandler = (event) => {
                this.notifyComplete();
            };
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
        implRun(task) {
            if (alm_coreutil.Type.isFunction(this.f)) {
                if (this.eventTarget && this.eventType) {
                    this.eventTarget.addEventListener(this.eventType, this.completeHandler);
                    if (this.args) {
                        this.f(...this.args);
                    }
                    else {
                        this.f();
                    }
                }
                else {
                    if (this.args) {
                        this.f(...this.args);
                    }
                    else {
                        this.f();
                    }
                    this.notifyComplete();
                }
            }
            else {
                this.notifyComplete();
            }
        }
        implInterrupt(task) {
            if (this.eventTarget && this.eventType) {
                this.eventTarget.removeEventListener(this.eventType, this.completeHandler);
            }
        }
        implDispose(task) {
            if (this.eventTarget && this.eventType) {
                this.eventTarget.removeEventListener(this.eventType, this.completeHandler);
            }
            this.f = null;
            this.args = null;
            this.eventTarget = null;
            this.eventType = null;
        }
    }

    class Nop extends Task {
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
        implRun(task) {
            this.notifyComplete();
        }
        implInterrupt(task) { }
        implDispose(task) { }
    }

    class TaskList extends Task {
        // --------------------------------------------------
        //
        // CONSTRUCTOR
        //
        // --------------------------------------------------
        constructor(...tasks) {
            super();
            this.tasks = [];
            this.addTask(...tasks);
        }
        // --------------------------------------------------
        //
        // METHOD
        //
        // --------------------------------------------------
        addTask(...tasks) {
            if (tasks.length > 0) {
                this.preProcess(tasks);
                this.tasks = this.getTasks().concat(tasks);
            }
        }
        insertTask(...tasks) {
            this.insertTaskAt(0, ...tasks);
        }
        insertTaskAt(index, ...tasks) {
            if (tasks.length > 0) {
                this.preProcess(tasks);
                Array.prototype.splice.apply(this.getTasks(), [index, 0].concat(tasks));
            }
        }
        addTaskArray(tasks) {
            this.addTask(...tasks);
        }
        insertTaskArray(tasks) {
            this.insertTask(...tasks);
        }
        insertTaskArrayAt(index, tasks) {
            this.insertTaskAt(index, ...tasks);
        }
        getLength() {
            return this.tasks.length;
        }
        getTaskByIndex(index) {
            return this.tasks[index];
        }
        getTasks() {
            return this.tasks;
        }
        preProcess(tasks) {
            const taskCount = tasks.length;
            let task;
            for (let i = 0; i < taskCount; ++i) {
                task = tasks[i];
                if (task) {
                    // function
                    if (alm_coreutil.Type.isFunction(task)) {
                        tasks[i] = task = new Call(task);
                    }
                }
                else {
                    // null
                    tasks[i] = task = new Nop();
                }
                task.setParent(this);
            }
        }
        implRun(task) {
            this.notifyComplete();
        }
        implInterrupt(task) { }
        implDispose(task) { }
    }

    var _module$1 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        Task: Task,
        TaskList: TaskList,
        get TaskState () { return TaskState; },
        get TaskEventType () { return TaskEventType; },
        TaskEvent: TaskEvent
    });

    class Break extends Task {
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
        implRun(task) {
            const f = this.getParent()['notifyBreak'];
            if (f)
                f();
            this.notifyComplete();
        }
        implInterrupt(task) { }
        implDispose(task) { }
    }

    class Callback extends Task {
        // --------------------------------------------------
        //
        // CONSTRUCTOR
        //
        // --------------------------------------------------
        constructor(f) {
            super();
            this.f = f;
        }
        // --------------------------------------------------
        //
        // METHOD
        //
        // --------------------------------------------------
        implRun(task) {
            if (alm_coreutil.Type.isFunction(this.f)) {
                this.f(() => {
                    this.notifyComplete();
                });
            }
            else {
                this.notifyComplete();
            }
        }
        implInterrupt(task) { }
        implDispose(task) {
            this.f = null;
        }
    }

    class If extends Task {
        // --------------------------------------------------
        //
        // CONSTRUCTOR
        //
        // --------------------------------------------------
        constructor(condition, then, reject) {
            super();
            this.completeHandler = (event) => {
                this.selectedTask.removeEventListener(TaskEventType.complete, this.completeHandler);
                this.selectedTask = null;
                this.notifyComplete();
            };
            this.condition = condition;
            this.then = then;
            this.reject = reject;
            this.selectedTask = null;
        }
        // --------------------------------------------------
        //
        // METHOD
        //
        // --------------------------------------------------
        implRun(task) {
            let result;
            if (alm_coreutil.Type.isFunction(this.condition)) {
                result = this.condition();
            }
            else {
                result = this.condition;
            }
            if (result) {
                if (this.then) {
                    this.selectedTask = this.then;
                }
            }
            else {
                if (this.reject) {
                    this.selectedTask = this.reject;
                }
            }
            if (this.selectedTask) {
                this.selectedTask.addEventListener(TaskEventType.complete, this.completeHandler);
                this.selectedTask.run();
            }
            else {
                this.notifyComplete();
            }
        }
        implInterrupt(task) {
            if (this.selectedTask) {
                this.selectedTask.removeEventListener(TaskEventType.complete, this.completeHandler);
                this.selectedTask.interrupt();
                this.selectedTask = null;
            }
        }
        implDispose(task) {
            if (this.selectedTask) {
                this.selectedTask.removeEventListener(TaskEventType.complete, this.completeHandler);
                this.selectedTask.dispose();
                this.selectedTask = null;
            }
            this.condition = null;
            this.then = null;
            this.reject = null;
        }
    }

    class Listen extends Task {
        // --------------------------------------------------
        //
        // CONSTRUCTOR
        //
        // --------------------------------------------------
        constructor(eventTarget, eventType) {
            super();
            this.completeHandler = (event) => {
                this.notifyComplete();
            };
            this.eventTarget = eventTarget;
            this.eventType = eventType;
        }
        // --------------------------------------------------
        //
        // METHOD
        //
        // --------------------------------------------------
        implRun(task) {
            if (this.eventTarget && this.eventType) {
                this.eventTarget.addEventListener(this.eventType, this.completeHandler);
            }
        }
        implInterrupt(task) {
            if (this.eventTarget && this.eventType) {
                this.eventTarget.removeEventListener(this.eventType, this.completeHandler);
            }
        }
        implDispose(task) {
            if (this.eventTarget && this.eventType) {
                this.eventTarget.removeEventListener(this.eventType, this.completeHandler);
            }
            this.eventType = null;
            this.eventTarget = null;
        }
    }

    class Log extends Task {
        // --------------------------------------------------
        //
        // CONSTRUCTOR
        //
        // --------------------------------------------------
        constructor(...messages) {
            super();
            this.messages = messages;
        }
        // --------------------------------------------------
        //
        // METHOD
        //
        // --------------------------------------------------
        implRun(task) {
            console.log.apply(console, Array.prototype.slice.call(this.messages));
            this.notifyComplete();
        }
        implInterrupt(task) { }
        implDispose(task) {
            this.messages = null;
        }
    }

    class Parallel extends TaskList {
        // --------------------------------------------------
        //
        // CONSTRUCTOR
        //
        // --------------------------------------------------
        constructor(...tasks) {
            super(...tasks);
            this.completeHandler = (event) => {
                if (++this.completeCount >= this.getLength()) {
                    this.notifyComplete();
                }
            };
            this.completeCount = 0;
        }
        // --------------------------------------------------
        //
        // METHOD
        //
        // --------------------------------------------------
        addTask(...tasks) {
            super.addTask(...tasks);
        }
        insertTask(...tasks) {
            this.addTask(...tasks);
        }
        addTaskArray(tasks) {
            this.addTask(...tasks);
        }
        insertTaskArray(tasks) {
            this.addTask(...tasks);
        }
        implRun(task) {
            this.completeCount = 0;
            const length = this.getLength();
            if (length > 0) {
                const tasks = this.getTasks();
                let task;
                for (let i = 0; i < length; ++i) {
                    task = tasks[i];
                    task.addEventListener(TaskEventType.complete, this.completeHandler);
                    task.run();
                }
            }
            else {
                this.notifyComplete();
            }
        }
        implInterrupt(task) {
            const length = this.getLength();
            if (length > 0) {
                const tasks = this.getTasks();
                let task;
                for (let i = 0; i < length; ++i) {
                    task = tasks[i];
                    task.removeEventListener(TaskEventType.complete, this.completeHandler);
                    task.interrupt();
                }
            }
            super.implInterrupt(task);
        }
        implDispose(task) {
            const length = this.getLength();
            if (length > 0) {
                const tasks = this.getTasks();
                let task;
                for (let i = 0; i < length; ++i) {
                    task = tasks[i];
                    task.removeEventListener(TaskEventType.complete, this.completeHandler);
                    task.dispose();
                }
            }
            super.implDispose(task);
        }
        implNotifyBreak() {
            const length = this.getLength();
            if (length > 0) {
                const tasks = this.getTasks();
                let task;
                for (let i = 0; i < length; ++i) {
                    task = tasks[i];
                    if (task.getState() === TaskState.running) {
                        task.removeEventListener(TaskEventType.complete, this.completeHandler);
                        task.interrupt();
                    }
                }
            }
            this.notifyComplete();
        }
        implNotifyReturn() {
            const length = this.getLength();
            if (length > 0) {
                const tasks = this.getTasks();
                let task;
                for (let i = 0; i < length; ++i) {
                    task = tasks[i];
                    if (task.getState() === TaskState.running) {
                        task.removeEventListener(TaskEventType.complete, this.completeHandler);
                        task.interrupt();
                    }
                }
            }
            const f = this.getParent()['notifyReturn'];
            if (f)
                f();
            this.dispose();
        }
    }

    class Return extends Task {
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
        implRun(task) {
            const f = this.getParent()['notifyReturn'];
            if (f)
                f();
            this.notifyComplete();
        }
        implInterrupt(task) { }
        implDispose(task) { }
    }

    class Serial extends TaskList {
        // --------------------------------------------------
        //
        // CONSTRUCTOR
        //
        // --------------------------------------------------
        constructor(...tasks) {
            super(...tasks);
            this.completeHandler = (event) => {
                this.currentTask.removeEventListener(TaskEventType.complete, this.completeHandler);
                this.currentTask = null;
                if (++this.position >= this.getLength()) {
                    this.notifyComplete();
                }
                else {
                    this.next();
                }
            };
            this.currentTask = null;
            this.position = -1;
            this.isPaused = false;
            this.isCompleteOnPaused = false;
        }
        // --------------------------------------------------
        //
        // METHOD
        //
        // --------------------------------------------------
        addTask(...tasks) {
            super.addTask(...tasks);
        }
        insertTask(...tasks) {
            super.insertTaskAt(this.position + 1, ...tasks);
        }
        addTaskArray(tasks) {
            this.addTask(...tasks);
        }
        insertTaskArray(tasks) {
            this.insertTask(...tasks);
        }
        next() {
            this.currentTask = this.getTaskByIndex(this.position);
            this.currentTask.addEventListener(TaskEventType.complete, this.completeHandler);
            this.currentTask.run();
        }
        implRun(task) {
            this.position = 0;
            if (this.getLength() > 0) {
                this.next();
            }
            else {
                this.notifyComplete();
            }
        }
        implInterrupt(task) {
            if (this.currentTask) {
                this.currentTask.removeEventListener(TaskEventType.complete, this.completeHandler);
                this.currentTask.interrupt();
                this.currentTask = null;
            }
            this.position = -1;
            super.implInterrupt(task);
        }
        implDispose(task) {
            if (this.currentTask) {
                this.currentTask.removeEventListener(TaskEventType.complete, this.completeHandler);
                this.currentTask.dispose();
                this.currentTask = null;
            }
            this.position = -1;
            this.isPaused = false;
            this.isCompleteOnPaused = false;
            super.implDispose(task);
        }
        implNotifyBreak() {
            if (this.currentTask.getState() === TaskState.running) {
                this.currentTask.removeEventListener(TaskEventType.complete, this.completeHandler);
                this.currentTask.interrupt();
            }
            this.notifyComplete();
        }
        implNotifyReturn() {
            if (this.currentTask.getState() === TaskState.running) {
                this.currentTask.removeEventListener(TaskEventType.complete, this.completeHandler);
                this.currentTask.interrupt();
            }
            const f = this.getParent()['notifyReturn'];
            if (f)
                f();
            this.dispose();
        }
    }

    var TweenEventType;
    (function (TweenEventType) {
        TweenEventType["play"] = "play";
        TweenEventType["stop"] = "stop";
        TweenEventType["reset"] = "reset";
        TweenEventType["jump"] = "jump";
        TweenEventType["update"] = "update";
        TweenEventType["complete"] = "complete";
    })(TweenEventType || (TweenEventType = {}));
    class TweenEvent extends CustomEvent {
        // --------------------------------------------------
        //
        // CONSTRUCTOR
        //
        // --------------------------------------------------
        constructor(type) {
            super(type);
        }
    }
    class Tween extends Task {
        // --------------------------------------------------
        //
        // CONSTRUCTOR
        //
        // --------------------------------------------------
        constructor(duration, easing) {
            super();
            this.requestAnimationFrameHandler = () => {
                if (this.isPlaying) {
                    this.elapsedTime = alm_coreutil.DateUtil.now() - this.startTime;
                    if (this.elapsedTime >= this.duration) {
                        this.elapsedTime = this.duration;
                        this.apply(1);
                        alm_animframe.AnimFrame.removeEventListener(this.requestAnimationFrameHandler);
                        this.dispatchEvent(new TweenEvent(TweenEventType.update));
                        this.isPlaying = false;
                        this.dispatchEvent(new TweenEvent(TweenEventType.complete));
                        this.notifyComplete();
                    }
                    else {
                        this.apply(this.elapsedTime / this.duration);
                        this.dispatchEvent(new TweenEvent(TweenEventType.update));
                    }
                }
            };
            this.playHandler = () => {
                if (this.onPlayFunction) {
                    this.onPlayFunction(this);
                }
            };
            this.stopHandler = () => {
                if (this.onStopFunction) {
                    this.onStopFunction(this);
                }
            };
            this.resetHandler = () => {
                if (this.onResetFunction) {
                    this.onResetFunction(this);
                }
            };
            this.jumpHandler = () => {
                if (this.onJumpFunction) {
                    this.onJumpFunction(this);
                }
            };
            this.updateHandler = () => {
                if (this.onUpdateFunction) {
                    this.onUpdateFunction(this);
                }
            };
            this.completeHandler = () => {
                if (this.onCompleteFunction) {
                    this.onCompleteFunction(this);
                }
            };
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
        target(scope, property, to, options) {
            this.targets.push({
                scope: scope,
                property: property,
                to: to,
                from: options === null || options === void 0 ? void 0 : options.from,
                suffix: options === null || options === void 0 ? void 0 : options.suffix,
                prefix: options === null || options === void 0 ? void 0 : options.prefix,
                _from: null,
                _value: null,
            });
            return this;
        }
        onPlay(f) {
            this.onPlayFunction = f;
            return this;
        }
        onStop(f) {
            this.onStopFunction = f;
            return this;
        }
        onReset(f) {
            this.onResetFunction = f;
            return this;
        }
        onJump(f) {
            this.onJumpFunction = f;
            return this;
        }
        onUpdate(f) {
            this.onUpdateFunction = f;
            return this;
        }
        onComplete(f) {
            this.onCompleteFunction = f;
            return this;
        }
        implRun(task) {
            if (this.isPlaying || this.progressTime === 1)
                return;
            this.isPlaying = true;
            if (this.isPaused) {
                this.isPaused = false;
                this.startTime = alm_coreutil.DateUtil.now() - this.elapsedTimePaused;
                alm_animframe.AnimFrame.addEventListener(this.requestAnimationFrameHandler);
                this.dispatchEvent(new TweenEvent(TweenEventType.play));
            }
            else {
                this.prepare();
                this.startTime = alm_coreutil.DateUtil.now();
                this.elapsedTime = 0;
                if (this.duration > 0) {
                    this.apply(0);
                    alm_animframe.AnimFrame.addEventListener(this.requestAnimationFrameHandler);
                    this.dispatchEvent(new TweenEvent(TweenEventType.play));
                }
                else {
                    this.apply(0);
                    this.dispatchEvent(new TweenEvent(TweenEventType.play));
                    this.apply(1);
                    this.dispatchEvent(new TweenEvent(TweenEventType.update));
                    this.isPlaying = false;
                    this.dispatchEvent(new TweenEvent(TweenEventType.complete));
                }
            }
        }
        implInterrupt(task) {
            this.implDispose(task);
        }
        implDispose(task) {
            alm_animframe.AnimFrame.removeEventListener(this.requestAnimationFrameHandler);
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
        stop() {
            if (!this.isPlaying)
                return;
            this.isPlaying = false;
            this.isPaused = true;
            this.elapsedTimePaused = this.elapsedTime;
            alm_animframe.AnimFrame.removeEventListener(this.requestAnimationFrameHandler);
            this.dispatchEvent(new TweenEvent(TweenEventType.stop));
        }
        togglePlaying() {
            this.isPlaying ? this.stop() : this.run();
        }
        reset() {
            if (!this.isPlaying)
                return;
            this.isPlaying = false;
            this.elapsedTime = 0;
            this.apply(0);
            alm_animframe.AnimFrame.removeEventListener(this.requestAnimationFrameHandler);
            this.dispatchEvent(new TweenEvent(TweenEventType.reset));
        }
        jump(progress) {
            if (this.progressTime === progress)
                return;
            this.elapsedTime = progress * this.duration;
            if (this.isPlaying) {
                this.startTime = alm_coreutil.DateUtil.now() - this.elapsedTime;
            }
            if (this.isPaused) {
                this.elapsedTimePaused = this.elapsedTime;
            }
            this.prepare();
            this.apply(progress);
            this.dispatchEvent(new TweenEvent(TweenEventType.jump));
        }
        prepare() {
            const targetCount = this.targets.length;
            for (let i = 0; i < targetCount; ++i) {
                const target = this.targets[i];
                target._from = alm_coreutil.Type.isNumber(target.from) ? target.from : Tween.getValue(target);
            }
        }
        apply(timeRatio) {
            this.progressTime = timeRatio;
            this.progressValue = this.easing(this.progressTime);
            const targetCount = this.targets.length;
            for (let i = 0; i < targetCount; ++i) {
                const target = this.targets[i];
                Tween.setValue(target, Tween.map(this.progressValue, target._from, target.to));
            }
        }
        static map(progress, from, to) {
            return progress * (to - from) + from;
        }
        static setValue(target, value) {
            target._value = value;
            Tween.setProperty(value, target.scope, target.property, target.prefix, target.suffix);
        }
        static getValue(target) {
            return (target._value = Tween.getProperty(target.scope, target.property, target.prefix, target.suffix));
        }
        static setProperty(value, scope, property, prefix, suffix) {
            if (prefix) {
                value = (prefix + value);
            }
            if (suffix) {
                value = (value + suffix);
            }
            scope[property] = value;
        }
        static getProperty(scope, property, prefix, suffix) {
            return prefix || suffix ? parseFloat(scope[property]) || 0 : scope[property];
        }
        getIsPlaying() {
            return this.isPlaying;
        }
        getProgressTime() {
            return this.progressTime;
        }
        getProgressValue() {
            return this.progressValue;
        }
        getDuration() {
            return this.duration;
        }
    }

    class Delay extends Task {
        // --------------------------------------------------
        //
        // CONSTRUCTOR
        //
        // --------------------------------------------------
        constructor(time) {
            super();
            this.completeHandler = () => {
                this.notifyComplete();
            };
            this.time = time;
            this.timerId = -1;
        }
        // --------------------------------------------------
        //
        // METHOD
        //
        // --------------------------------------------------
        implRun(task) {
            if (this.time > 0) {
                this.timerId = window.setTimeout(this.completeHandler, this.time);
            }
            else {
                this.notifyComplete();
            }
        }
        implInterrupt(task) {
            this.cancel();
        }
        implDispose(task) {
            this.cancel();
        }
        cancel() {
            if (this.timerId !== -1) {
                clearTimeout(this.timerId);
                this.timerId = -1;
            }
        }
    }

    var _module = /*#__PURE__*/Object.freeze({
        __proto__: null,
        Break: Break,
        Call: Call,
        Callback: Callback,
        If: If,
        Listen: Listen,
        Log: Log,
        Nop: Nop,
        Parallel: Parallel,
        Return: Return,
        Serial: Serial,
        get TweenEventType () { return TweenEventType; },
        TweenEvent: TweenEvent,
        Tween: Tween,
        Delay: Delay
    });

    function dispose(task) {
        if (task) {
            task.dispose();
        }
        return null;
    }

    function call(f, args = null, eventTarget = null, eventType = null) {
        return new Call(f, args, eventTarget, eventType);
    }
    function callback(f) {
        return new Callback(f);
    }
    function delay(time) {
        return new Delay(time);
    }
    function branch(condition, then, reject) {
        return new If(condition, then, reject);
    }
    function listen(eventTarget, eventType) {
        return new Listen(eventTarget, eventType);
    }
    function log(...messages) {
        return new (Function.prototype.bind.call(Log, null, ...messages))();
    }
    function tween(duration, easing) {
        return new Tween(duration, easing);
    }
    function serial(...tasks) {
        return new (Function.prototype.bind.call(Serial, null, ...tasks))();
    }
    function parallel(...tasks) {
        return new (Function.prototype.bind.call(Parallel, null, ...tasks))();
    }
    function br() {
        return new Break();
    }
    function ret() {
        return new Return();
    }
    function nop() {
        return new Nop();
    }

    exports._core = _module$1;
    exports._task = _module;
    exports.br = br;
    exports.branch = branch;
    exports.call = call;
    exports.callback = callback;
    exports.delay = delay;
    exports.dispose = dispose;
    exports.listen = listen;
    exports.log = log;
    exports.nop = nop;
    exports.parallel = parallel;
    exports.ret = ret;
    exports.serial = serial;
    exports.tween = tween;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=index.js.map
