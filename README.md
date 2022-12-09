# Tasker
非同期処理の流れをわかりやすく設計することができるJavaScriptライブラリです。

## 🚀 導入
以下のコードをによって読み込みます。
```js
<script src="https://cdn.jsdelivr.net/npm/tasker.js/dist/index.min.js"></script>
```

## ✍ 使い方
### Example1
1秒後にコンソールにcompleteと表示する。
```js
tasker.serial(
    tasker.delay(1000),
    tasker.log('complete'),
).run();
```

### Example2
xを0から100まで1秒かけて変化させる。その間xの値をコンソールに出力し続け、トゥイーンが完了するとコンソールにcompleteと表示する。
```js
x = 0;
tasker.tween(1000, alm_coreutil.Easing.easeOutSine)
    .target(this, 'x', 100)
    .onUpdate(() => {
        console.log(x);
    })
    .onComplete(() => {
        console.log('complete');
    })
    .run();
```

### Example3
```js
x = 0;
y = 50;
tasker.tween(1000, alm_coreutil.Easing.easeOutSine)
    .target(this, 'x', 100)
    .target(this, 'y', 100)
    .onUpdate(() => {
        console.log(x);
    })
    .onComplete(() => {
        console.log('complete');
    })
    .run();
```

### Example4
```js
x = 0;
tasker.serial(
    tasker.tween(1000, alm_coreutil.Easing.easeOutSine).target(this, 'x', 100),
    tasker.tween(2000, alm_coreutil.Easing.easeInQuart).target(this, 'x', 50),
    tasker.log('complete'),
).run();
```

### Task

#### call
```js
tasker.call(() => {
    console.log('complete');
})
```

#### callback
```js
tasker.callback((resolve) => {
    console.log('complete');
    resolve();
})
```

#### delay
```js
tasker.delay(1000)
```

#### branch
```js
rnd = Math.random() < 0.5;
tasker.branch(rnd, () => {
    console.log('then');
}, () => {
    console.log('reject');
})
```

```js
tasker.branch(() => {
    return Math.random() < 0.5;
}, () => {
    console.log('then');
}, () => {
    console.log('reject');
})
```

#### listen
```js
tasker.listen(target, 'complete')
```

#### log
```js
tasker.log('hello')
```

```js
tasker.log('hello', 'world')
```

#### tween
```js
x = 0;
tasker.tween(1000, alm_coreutil.Easing.easeOutSine).target(x, 100)
```

```js
x = 0;
tasker.tween(1000, alm_coreutil.Easing.easeOutSine).target(x, 100, { from: -100 })
```

#### serial
```js
tasker.serial(
    tasker.delay(1000),
    tasker.delay(2000),
    tasker.delay(3000),
    tasker.log('complete'),
)
```

#### parallel
```js
tasker.parallel(
    tasker.delay(1000),
    tasker.delay(2000),
    tasker.delay(3000),
    tasker.log('complete'),
)
```

#### br
```js
tasker.br()
```

#### ret
```js
tasker.ret()
```

#### nop
```js
tasker.nop()
```

### Utility
#### dispose
```js
task = tasker.delay(1000);
task.run();

tasker.dispose(task);
```

### ドキュメント
[APIリファレンス](https://alumican.github.io/tasker.js/doc/)
