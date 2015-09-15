title: "Chrome+MacType丢失文字的问题 Part2"
date: "2015-09-15 12:43:00"
tags:
- Chrome
- Windows
- MacType
---

Chrome 45之后，使用MacType的情况下，某些文字丢失的问题使用[之前这篇文章](/2015/04/0203-chrome-mactype-missing-characters/)说的方法已经无法解决了。

新的解决方法是，在`chrome://flags`里，找到`#num-raster-threads`这个配置项。更改其值为`1`。用了一段时间没出问题。