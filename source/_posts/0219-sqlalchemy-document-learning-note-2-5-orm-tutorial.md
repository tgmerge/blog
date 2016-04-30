title: "SQLAlchemy文档和笔记 (2.5) - ORM指南 (5)"
date: "2016-04-30 23:01"
tags:
- Python
- SQLAlchemy
- 文档
- 翻译
---

本篇是 ~~胡乱~~ 翻译自[SQLAlchemy 1.0官方文档 Object Relational Tutorial一章](http://docs.sqlalchemy.org/en/rel_1_0/orm/tutorial.html)的第五篇/最后一篇笔记。

- - -

上一部分主要讲Eager Loading、删除和级联删除。

接下来从Building a Many To Many Relationship一节开始。Object Relational Tutorial到本篇就算是大致翻译完了。

### Building a Many To Many Relationship / 建立多对多关系

最后来看看多对多关系，顺便稍微展示一些SQLAlchemy的其他功能。比如说我们要做一个blog应用，用户可以添加`BlogPost`项目，而每个`BlogPost`都有一些相关联的`Keyword`项目。

对于这种多对多的关系，我们需要创建一个未映射的`Table`作为关系表：

<!-- more -->

```python
>>> from sqlalchemy import Table, Text
>>> # association table
>>> post_keywords = Table('post_keywords', Base.metadata,
...     Column('post_id', ForeignKey('posts.id'), primary_key=True),
...     Column('keyword_id', ForeignKey('keywords.id'), primary_key=True)
... )
```

上面直接使用`Table`定义了一个关系表，和之前用映射类定义表的方式有些不同。其中`Column`对象的名称是用字符串显式赋予的，而不是使用类的属性名。

- - -

Note: 虽然使用集成Base的映射类表示many-to-many的关联表也是可以的，但各种文档都强烈建议不使用Declarative系统和映射类，而建议直接用`Table`的方式定义。比如[Flask-SQLAlchemy的文档](http://flask-sqlalchemy.pocoo.org/2.1/models/#many-to-many-relationships)。

- - -

接下来定义`BlogPost`和`Keyword`，使用互补的`relationship()`，每个关系均指向`post_keywords`表：

```python
>>> class BlogPost(Base):
...     __tablename__ = 'posts'
...
...     id = Column(Integer, primary_key=True)
...     user_id = Column(Integer, ForeignKey('users.id'))
...     headline = Column(String(255), nullable=False)
...     body = Column(Text)
...
...     # many to many BlogPost<->Keyword
...     keywords = relationship('Keyword',
...                             secondary=post_keywords,
...                             back_populates='posts')
...
...     def __init__(self, headline, body, author):
...         self.author = author
...         self.headline = headline
...         self.body = body
...
...     def __repr__(self):
...         return "BlogPost(%r, %r, %r)" % (self.headline, self.body, self.author)


>>> class Keyword(Base):
...     __tablename__ = 'keywords'
...
...     id = Column(Integer, primary_key=True)
...     keyword = Column(String(50), nullable=False, unique=True)
...     posts = relationship('BlogPost',
...                          secondary=post_keywords,
...                          back_populates='keywords')
...
...     def __init__(self, keyword):
...         self.keyword = keyword
```

注意，上面的类定义显式声明了`__init__()`方法。但当使用Declarative的时候，可以不显式声明`__init__()`。

上面的例子中，多对多关系是`BlogPost.keywords`。定义多对多关系的关键在于`secondary`参数，它被传入了一个代表关联表的`Table`对象。关联表只包含代表关系两侧引用的列。如果它需要有任何其他的列，比如它自己的主键，或者另外的外键，SQLAlchemy就要求使用另一种叫“关联对象（association object）”的定义模式，在[Association Object](http://docs.sqlalchemy.org/en/rel_1_0/orm/basic_relationships.html#association-pattern)中说明。

我们还希望`BlogPost`类拥有一个`author`属性，我们可以添加另一个双向关系。每个用户可以有多篇文章，但当我们访问`User.posts`的时候，我们并不希望一下加载他的所有的文章集合。我们可以用`relationship()`的一个参数`lazy='dynamic'`配置这种行为。这种配置被称为属性的**加载策略（loader strategy）**：

```python
>>> BlogPost.author = relationship(User, back_populates="posts")
>>> User.posts = relationship(BlogPost, back_populates="author", lazy="dynamic")
```

- - -

Note: 上面的BlogPost类已经定义了user_id外键，约束于users.id，所以直接在BlogPost和User两个类上定义relationship，SQLAlchemy会自动识别出是从User到BlogPost的一对多关系。

- - -

现在创建新表：

```python
>>> Base.metadata.create_all(engine)
```

接下来试着使用它们，给Wendy创建一些文章：

```python
>>> wendy = session.query(User).filter_by(name='wendy').one()
>>> post = BlogPost("Wendy's Blog Post", "This is a test", wendy)
>>> session.add(post)
```

然后创建一些文章的关键词：

```python
>>> post.keywords.append(Keyword('wendy'))
>>> post.keywords.append(Keyword('firstpost'))
```

现在就可以查询所有包含"firstpost"关键词的文章了。我们用`any`操作符来寻找“任何一个关键词是'firstpost'的文章”：

```python
>>> session.query(BlogPost).filter(BlogPost.keywords.any(keyword='firstpost')).all()
>>> [BlogPost("Wendy's Blog Post", 'This is a test', <User(name='wendy', fullname='Wendy Williams', password='foobar')>)]
```

或者，我们可以用Wendy的`posts`关系来在他的文章中查询。因为`posts`关系是一个定义为`lazy=dynamic`的关系，在访问`wendy.posts`的时候，它并不会一下全部加载：

```python
>>> wendy.posts.filter(BlogPost.keywords.any(keywords='firstpost')).all()
[BlogPost("Wendy's Blog Post", 'This is a test', <User(name='wendy', fullname='Wendy Williams', password='foobar')>)]
```

### Further Reference / 参见

* Mapper参考文档：[Mapper Configuration](http://docs.sqlalchemy.org/en/rel_1_0/orm/mapper_config.html)
* Relatioinship参考文档：[Relationship Configuration](http://docs.sqlalchemy.org/en/rel_1_0/orm/relationships.html)
* Session参考文档：[Using the Session](http://docs.sqlalchemy.org/en/rel_1_0/orm/session.html)

- - -

Note: 于是[Object Relational Tutorial](http://docs.sqlalchemy.org/en/rel_1_0/orm/tutorial.html)这篇文档的中文翻译就全部结束辣 :) 接下来大概会翻译和读一下Flask-SQLAlchemy的文档？虽然网上现在有一个0.16翻译版，但版本号现在已经到了2.1，感觉会有出入。

然后重新玩玩Flask（希望比上次不知为什么熟练一点hhh）
