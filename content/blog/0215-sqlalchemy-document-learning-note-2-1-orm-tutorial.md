---
title: "SQLAlchemy文档和笔记 (2.1) - ORM指南 (1)"
date: "2016-04-27 00:51:00"
tags:
- Python
- SQLAlchemy
- 文档
- 翻译
---

本篇 ~~胡乱~~ 翻译自[SQLAlchemy 1.0官方文档 Object Relational Tutorial一章](http://docs.sqlalchemy.org/en/rel_1_0/orm/tutorial.html)。

术语各种拿不定……可以参考[SQLAlchemy术语表](http://docs.sqlalchemy.org/en/rel_1_0/glossary.html)。

- - -

## Object Relational Tutorial / 对象-关系映射指南

这一章作为文档中ORM部分的第一章，整体介绍ORM的基本概念和使用方法。倒不如说懒省事的话直接看这一章就行？

SQLAlchemy ORM提供了一种关联用户定义的Python类和数据库表、以及这些类的实例和表中的行的方法。ORM包含在对象和它们关联的数据库表行中透明地同步变更的机制，称作[unit of work](http://docs.sqlalchemy.org/en/rel_1_0/glossary.html#term-unit-of-work)。ORM还包含在用户定义的类和他们代表的数据库表之间的关系中转换查询的方法。

和SQLAlchemy Expression Language相比，ORM的抽象层级较高。然而在使用ORM的应用中，偶尔也可以通过直接使用Expression Language的方法来进行某些和数据库的直接交互操作。

### Connecting / 连接到数据库

在这里暂时使用内存中的SQLite数据库。用`create_engine()`建立连接：

<!-- more -->

```python
>>> from sqlalchemy import create_engine()
>>> engine = create_engine('sqlite:///:memory:', echo=True)
```

`echo`标志可以设置SQLAlchemy日志系统。当启用日志时，所有命令产生的SQL都会显示出来。

`create_engine()`的返回值是一个`Engine`，代表数据库的核心界面，通过方言(dialect)处理数据库和DBAPI的所有细节。在这里，SQLite方言将命令翻译给Python内建的`splite3`模块。

第一次调用`Engine.execute()`或`Engine.connect()`的时候，`Engine`将会和数据库建立一个真实的DBAPI连接来处理SQL命令。当使用ORM的时候，我们一般不直接使用创建出来的`Engine`对象，它会被ORM隐式地使用。

参见[Database Urls](http://docs.sqlalchemy.org/en/rel_1_0/core/engines.html#database-urls)：包括各种使用`create_engine()`连接到不同数据库的例子。

### Declare a Mapping / 声明映射

配置ORM的时候，首先需要做的是描述我们将要操作的数据库，然后定义一些映射到数据库表的类。使用SQLAlchemy提供的[`Declarative`](http://docs.sqlalchemy.org/en/rel_1_0/orm/extensions/declarative/index.html)系统来完成这些任务。

使用Declarative系统定义的映射类，均需要继承一个被称为`declarative base class/描述基类`的特殊类。这个类将维护所有集成了它的映射类和数据表。一般来说一个应用程序只会用到一个描述基类，使用`declarative_base()`方法创建。例如：

```python
>>> from sqlalchemy.ext.declarative import declarative_base
>>> Base = declarative_base()
```

有了这个基类之后，便可以创建描述数据库表的映射类了。例如下面的`User`类：

```python
from sqlalchemy import Column, Integer, String
class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True)
    name = Column(String)
    fullname = Column(String)
    password = Column(String)
    
    def __repr__(self):
        return "<User(name='%s', fullname='%s', password='%s')>" % (self.name, self.fullname, self.password)
```

使用Declarative系统定义的类需要`__tablename__`属性，还需要至少一个作为主键的`Column`。SQLAlchemy不对数据类型、约束等做任何假定，但你可以自行创建辅助方法和Mixin，在[Mixin and Custom Base Classes](http://docs.sqlalchemy.org/en/rel_1_0/orm/extensions/declarative/mixins.html#declarative-mixins)里描述。

我们的映射类创建完成后，Declarative系统将会把所有其中的Column对象替换为特殊的`descriptors/描述对象`。这个过程称为`instrumentation`。经过instrumentation的映射类，将会为我们提供获取和设置数据库表中值的方法。

### Create a Schema / 创建数据库模式

我们的`User`类通过Declarative系统定义之后，将被添加进用于描述表信息的`table metadata`。元数据作为一个`Table`对象，被添加进映射类的`__table__`方法：

```python
>>> User.__table__
Table('users', MetaData(bind=None), 
    Column('id', Integer(), table=<users>, primary_key=True, nullable=False),
    Column('name', String(), table=<users>),
    Column('fullname', String(), table=<users>),
    Column('password', String(), table=<users>), schema=None)
```

`Table`对象被放置在`MetaData`对象之中，当使用Declarative时可以用`Base.metadata`访问到它。`MetaData`对象是数据库模式的总表(Registry)。比如说，现在我们的SQLite数据库里没有`users`表，可以用`MetaData`提交一条`CREATE TABLE`语句，来在数据库中创建所有尚未存在的表。

下面，使用`MetaData.create_all()`方法，提供给它我们的`Engine`作为数据库连接的来源。将会看到SQLAlchemy首先检查users是否存在，然后执行了`CREATE TABLE`语句：

```python
>>> Base.metadata.create_all(engine)
SELECT ...
PRAGMA table_info("users")
()
CREATE TABLE users (
    id INTEGER NOT NULL, name VARCHAR,
    fullname VARCHAR,
    password VARCHAR,
    PRIMARY KEY (id)
)
()
COMMIT
```

如果使用某些必须指定VARCHAR列长度的数据库，可以在创建Column的时候提供长度信息：

```python
Column(String(50))
```

`Integer`, `Numeric`等等与之类似。

### Create an Instance of the Mapped Class / 创建映射类的实例

映射完成之后，就可以创建`User`的实例了：

```python
>>> ed_user = User(name='ed', fullname='Ed Jones', password='edspassword')
>>> ed_user.name
'ed'
>>> ed_user.password
'edspassword'
>>> str(ed_user.id)
'None'
```

Declarative为定义好的`User`类提供了`__init__()`方法，接受相应的关键字作为初始化参数。我们也可以显式地定义`__init__()`方法，来覆盖Declarative提供的默认初始化参数。

### Creating a Session / 创建任务

ORM和数据库的交互通过`Session`完成。当我们最初创建应用程序的时候，使用`create_engine()`的同时，我们也可以定义`Session`类，作为生成`Session`对象的工厂：

```python
>>> from sqlalchemy.orm import sessionmaker
>>> Session = sessionmaker(bind=engine)
```

如果应用在创建顶层模块的时候还没有创建`Engine`对象，可以先使用`Session = sessionmaker()`。之后，当使用`create_engine()`创建了`Engine`后，便可以使用`configure()`方法将它连接到`Session`：

```python
>>> Session.configure(bind=engine) # 当Engine准备好之后使用
```

这样，`Session`类将会生产绑定于我们的数据库的`Session`对象。其他事务控制相关的配置也可以在调用`sessionmaker`时一并配置。最后，当需要和数据库交互的时候，你可以实例化一个`Session`：

```python
>>> session = Session()
```

这个`Session`虽然和我们的`Engine`相关联，但还没有创建任何数据库连接。当它被初次使用到的时候，它会从`Engine`维护的连接池中获取一个连接，直到提交了所有更改或任务对象被关闭。

### Adding and Updating Objects / 添加和更新对象

为了持久化我们的`User`对象，可以将它`add()`到`Session`中：

```python
>>> ed_user = User(name='ed', fullname='Ed Jones', password='edspassword')
>>> session.add(ed_user)
```

现在这个对象是`pending`状态。没有任何SQL语句被执行，对象也并没有保存到数据库中。在需要的时候，`Session`将会进行`flush`操作，执行持久化Ed Jones所需的SQL语句。

下面我们创建一个`Query`对象，查询这个`User`实例。使用`name`属性的值为`ed`来过滤，并只要求获取第一个结果行。返回的将是和我们添加的相同的`User`实例：

```python
>>> our_user = session.query(User).filter_by(name='ed').first()
>>> our_user
<User(name='ed', fullname='Ed Jones', password='edspassword')>
```

事实上，`Session`对象已经识别出，这个结果行就是我们添加的那个行对象。所以我们得到的对象和添加的完全是同一个：

```python
>>> ed_user is our_user
True
```

作为ORM概念的体现，这里使用了一种叫`identity map`的东西。可以保证在同一个`Session`中，所有对同一个数据库行的操作都体现在同一个数据对象上。一旦`Session`中出现了含有主键的数据对象，所有在这个`Session`中获取这个数据库行的操作，都将返回这同一个对象。如果尝试添加另一个已经被持久化的、主键相同的对象，将会抛出异常。

可以用`add_all()`方法添加更多的`User`对象：

```python
>>> session.add_all([
...     User(name='wendy', fullname='Wendy Williams', password='foobar'),
...     User(name='mary', fullname='Mary Contrary', password='xxg527'),
...     User(name='fred', fullname='Fred Flinstone', password='blah')])
```

另外，可以修改Ed的密码：

```python
>>> ed_user.password = 'f8s7ccs'
```

`Session`将会知道已经添加到它的数据对象的变化：

```python
>>> session.dirty
IdentitySet([<User(name='ed', fullname='Ed Jones', password='f8s7ccs')])
```

而且有三个新的`User`对象正在`pending`状态：

```python
>>> session.new
IdentitySet([<User(name='wendy', fullname='Wendy Williams', password='foobar')>,
<User(name='mary', fullname='Mary Contrary', password='xxg527')>,
<User(name='fred', fullname='Fred Flinstone', password='blah')>])
```

最后，我们用`commit()`方法告诉`Session`，我们需要将所有剩余的变化写入到数据库中，并且提交整个事务。

```python
>>> session.commit()
```

`commit()`方法将会处理并清除(flush)所有剩余的变更，并提交整个事务。接下来对这个`Session`的操作将从连接池中获取新的数据库连接（需要的时候更会重新连接），而且会发生在新的事务中。

如果现在查看Ed的`id`属性（之前为`None`），会发现它已经有值了：

```python
>>> ed_user.id
1
```

当`Session`向数据库插入新的行后，这个行对应的数据对象中将会出现新生成的标识字段(identifiers，比如id)和其它数据库生成的字段默认值。上面的例子中，由于在`commit()`后新的事务重新开始，整个行在数据对象被访问的时候，从数据库中被重新获取。在新开始的事务中，对于从之前事务中带过来的数据对象，SQLAlchemy默认将会在第一次访问它们的时候从数据库更新数据，以确保数据状态是最新的。当然这种刷新的策略也可以配置，在[Using the Session](http://docs.sqlalchemy.org/en/rel_1_0/orm/session.html)一节将会讲到配置`The level of reloading`。

当`User`对象从`Session`之外被添加到`Session`中，到它被写入到数据库中，它总共经历了三种状态：`transient`, `pending`和`persistent`。可以阅读[Quickie Intro to Object States](http://docs.sqlalchemy.org/en/rel_1_0/orm/session_state_management.html#session-object-states)一节。

### Rolling Back / 回滚操作

`Session`中的任务是作为事务运行的，自然就可以回滚变更。例如将`ed_user`的用户名更改为`Edwardo`：

```python
>>> ed_user.name = 'Edwardo'
```

然后添加一个错误的用户：

```python
>>> fake_user = User(name='fakeuser', fullname='Invalid', password='12345')
>>> session.add(fake_user)
```

现在使用这个`Session`进行查询，可以发现它们已经被放进了事务中（SQL已经执行了UPDATE和INSERT INTO语句）：

```python
>>> session.query(User).filter(User.name.in_(['Edwardo', 'fakeuser'])).all()
[<User(name='Edwardo', fullname='Ed Jones', password='f8s7ccs')>, <User(name='fakeuser', fullname='Invalid', password='12345')>]
```

然后回滚。可以发现`ed_user`的名字已经回到了`ed`，`fake_user`已经不再出现在session中了：

```python
>>> session.rollback()

>>> ed_user.name
u'ed'
>>> fake_user in session
False

>>> session.query(User).filter(User.name.in_(['ed', 'fakeuser'])).all()
[<User(name='ed', fullname='Ed Jones', password='f8s7ccs')>]
```

> 这章未完。下一节，Querying / 查询