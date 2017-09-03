---
title: 杂项
date: "2015-05-06 4:10:00"
tags:
- dairy
- Python
- JavaScript
- cc98
---

昨天吃坏了今天空肚子休息，躺床上看了会书再加上最近寝室时区不太对的结果就是完·全·失·眠，感觉现在可以单刷鸡盒。

又看了一圈，还是觉得cc98死的过程和Acfun死的过程很像。小圈子老人+平均水平下降+一群恶心专业户+运维无力+“用户体验是啥我们这是传统文化”，新人里友善的那些全被恶心走了。

只可惜A站有大佬注资。个人感觉98看多了日常说话也会变冲，还是先避开冷静一下吧\_(:3 /L)\_

毕设顺利转职成了Python和JavaScript轮子评选，其实也没啥意外的……玩了不少东西，算是好事。不过什么时候才能有造轮子给人用的水平？PyPi乱七八糟，见过有人拿别人GitHub上跑不了的demo打包在上面发布出来……感觉复杂。下面这些算是好用的。

<!-- more -->

- - -

[bottle](http://bottlepy.org/)，阳春但好用的Python WSGI Web服务器。内置的HTTP服务器性能跟没有一样，但配合gevents可以一战。倒不如说一直在用这玩意，是不是应该去学个Django之类的大路货？

[Flask](http://flask.pocoo.org/)，要自己拼组件的轮子。啥时候需要了再说。

[Requests](http://docs.python-requests.org/)，“设计给人类用的Python HTTP客户端”。超级好用，性能就那样。同样配合gevents可以一战。

[Python Spidev](https://github.com/doceme/py-spidev)，SPI协议的Python接口。

[Sphinx](http://sphinx-doc.org/)，文档处理工具。reStructuredText还算科学暂且不提，CommonMark倒是赶紧给我一统天下啊？

[Python Call Graph](http://pycallgraph.slowchop.com/en/master/)，似乎很厉害的Python性能分析器，但总觉得不太准？以及，还是那句话，大多数时候Python的性能都不是问题，只是自己写得渣而已。

[Waitress](http://waitress.readthedocs.org/)，Python WSGI Web服务器。听了名字跑去试用的。性能拉稀，配合Ge下略，反正能战的Python服务器除了Tornado靠的基本都是libev的性能。

[Paramiko](http://www.paramiko.org/)，SSH协议的Python实现，客户端服务器和各种验证机制齐全。网上的资料都集中在如何用它连接到现有的SSH服务器？

[Grequests](https://github.com/kennethreitz/grequests)，Requests + Gevent = <3

[Gevent](http://www.gevent.org/)，一度被奉为神器，但仔细想想协程的应用范围还挺窄的……大多数都是解决卡IO的问题？说起来自己还没正经写过几个Greenlet，光靠monkey.patch_all解决问题简直弱逼……

[socket.io-client](https://github.com/Automattic/socket.io-client)，Python的Socket.IO客户端。原生socket要是有个能把封装验证啥的一并解决的库多好……不对，这似乎就是HTTP？

[PycURL](http://pycurl.sourceforge.net/)，libcurl的Python接口。性能可怕，但不能被Gevent的monkey patch魔改，包装成Greenlet的版本似乎也有问题，于是就只能多线程？

[Socket.IO](http://socket.io/)，支持各种fallback的JavaScript WebSocket库。为啥不叫Socket.js？很久以前就有了的WebSocket现在突然热了起来。其实很好用。

[C3.js](http://c3js.org)，为想画个图又不希望折腾D3.js的你准备，很赞。

[dygraphs](http://dygraphs.com/)，好用的JavaScript图表库，虽说只支持折线图。

[Chart.js](http://www.chartjs.org/)，阳春的图表JavaScript库，支持动画，没了。白占了个好名字，画的东西尤其适合于……放在鸡汤文里装逼？
