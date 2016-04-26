title: "SQLAlchemy文档和笔记 (1.1) - 总览"
date: "2016-04-26 23:45:00"
tags:
- Python
- SQLAlchemy
- document
---

以前在Python写数据库的时候都是尽可能小打小闹_(:3 SQLAlchemy尝试玩了几次然而并没有坚持多久，这次起码要在哪里用上一下？

以一边学学 ~~摸鱼~~ 一边简单 ~~胡乱~~ 翻译[SQLAlchemy官方文档](http://docs.sqlalchemy.org/en/rel_1_0/index.html
)为主，中间会随便试试然后把memo也加进去。

本篇翻译自[SQLAlchemy 1.0官方文档 Overview一章](http://docs.sqlalchemy.org/en/rel_1_0/intro.html)。

## Overview / 总览

SQLAlchemy分为Core和ORM两个独立的组件：

* Core仅仅是一个SQL抽象工具；
* ORM在Core之上构建。

SQLAlchemy的组件和层级如下：

<!-- more -->

![](http://docs.sqlalchemy.org/en/rel_1_0/_images/sqla_arch_small.png)

SQLAlchemy面向用户的两个主要组件是Object Relational Mapper（对象关系映射）和SQL Expression Language（SQL表达语言）。其中SQL Expression可以独立于ORM使用。而当使用ORM时，SQL Expression Language被用于建立Object-Relational关系的配置，以及数据库查询。

### Documentation Overview / 文档总览

http://www.sqlalchemy.org/docs/10/

文档主要分为三部分：

* [SQLAlchemy ORM](http://docs.sqlalchemy.org/en/rel_1_0/orm/index.html)
* [SQLALchemy Core](http://docs.sqlalchemy.org/en/rel_1_0/core/index.html)
* [Dialects（方言）](http://docs.sqlalchemy.org/en/rel_1_0/dialects/index.html)

SQLAlchemy ORM部分主要介绍Object Relational Mapper，初学者应该首先阅读这一部分。

SQLAlchemy Core部分主要介绍SQLAlchemy的SQL和数据库集成和描述服务。这两种服务是SQL表达语言的核心。SQLAlchemy的几种基础服务部件也在这一部分中描述。

Dialects部分作为参考，描述了所有SQLAlchemy支持的数据库和DBAPI。

### Installation Guide / 安装

``` shell
pip install SQLAlchemy
```

SQLAlchemy已经支持了Python 2.6+和Python 3，还支持Pypy。

本文档适用于 SQLAlchemy 1.0。使用以下语句检查已经安装的 SQLAlchemy 版本：

```python
>>> import sqlalchemy
>>> sqlalchemy.__version__
1.0.0
```
