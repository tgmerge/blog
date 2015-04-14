title: "gae, python :: Part I"
date: "2013-12-05 17:31:00"
tags:
- GAE
- Python
---
稍微整理下gae相关的东西。

#### 关于scaling

根据Google在这篇[Python App的运行模式](https://developers.google.com/appengine/docs/python/modules/)的描述，Google非常厚道地给了`automatic_scaling` 每天28小时免费的实例时间，也就是说如果全天候跑着一个`automatic_scaling`的示例，免费额度是不会跑完的。

但剩下的两种模式，也就是`basic_scaling`和`manual_scaling`，每天只有8小时额度。用`basic_scaling`的话要控制好最大空闲时间`idle_timeout`，但用`manual_scaling`几乎必定会超额。

自己暂且用的是这个

```
    # app.yaml
    automatic_scaling:
      min_idle_instances: 0
      max_idle_instances: 1
      max_pending_latency: 15s
```

顺便一提，

> For example an F2 consumes instance hours at twice the rate of an F1.

调高性能配额的话，Instance hours会烧得更快。

#### CookieJar in App Engine

因为要用CookieJar所以前面那个scaling的问题麻烦了不少……理想情况是有一个Instance一直在跑，里面的CookieJar在内存里一直保留着收集下的cookie。但是问题在于至今还没搞清楚Automatic Scaling到底是以什么机制掐实例的……总之观察一阵子。

虽然知道最标准的方案是把cookie存到datastore里但不就是懒吗‎……暂且把对象一直塞在内存里。

#### Memcache

Google的Memcache简直良心，看一眼这篇[使用内存缓存](https://developers.google.com/appengine/docs/python/memcache/usingmemcache?hl=zh-cn)基本上就没问题了。

```python
    #memcache_demo.py
    def get_data():
        data = memcache.get("key")
        if data is not None:
            return data
        else:
            data = self.query_for_data()
            memcache.add("key", data, 60)
            return data
```
