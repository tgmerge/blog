title: "Android Wi-Fi图标的感叹号"
date: "2015-04-16 12:56:00"
tags:
- Android
---

Android 4以上的版本在连接到Wi-Fi网络之后，会先尝试访问`clients3.google.com/generate_204`这个地址来判断这个Wi-Fi能否连接到互联网、是否需要登录。如果访问结果是`HTTP 204`，或者返回空内容，则认为网络正常；否则认为该网络无法连接到互联网，同时显示感叹号图标，提醒用户登录Wi-Fi网络。

但是在天朝`clients3.google.com`显然是无法访问的。所以就算已经通过网页登录无线网络，那个感叹号图标还是会一直显示……

这个问题有两种解决方法，都不需要Root权限。`adb shell`或者用终端模拟器之类就可以。

1. `settings put global captive_portal_detection_enabled 0`
   完全关闭Wi-Fi连接性检查，缺点是无法提醒登录。

2. `settings put global captive_portal_server www.265.com`
   更换连接性检查的地址（换成`www.265.com/generate_204`），推荐用这种。
   所以说为啥Google家的265导航在天朝没被墙？

其实自己弄一个能返回HTTP 204或者空页面的服务器也可以。
