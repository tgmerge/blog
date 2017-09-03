---
title: "Android: My Very Own Tips (1)"
date: "2016-11-17 00:23:00"
tags:
- Android
- Java
---

感觉大部分都已经是常识了，但说不定以后遇到[这样的事情](https://xkcd.com/1513/)能用得上呢……

## 项目结构相关

### 按功能组织 Java package

按类（activity, fragment, presenter, adapter, etc.）组织 package 会把相互关联的类打散在各种 package 中，造成混乱。

合理的组织方式应该是按功能（login, mail, search, etc.）组织 package。[Mosby demo 这种形式](https://github.com/sockeqwe/mosby/tree/d1d83bc58c7bc7786e69f41ce88f7ed936103884/sample-mail/src/main/java/com/hannesdorfmann/mosby/sample/mail)就很不错。

### 组织一个`_backbone`或者类似的包

在项目中把个人编写、和业务无关的“框架”独立成一个 Java package 或者 module。

虽然在前面加下划线这种风格并不为 Java 所推荐，但个人还是使用了这些：

<!-- more -->

* `_backbone`：放置 view, presenter, model 的基类；自定义 view 和它们的 adapter 基类；网络请求工具类；静态工具类
* `_api`：放置 RxJava + Retrofit 包装的网络 API。
* `_model`：放置各种 model。子 package 包含 filter model 和 presenter model。
* `_viewcomponent`：自定义的 PopupWindow 和 Dialog 等 UI 组件。

## View 相关

### 把一系列 UI 元件包装起来，把对它们的操作（e.g. setVisibility）变成有语义的操作

### 用静态方法开启 Activity

在应用内部，不要使用`Intent`调用应用自己的其它`Activity`，这样非常容易遗漏或者写错 intent 的 key。

使用静态的 starter 方法开启 Activity，代替`Activity.startActivity(intent)`和`Activity.startActivityForResult(intent, requestCode)`。Android Studio 对此有预设的`starter`代码片段。

```java
class ProductActivity extends Activity {
    static public void start(Context context, int productId) {
        Intent intent = new Intent(context, ProductActivity.class);
        intent.putExtra(KEY_PRODUCT_ID, productId);
        context.startActivity(intent);
    }
    ...
}
```

### 用 Helper 的形式包装不好用的 API

例如百度地图。可以用`MapHelper`将复杂和需要细致处理的部分包装起来，只提供语义明确的新 API。

    class MapHelper {
        public void setMapView(MapView mapView) ...
        
        public void addMetro(Metro metro) ...
        
        public void removeMetro(Metro metro) ...
    
        public void setOnMetroClickListener(OnMetroClickListener listener) ...
    }

### 写一个 TestActivity

可以写一个 TestActivity 用来直接打开应用中大部分的界面，需要的时候可以指定 intent 的 extra。当然可能的时候最好用 Espresso。

### 有时候没必要使用 Adapter

直接写一个 Helper，从 model 里生成一系列 view 然后塞进 layout 里也是可取的，尤其是 view 的数目不多、不需要频繁变换的时候。

### dimensions.xml: 使用 margin_1x 这种形式指定提供统一风格的尺寸

使用 1x, 2x, 3x 这种倍数的尺寸，可以在符合 Android UI 规范的前提下方便编写 layout。

```xml
<resources>
    <dimen name="item_margin_0.5x">4dp</dimen>
    <dimen name="item_margin_1x">8dp</dimen>
    <dimen name="item_margin_2x">16dp</dimen>
    <dimen name="item_margin_3x">24dp</dimen>

    <dimen name="item_padding_0.5x">4dp</dimen>
    <dimen name="item_padding_1x">8dp</dimen>
    <dimen name="item_padding_2x">16dp</dimen>

    <dimen name="line_space_extra_1x">8dp</dimen>
</resources>
```

## Model 相关

### 在 model 可能为 null 的时候，提供一个空 model 避免多余的检查

在 model（或者 model 的基类）上提供一个静态方法，用于处理“可能为空的 model 对象”。

这个方法在 unsafeModel 为空的时候，创建一个空白的 model 对象并返回它（debug 的时候可以抛出`NullPointerException`方便调试），确保调用过这个方法后，unsafeModel 绝对不可能是 null。

```java
class BaseModel {
    public static <T extends BaseModel> nullSafeWrap(T unsafeModel) {
        if (unsafeModel == null) {
            Log.w("BaseModel", "nullSafeWrap: " + T + " is null");
            if (isInDebugMode()) {
                throw new NullPointerException(...);
            } else {
                return T.emptyModel();
            }
        }
        T safeModel = unsafeModel;
        return safeModel;
    }
}
```

### Model 可以胖一点

Model 应该可以自行处理一些小逻辑，比如从自身的某个值生成可读文本、格式化自身日期等等。

Model 的 getter 应该在值为`null`的时候适当做一点处理，避免太多空检查。

还有如“当`type==1`时返回`firstName`，否则返回`lastName`”这种逻辑可以写在 model 里一个叫 `autoNameByType()` 这样的方法中。

## 其他

### Debug 的时候抛出异常，Release 的时候吞下异常

使用一个静态方法检查当前是否处于 Debug build。在 Debug build 中提供一些方便调试和开启各个界面的功能（类似`TestActivity`这种）

在 Release build 中，统一捕获应用程序中发生的异常，并在可能的时候反馈给服务器。[这里有一个不使用第三方库的方案](http://stackoverflow.com/a/19968400)。

### 在发送广播和事件的地方，提供静态的监听方法

例如，对于`loginStatus`这个全局属性，提供

* getLoginStatus()
* setLoginStatus(newStatus)
* listenLoginStatusChange(callback)

这样一系列方法。`setLoginStatus()`可以用 EventBus 发送广播解决监听的问题。

### 最好不要搞坏 Instant Run

可以节约很多时间。

### 不要用一个 Constant 类放置所有的常量

大多数时候，常量要写在常量“归属于”的那个类。一味地将常量放在 Constant 类中只会在需要用的时候找不到。

e.g. Intent 的`KEY`和`EXTRA_KEY`，以及`REQUEST_CODE`，`URL`之类

### 使用 Retrofit + RxJava 处理网络请求

使用 Retrofit 提供 service，在外面用 RxJava 包装一层方便进行请求前后的处理。

## MVP 模式相关

### Adapter 在 MVP 中所处的位置

Adapter 可以放在 View 层。可以认为 Adapter 是一个特殊的视图组件，放进 model，产生视图的变化。

另外，Presenter 中不应该包含有 Android 相关的 import。

Adapter 最好提供 getItem(int index) 这样的方法。这样，View 层可以传递和用户操作相关的 Model 给 Presenter。

    class ProductActivity extends Activity {
        @Override
        public void onProductRecyclerItemClicked(int index) {
            getPresenter().productItemClicked(productAdapter.getItem(index));
        }
    }

### Presenter 不应该保存 context

Presenter 不应该将 context 保存下来，这很容易造成资源泄漏。但在方法中临时用一下 context 是没有问题的。

### Presenter 不应该创建 Intent

Presenter 不应该进行`new Intent(...)`这样的操作。

但 Presenter 可以调用 View 的 `gotoXXXActivity(paramA, paramB)`方法，由 View 创建 Intent 并将 `paramA`，`paramB` 填进去。

### 其他关于 MVP 的点

* http://hannesdorfmann.com/android/mosby-playbook 关于 Mosby 的详细解释，以及 MVP 模式应用中的一些 tips
* https://github.com/sockeqwe/mosby/blob/d1d83bc58c7bc7786e69f41ce88f7ed936103884/sample-mail/src/main/java/com/hannesdorfmann/mosby/sample/mail/model/mail/MailProvider.java 合理地使用 RxJava 和网络请求(其实就是 XXXAPI 对 XXXAPI.service 的那一层包装)

使用 EventBus 可以解耦 Fragment 和 Activity，比起现在不完善的 RxBus 可能还是 EventBus 比较好用。
