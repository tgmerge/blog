title: "哪些符合要求的osu beatmap没有下过？"
date: "2014-11-14 0:58:00"
tags:
- daily
---
在beatmap搜索结果页的javascript console：

```javascript
    document.body.innerHTML.match(/[0-9]+(?=".class="title")/g);
```

之后python：

```python
    ids = # ["63609", ..., ]
    import os
    s = "".join([dirname for dirname, dirnames, filenames in os.walk("e:/path/to/osu/songs")])
    [((oneid in s), oneid) for oneid in ids if (oneid not in s)]
```

总之记下来