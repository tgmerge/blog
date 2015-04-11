title: "Lovelive日服的第一次启动黄屏问题&解决"
date: "2014-11-05 4:44:00"
tags:
- daily
---
唔发问题解决帖可抽UR

Lovelive安卓版日服会检测root权限，有root则无法启动。用rootcloak之类的xposed插件对应用隐藏root权限的存在，又可能在第一次启动的时候出问题，表现是……第一次启动后程序解压数据，显示“アプリ起動の準備中です”的时候，进度条走到28%会卡在黄色的屏幕，只能强退。

好在可以解决，像这样：

1. 装好lovelive，xposed，rootclock，supersu
2. 在xposed里启用rootclock模块，重启
3. 在rootclock里添加lovelive（`Add/Remove apps`→右上加号→ラブライブ）
4. 在rootclock的隐藏关键字列表里，去除`su`（`Add/Remove keywords hidden by rootclock`→删除`su`）
5. 安全起见重启吧
6. 启动lovelive，这次应该没有问题了。下载数据。

继承码正常输入就好，之后可以把su关键字加回去。