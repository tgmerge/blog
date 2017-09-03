---
title: "Evernote Clearly中文、英文和日文混排时的字体设置"
date: "2014-01-12 17:49:00"
tags:
- font
- Evernote
---
Clearly相当方便，但多种语言混排的时候，只用`PT Serif, Hiragino Sans GB W3`这样的字体设置会让日文假名显示得一坨……

所以只好用`@font-face`按Unicode自定义字体的方法。Clearly的自定义CSS:

```css
    #body {line-height: 1.75em !important;}

    /* 未定义的部分 */
    @font-face {
      font-family: Clearfont;
      src: local("Hiragino Sans GB W3");
    }

    /* U+3040 - U+30FF，日文假名 */
    @font-face {
      font-family: Clearfont;
      unicode-range: U+3040-30FF;
      src: local(Meiryo UI);
    }
```

之后把Clearly的字体设置成`PT Serif, Clearfont`就好。

这样的话假名部分会显示成Meiryo UI，中文部分则是Hiragino Sans GB W3。虽然只有英文是衬线体的PT Serif但效果还不错。

![](/assets/0064-01.png)

![](/assets/0064-02.png)