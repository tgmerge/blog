title: "RxJava 笔记和 Demo (2) - 适用场景"
date: "2016-11-19 23:57"
tags:
- Android
- Java
- RxJava
- ReactiveX
- RxAndroid
- Retrofit
---

## RxJava 的适用场景

### 与 Retrofit 的结合

[Code 17 - RxJava + Retrofit 进行网络请求](https://github.com/tgmerge/rx-java-playground/blob/8f8f79766f7ad731529fe2bb15348b76250a4632/app/src/main/java/me/tgmerge/rxjavaplayground/part2_retrofit/RxRetro1Activity.java#L31)

这个示例模拟了“在网络请求发起时更新 UI -> 处理请求结果 -> 根据请求结果再次更新 UI”的过程。

使用了 [JSONPlaceholder](https://jsonplaceholder.typicode.com) API。

* **在发起请求时更新UI** 在`subscribeOn()`中完成；
* **处理请求结果** 在`map()`中完成；
* **根据处理后的结果更新UI** 在`subscribe()`中完成。

期间根据需求调度线程。

[Code 18 - RxJava + Retrofit 按顺序依次发起两个请求](https://github.com/tgmerge/rx-java-playground/blob/8f8f79766f7ad731529fe2bb15348b76250a4632/app/src/main/java/me/tgmerge/rxjavaplayground/part2_retrofit/RxRetro2Activity.java#L36)

这个示例模拟了“更新 UI -> 发起请求 A -> 利用请求 A 的结果发起请求 B -> 处理请求 B 的结果 -> 根据请求 B 的结果再次更新 UI”的过程。

<!-- more -->

具体来说，它会发起一个 JSONPlaceholder 的 `/posts` 请求，用这个请求 **返回字符串的长度 % 10 + 1** 作为 `id` ，发起 `/post/{id}` 请求。

![](/assets/0222-06.png)

实际应用中类似的情景是，先发起一个请求获取 token，然后使用这个 token 发起其他请求。

RxJava 有一点好，就是在链式声明的任意位置抛出的异常都会被 Subscriber 的 `onError()` 接到，可以统一处理。

### RxBus 作为事件总线

[Code 19 - RxJava 作为事件总线](https://github.com/tgmerge/rx-java-playground/blob/fcaa9496c926a10eb5f8fcfbf9b8b2fe3e719552/app/src/main/java/me/tgmerge/rxjavaplayground/part3_rxbus/RxBus.java#L15)

RxJava 可以作为事件总线使用。

最基本的用法是，将一个单例的 Observable 作为总线，让其发送和处理事件。然而这么做会造成两个很麻烦的问题：

1. 无法实现 sticky 的事件（订阅某事件的 subscriber 会在订阅时马上收到订阅之前最后一次触发的该事件，而不需要等到下次事件触发）；
2. 订阅者处理事件的过程中一旦出现错误，将触发 `onError()` 导致订阅中断。

解决这些问题，并将 RxBus 整合进 MVP 结构中，参考：

* [用 RxJava 实现事件总线 (Event Bus)](http://www.jianshu.com/p/ca090f6e2fe2)
* [深入 RxBus：［异常处理］](http://www.jianshu.com/p/0493cc28a811)
* [Google 的 android-architecture](https://github.com/googlesamples/android-architecture)

#### ofType 操作符

[Rx 文档对 ofType 操作符的解释](http://reactivex.io/documentation/operators/filter.html#collapseRxJava 1․x)是：

![](http://reactivex.io/documentation/operators/images/ofClass.png)

该操作符仅在 observable 发射的事件对象和指定的类型一致时，才继续传递该对象。

这个操作符天生适合进行对总线上不同类型事件的过滤，只要在作为总线的 observable 上叠一层 `ofType(EventType.class)`，我们的事件订阅者就只会收到 `EventType` 类型的事件了。

#### sticky 事件的处理

[Code 20 - RxBus 对 sticky 事件的处理](https://github.com/tgmerge/rx-java-playground/blob/fcaa9496c926a10eb5f8fcfbf9b8b2fe3e719552/app/src/main/java/me/tgmerge/rxjavaplayground/part3_rxbus/RxBus.java#L67)

[深入 RxBus：［支持 Sticky 事件］](http://www.jianshu.com/p/71ab00a2677b)这篇文章中使用了 `ConcurrentHashMap<EventType, Event>` 来保存每种事件最近一次触发的事件对象，在每次 sticky 事件触发的时候更新之，并在新的 sticky 事件订阅者订阅事件的时候，取出相应类型的事件对象并发送。

**Note** 这种方法和 EventBus 比较像，由于事件对象被保存在了单例的 RxBus 中，可能造成内存泄漏。文章作者推荐在不需要使用某种事件的时候，通过 `removeStickyEvent(EventType)` 的方法从 HashMap 移除它；另外在应用退出时，用 `removeAllStickyEvents()` 清理所有的 sticky 事件对象。

#### 错误处理

[Code 21 - RxBus 异常时重新订阅](https://github.com/tgmerge/rx-java-playground/blob/fcaa9496c926a10eb5f8fcfbf9b8b2fe3e719552/app/src/main/java/me/tgmerge/rxjavaplayground/part3_rxbus/SubscriberFragment.java#L75)

RxBus 事件监听时的异常可能发生在 Subscriber 处理事件的过程中（各种 `lift()`），也可能发生在最终事件到达的 `onNext()` 里。

如果是在处理事件的过程中抛出了异常，会直接调用 `Subscriber.onError()`，继而终止整个订阅，事件监听就断掉了。

在 `Subscriber.onError()` 中重新订阅事件是一种可行的方法，但只适用于非 sticky 事件。如果 sticky 事件监听处 `onError()` 中重新订阅事件，将反复接收到引起异常的那个事件，导致死循环。

#### CompositeSubscription，以及 RxBus 和 MVP 的整合

参考 [Google android-architecture 进行 RxJava 和 MVP 整合的做法](https://github.com/googlesamples/android-architecture/blob/todo-mvp-rxjava/todoapp/app/src/main/java/com/example/android/architecture/blueprints/todoapp/tasks/TasksPresenter.java)，Presenter 有责任发送和监听事件，并在接收到事件的时候通知 View 更新内容。

于是 Presenter 需要在生命周期内管理它内部的 `Subscription` ，即 `订阅`。

RxJava 提供了 [`CompositeSubscription`](http://reactivex.io/RxJava/javadoc/rx/subscriptions/CompositeSubscription.html) 用于统一 unsubscribe 多个 `Subscription`。主要的方法只有两个：

* `clear()`：解除订阅 `CompositeSubscription` 中已有的 Subscription，之后可以重新添加其他的 Subscription；
* `unsubscribe()`：解除订阅自身和其中所有的 Subscription，之后再添加的 Subscription 也会直接被解除订阅。

Presenter 可以在和 View 解除关联的时候使用 `unsubscribe()` 解除所有订阅。

参考 [When to use CompositeSubscription.unsubscribe](http://www.paul-woitaschek.de/blog/when-to-use-composite-subscription-unsubscribe/)

归结起来，和 RxBus 结合的 Presenter 需要做这些事情：

1. 持有一个 `CompositeSubscription`；
2. 在 Presenter 和 View 建立关系时，初始化 `CompositeSubscription`；
3. 在 Presenter 和 View 解除关系时，使用 `CompositeSubscription.unsubscribe()` 解除订阅。

另外，Presenter 的每个 Subscription（包括 Retrofit 网络请求、RxBus 监听和其他自定义的 Subscriber）都需要被添加到 `CompositeSubscription` 中：

```java
Subscription subs = RxBus.getDefault().toObservable(Event.class)
        .map(... ...);
        .subscribe(... ...);
mCompositeSubscription.add(subs);
```

如果需要单独控制某个 Subscription 的订阅/解除订阅，也需要将它添加到 CompositeSubscription 中。

例如某个刷新内容的网络请求，如果发起请求时前一次请求的结果还没有返回，需要先解除这个请求的订阅：

```java
Subscription refreshSubs;

public void refresh() {
    if (refreshSubs != null && !refreshSubs.isUnsubscribed()) {
        refreshSubs.unsubscribe();
    }
    refreshSubs = SomeAPI.getSomething().subscribe(... ...);
    mCompositeSubscription.add(refreshSubs);
}
```
