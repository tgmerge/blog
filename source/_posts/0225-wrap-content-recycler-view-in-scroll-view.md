title: "WRAP_CONTENT 的 RecyclerView 在 ScrollView 中无法显示完整内容"
date: "2017-1-13 15:50"
tags:
- Android
- Troubleshooting
---

## 问题

形如下面这样的布局中：

```xml
<ScrollView>
    <LinearLayout ... android:oriention="vertical">
        <SomeView />
        <RecyclerView ... android:layout_height="wrap_content" />
        <SomeView />
    </LinearLayout>
</ScrollView>
```

RecyclerView 在项目较多时将无法按 `WRAP_CONTENT` 的预期显示完整内容，只会显示一部分项目。

## 失败的解决方法

1. `recyclerView.getLayoutManager().setAutoMeasureEnabled(false)`；
2. `recyclerView.setHasFixedSize(false)`；
3. `recyclerView.setNestedScrollingEnabled(false)`；

均不能解决问题。

## 成功但莫名其妙的解决方法

像这样：

<!-- more -->

```xml
<ScrollView>
    <LinearLayout ... android:oriention="vertical">
        <SomeView ... android:layout_height="1000dp" />
        <RecyclerView ... android:layout_height="wrap_content" />
        <SomeView />
    </LinearLayout>
</ScrollView>
```

让 RecyclerView 不一开始就显示在屏幕上，而是从下方滚动出来，这样 RecyclerView 就会按 `WRAP_CONTENT` 的预期正常工作。

但这种方法并没有什么实际作用……

## 失败的解决方法 #2

在给 RecyclerView 的 adapter 添加数据后调用：

1. `recyclerView.invalidate()`；
2. `recyclerParent.invalidate()`（recyclerParent 是 RecyclerView 的 Parent view）；
3. `recyclerView.requestLayout()`；
4. `recyclerParent.requestLayout()`

或者使用 `postDelayed()` 避开动画再使用上述方法，均不能解决问题。按说 invalidate() 之后 LayoutManager 应该会重新 measure 的，但实际上并没有？

## 成功的解决方法

1. 使用 NestedScrollView 替换 ScrollView：

    ```xml
    <android.support.v4.widget.NestedScrollView>
        <LinearLayout ... android:oriention="vertical">
            <SomeView />
            <RecyclerView ... android:layout_height="wrap_content" />
            <SomeView />
        </LinearLayout>
    </ScrollView>
    ```

2. 使用 RelativeLayout 替换 LinearLayout：

    ```xml
    <ScrollView>
        <RelativeLayout ... android:oriention="vertical">
            <SomeView .../>
            <RecyclerView ... android:layout_height="wrap_content" below="..." />
            <SomeView below="..."/>
        </LinearLayout>
    </ScrollView>
    ```

3. 使用 RelativeLayout 包裹 RecyclerView，在 LinearLayout 中使用。

这样 RecyclerView 就能作为 ScrollView 的一部分在长页面中正常滚动了。

当然不能忘记使用 `recyclerView.setNestedScrollingEnabled(false)` 禁用 RecyclerView 本身的 nested scrolling，以及使用 `recyclerView.getLayoutManager().setAutoMeasureEnabled(true)` 启用 LayoutManager 的 AutoMeasure 功能自动计算布局。

参考：[android-recycler-view-wrap-content](https://github.com/amardeshbd/android-recycler-view-wrap-content)，[RecyclerView inside ScrollView is not working](http://stackoverflow.com/a/37338715/2996355) 和 [RecyclerView inside ScrollView is not working](http://stackoverflow.com/a/38995399/2996355)
