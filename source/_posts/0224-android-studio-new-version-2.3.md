title: "Android Studio 2.3 - 值得注意的新特性"
date: "2017-1-1 17:57"
tags:
- Android
- Android Studio
- Java
---

[Android Studio 2.3 两个星期以前发布到了 beta 版本](https://sites.google.com/a/android.com/tools/recent/androidstudio23beta1isnowavailable)，从这些新特性上又给~~无脑~~写代码提供了大量便利：

## Instant Run 的改进

Android Studio 2.2 的 Instant Run 按钮很不方便使用：在 Instant Run 出问题的时候，很难快速来一次传统的 "Run" 来重装应用。现在，Android 2.3 把 Instant Run 按钮和 Run 按钮分开了：

![Instant Run 和 Run 的按钮分开了](/assets/0224-01.png)

"Run" 按钮将尝试重启应用并完整替换("cold swap")应用，但并不是重装 APK；"Instant Run" 则会尝试热替换资源和代码，让更改立即生效。

> 终于不需要经常 Disable instant run 了 \_(:3

<!-- more -->

## 编译缓存

Android Studio 2.3 将使用跨 Project 的编译缓存来加速项目编译。他们说的。

然而仍然有[一些已知问题](https://code.google.com/p/android/issues/detail?id=229171)存在。

## Layout 编辑器

新版 Layout 编辑器的 View Palette 似乎更好用了：

![新的 Layout 编辑器的 Palette 界面](/assets/0224-02.png)

Android Studio 2.3 支持更多 ConstraintLayout 的特性：[视图链(chains)和比例约束(ratios)](https://developer.android.com/reference/android/support/constraint/ConstraintLayout.html)。

**Chain 约束**允许创建平均分布的多个视图组合，嵌套 `LinearLayout` 有望成为历史：

![多种 Chain 类型](/assets/0224-03.png)

**Ratio 约束**允许以多种形式约束 View 的长宽比，各种 RatioImageView 大概也要成为历史了：

```xml
<!-- 约束长宽比 -->
<Button android:layout_width="wrap_content"
        android:layout_height="0dp"
        app:layout_constraintDimensionRatio="1:1" />

<!-- 约束仅作用于高度：
     Button 的宽度将和 parent 一致，高度将自动调整，使按钮的长宽比是 16:9 -->
<Button android:layout_width="0dp"
        android:layout_height="0dp"
        app:layout_constraintDimensionRatio="H,16:9"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintTop_toTopOf="parent"/>             
```

> I love it!
> 
> ![I love it!](/assets/0224-04.jpg)

## App Links 支持

App Links 可以让搜索引擎直接搜索原生应用页面和结果 - [这里有介绍](https://developer.android.com/training/app-links/index.html)。

## Lint 的改进

Lint 结果终于有了 Material design 的样子，这样大概关掉 lint 的人也会少一点吧（讲真为什么要关？嫌慢的话换电脑啊

## Data binding

Android Studio 2.3 改进了对 [Data Binding Library](https://developer.android.com/topic/libraries/data-binding/index.html) 的支持。

[Layout 中 Data binding 的支持](https://realm.io/news/data-binding-android-boyar-mount/)简直好顶赞，语法一看就让人想起 AngularJS：

```xml
<layout xmlns:android="http://schemas.android.com/apk/res/android">
    <data>
        <variable name="user" type="com.android.example.User"/>
    </data>
   <RelativeLayout
            android:layout_width="match_parent"
            android:layout_height="match_parent">
        <TextView android:text="@{user.name}"
                  android:layout_width="wrap_content"
                  android:layout_height="wrap_content"/>
        <TextView android:text="@{user.lastname}"
                  android:layout_width="wrap_content"
                  android:layout_height="wrap_content"/>
    </RelativeLayout>
</layout>
```

Data Binding Library 还支持更多绑定属性、通过 `ViewHolder` 使用多种 View type 的 layout 等复杂特性。

以及大家都喜欢的自动 `null` 检查！再也没有 `NullPointerException` 辣！取而代之的是空白 Item（笑

> 虽然可以减少很多 boilerplate code，但感觉性价比也没有比手写 `Adapter.onBindView()` 高多少……会观望一阵子再用。

## 很多的 Bug fix

其中一个值得注意的 bug fix: [`tools:listitem` 属性不会生效](https://code.google.com/p/android/issues/detail?id=215172)

在 Android Studio 2.3 中，在 layout XML 中为 `ListView` 和 `RecyclerView` 等设置的 `tools:listitem` 属性终于能在预览界面中显示出来辣！

> 写 layout 不用 tools namespace 写预览内容的人，养的猫都会很丑，而且会在 30 岁的时候不得已和不喜欢的人结婚

## 顺便说一个关于快捷键的事情

Android Studio 的 "Class Name Completion" 这个自动补全操作可以提示 XML 中可选的属性值，Windows 下默认 Keymap `Ctrl+Alt+Space`

![自动补全 Layout XML 中的属性值](/assets/0224-05.png)

没发现这个操作名字和快捷键的时候都是重新敲一遍属性名称触发它的哈哈哈
