title: "上传到GAE"
date: 2013-12-03 18:08:00
tags:
- daily
---
试用Google App Eppengine……先把Deploy的时候遇到的问题记下来。

[上传使用的appcfg.py命令行参考](https://developers.google.com/appengine/docs/python/tools/uploadinganapp?hl=zh-cn)和[英文版本（有oauth等更多内容）](https://developers.google.com/appengine/docs/python/tools/uploadinganapp)。

#### 解决GFW

Gae上传的时候用的是`appcfg.py`，根据[appcfg.py命令行参考](https://developers.google.com/appengine/docs/python/tools/uploadinganapp?hl=zh-cn)，虽说它可以用在cmd中

```bat
    set HTTP_PROXY=http://cache.mycompany.com:3128
    set HTTPS_PROXY=http://cache.mycompany.com:3128
    appcfg.py update myapp
```

这样的方法来设置代理服务器，但如果直接这样然后用goagent的话会因为SSL证书和域名不一致的问题产生`InvalidCertificateException`错误。其他方式翻墙的话不太会有问题。至于Smarthosts之类的，因为太久没更新也会出错。

总之最后解决的办法是Opendns……到[这里](http://www.opendns.com/support/cache/?d=appengine.google.com)解析下`appengine.google.com`的最新地址然后写进hosts吧。

#### OAuth

    appcfg.py --oauth2 update
