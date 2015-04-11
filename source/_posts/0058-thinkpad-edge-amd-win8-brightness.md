title: "Thinkpad Edge，Win8，AMD显卡，屏幕亮度调节问题"
date: "2013-12-12 22:35:00"
tags:
- daily
---
联想从将近一年前就没有再更新E系列比较老机型的显卡驱动了。尤其是联想的AMD显卡驱动在Win8下兼容性一直不好，各种亮度无法调节无法手动切换独显之类的问题……

自己用的是Thinkpad E420 11412YC，其他一些机型情况似乎也差不多。直接从AMD官网下载新版Catalyst驱动尝试安装的话，会提示“不支持该计算机”而失败。Catalyst测试版虽然可以正常安装，却会出现无法调节亮度的问题。用了网上说的禁用`Sensor Monitoring Service`服务和禁用注册表`KMD_EnableBrightnessInterface2`项之后均不能解决。

各种尝试之后大致整理一下解决方法。

首先安装联想提供的最新版本显卡驱动，[E420(Win8 64bit)的话是在这里下载](http://think.lenovo.com.cn/support/driver/detail.aspx?DEditid=4455&docTypeID=DOC_TYPE_DRIVER&osid=241&treeid=3092200&args=%3Fcategoryid%3D3092200%26CODEName%3D11412YC%26SearchNodeCC%3D11412YC%26SearchType%3D1%26wherePage%3D2%26Rcode%3D11412YC)，驱动文件名是`AMD[8ids02ww].exe`。

安装重启之后应该是各种小毛病出现的状态。调整到手动切换显卡后，独显无法调节屏幕亮度。然后，[在AMD官网安装**测试版**驱动。](http://support.amd.com/zh-cn/download/mobile?os=Windows%208%20-%2064)←这个链接的页面里，下载标有Latest Beta Driver的那个，覆盖安装就可以。我用的版本是13.11 Beta，文件名是`amd_catalyst_13.11_mobility_betav9.5.exe`。

安装之后应该就正常了。调整到手动切换显卡模式，屏幕亮度调节也没问题。如果还是不正常的话，也可以再试试禁用`Sensor Monitoring Service`服务，以及在注册表中搜索所有的`KMD_EnableBrightnessInterface2`项并将值设为`0`的方法。

完成之后重新测试系统体验指数，图形部分居然上升了0.1……

![](/assets/0058-01.png)

最后，如果试过所有办法都不行的话……手动切换到集显调节亮度八成是能成功的，这时候切回独显，那个亮度值就保留下来了……不过这算是没解决吧？