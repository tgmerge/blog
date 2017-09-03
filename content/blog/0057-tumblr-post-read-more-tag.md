---
title: "tumblr的文章摘要和Read More..."
date: "2013-12-10 13:20:00"
tags:
- tumblr
---
在Text post中间插入`[[MORE]]`的话，这篇post在首页上就会显示为带有“Read More...”标记的摘要，不会因为太长而占用太多空间了。另外，想要自定义Read More链接的样式的话，可以在HTML Theme中紧接着`{Body}`下面添加或者修改

```html
    {block:More}
        <p class="read_more_container">
            <a href="{Permalink}" class="read_more">
                read more →
            </a>
       </p>
    {/block:More}
```

本来想着就这么把太长的文章加上read more标记的，而且玩过的游戏都会丧心病狂地剧透……不过又没有到处散播，危害应该不大就算了吧。