---
title: "Chrome+MacType丢失文字的问题"
date: "2015-04-16 13:34:00"
tags:
- Chrome
- Windows
- MacType
---

Chrome升级到41以后，在使用MacType的情况下偶尔会出现丢失文字的情况。准确地说，丢失的是字体中的某些字符？比如，页面里所有Tahoma字体的`h`字符都会显示为空白，`somewhere`显示为`somew ere`之类，中文的情况也类似，相当蛋疼。

搜索过类似的问题但没什么收获。今天突然看到v2ex上[这个帖子](https://www.v2ex.com/t/184034)和[这个帖子](https://www.v2ex.com/t/180832)有人遇到一模一样的问题。帖子里的解决方法是在`chrome://flags`里，启用`覆盖软件渲染列表(ignore-gpu-blacklist)`这项。总之先试着，似乎是解决了……