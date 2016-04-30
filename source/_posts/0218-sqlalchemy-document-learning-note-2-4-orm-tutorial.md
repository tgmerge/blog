title: "SQLAlchemy文档和笔记 (2.4) - ORM指南 (4)"
date: "2016-04-30 16:55"
tags:
- Python
- SQLAlchemy
- 文档
- 翻译
---

本篇是 ~~胡乱~~ 翻译自[SQLAlchemy 1.0官方文档 Object Relational Tutorial一章](http://docs.sqlalchemy.org/en/rel_1_0/orm/tutorial.html)的第四篇笔记。

各种保留了原文的术语可以参考[SQLAlchemy术语表](http://docs.sqlalchemy.org/en/rel_1_0/glossary.html)。

~~摸鱼根本停不下来~~

- - -

上一部分讲的是关系的建立和使用关系进行查询。在映射类中使用`relationship()`建立关系，查询时使用`Query.join()`进行连接查询，用`aliased()`创建映射类的别名在连接中多次使用同一张表，使用`func.count()`和`statement`进行子查询计数之类的等等。

接着从Eager Loading一节开始。要在REPL中还原之前的数据，可以：

<!-- more -->

```python
# In REPL: run this file with
# exec(open('path/to/this.py').read())

import sqlalchemy
from sqlalchemy import create_engine, Column, Integer, String, func, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship

engine = create_engine('sqlite:///:memory:', echo=True)
Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    name = Column(String)
    fullname = Column(String)
    password = Column(String)
    def __repr__(self):
       return "<User(name='%s', fullname='%s', password='%s')>" % (self.name, self.fullname, self.password)

class Address(Base):
    __tablename__ = 'addresses'
    id = Column(Integer, primary_key=True)
    email_address = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'))
    user = relationship("User", back_populates="addresses")
    def __repr__(self):
        return "<Address(email_address='%s')>" % self.email_address

User.addresses = relationship('Address', order_by=Address.id, back_populates='user')

Base.metadata.create_all(engine)

Session = sessionmaker(bind=engine)
session = Session()
session.add_all([
    User(name='ed', fullname='Ed Jones', password='f8s7ccs'),
    User(name='wendy', fullname='Wendy Williams', password='foobar'),
    User(name='mary', fullname='Mary Contrary', password='xxg527'),
    User(name='fred', fullname='Fred Flinstone', password='blah')])
jack = User(name='jack', fullname='Jack Bean', password='gjffdd')
jack.addresses = [
    Address(email_address='jack@google.com'),
    Address(email_address='j25@yahoo.com')]
session.add(jack)
session.commit()
```

- - -

### Eager Loading / 尽早加载/贪婪加载

记得之前我们使用过**惰性加载**的例子吧：当访问`User.addresses`的时候，立即执行了一条SQL语句。而很多时候需要减少SQL查询的次数，这就需要使用**贪婪加载**机制了。SQLAlchemy提供了三种贪婪加载方式，其中两种是自动执行的，另一种由自定义的条件触发。这三种方式都由写在`Query.options()`方法中的配置来调用。`Query.options()`提供给`Query`一些额外信息，主要是我们希望一些属性被如何从数据库加载进来。

#### Subquery Load / 子查询加载

如果希望在加载一系列对象的同时，让这些对象相关联的其他对象集合也被加载，最好使用`orm.subqueryload()`配置。它将在载入结果对象之后立即执行另一条SELECT语句，完整地载入和结果对象相关联的对象集合。这种配置的名字"subquery"来源于，它将在SELECT关联对象（第二条SQL）的时候将第一条SQL作为子查询嵌入进去。

```python
>>> from sqlalchemy.orm import subqueryload
>>> jack = session.query(User).options(subqueryload(User.addresses)).filter_by(name='jack').one()
>>> jack
<User(name='jack', fullname='Jack Bean', password='gjffdd')>

>>> jack.addresses
[<Address(email_address='jack@google.com')>, <Address(email_address='j25@yahoo.com')>]
```

注意：当使用`Query.first()`、`Query.limit()`、`Query.offset()`的时候，应该和`Query.order_by()`连用，保证结果顺序的一致性。

#### Joined Load / 连接加载

另一种自动加载的方法更常见一些，称为`orm.joinedload()`。这种方法会执行一条JOIN（默认是LEFT OUTER JOIN），让主要的结果对象和他们的关联对象在一步查询内全部返回。下面将用这种方法执行和上面的例子一样的操作：

```python
>>> from sqlalchemy.orm import joinedload

>>> jack = session.query(User).options(joinedload(User.addresses)).filter_by(name='jack').one()
>>> jack
<User(name='jack', fullname='Jack Bean', password='gjffdd')>

>>> jack.addresses
[<Address(email_address='jack@google.com')>, <Address(email_address='j25@yahoo.com')>]
```

即便LEFT OUTER JOIN返回了多余的jack行（由于jack有两个邮箱地址），结果中我们仍然只得到了一个jack。`Query`在这种情况下会使用"uniquing"策略排除相同的对象，让尽早加载的查询结果不会影响到主查询。

和`joinedload()`相比，`subqueryload()`出现得比较晚。`subqueryload()`更适合于加载“某些对象相关联的对象集合”即一对多关系；而`joinedload()`更适合加载多对一关系，毕竟只有在多对一中LEFT OUTER JOIN不会在左侧出现重复的行。

另外，`joinedload()`的结果中多出来的表列对你来说是“匿名的”，你不能在查询的其他部分使用到这些列做任何操作，所以不能用它替代`join()`。[The Zen of Eager Loading](http://docs.sqlalchemy.org/en/rel_1_0/orm/loading_relationships.html#zen-of-eager-loading)详细描述了其中的原理。

#### Explicit Join + Eagerload / 显式JOIN+尽早加载

第三种尽早加载的方式是，显式创建一个JOIN来获取主要查询的对象，并连结另外的表到主要查询的对象上，来将他们一并载入。使用这种方式需要用到`orm.contains_eager()`。这种方式适用于尽早加载需要对“一”的那一边过滤的多对一关系。

- - -

Note: 这个蛋疼的说法……就是说，现在有一个多对一关系（比如Address-User），我们需要获取某个/某些User的Address（即主要查询对象是Address），于是需要用name之类的条件来过滤关系的“一”也就是User那一边。

但是同时我们在获取这些Address之后，如果要访问它们的User，又要进行一次SQL查询。contains_eager可以用一个INNER JOIN来把过滤得到的User直接加载进来，省掉了一次查询。

下面的例子，就是我们要获取jack的所有Address，同时加载jack对象本身。之后在访问两个结果中的任意一个Address的user（也就是jack）的时候，就不用再查询一次jack了。

- - -

```python
>>> from sqlalchemy.orm import contains_eager
>>> jacks_addresses = session.query(Address).\
...                     join(Address.user).filter(User.name=='jack').\
...                     options(contains_eager(Address.user)).all()
>>> jacks_addresses
[<Address(email_address='jack@google.com')>, <Address(email_address='j25@yahoo.com')>]

>>> jacks_addresses[0].user
<User(name='jack', fullname='Jack Bean', password='gjffdd')>
```

更多关于尽早加载的细节可以参看[Relationship Loading Techniques](http://docs.sqlalchemy.org/en/rel_1_0/orm/loading_relationships.html)。

### Deleting / 删除

现在来试试删除`jack`。在session中添加一个删除操作，然后查询一下：

```python
>>> session.delete(jack)
>>> session.query(User).filter_by(name='jack').count()
0
```

```sql
UPDATE addresses SET user_id=? WHERE addresses.id = ?
((None, 1), (None, 2))
DELETE FROM users WHERE users.id = ?
(5,)
SELECT count(*) AS count_1
FROM (SELECT users.id AS users_id,
        users.name AS users_name,
        users.fullname AS users_fullname,
        users.password AS users_password
FROM users
WHERE users.name = ?) AS anon_1
('jack',)
```

但Jack的`Address`对象仍然存在：

```python
>>> session.query(Address).filter(Address.email_address.in_(['jack@google.com', 'j25@yahoo.com'])).count()
2
```

这看上去不太巧妙？实际上这几个地址的`user_id`已经被设置为NULL了，但数据行本身没有被删除掉。SQLAlchemy默认不会进行级联删除操作，除非你明确指定。

#### Configuring delete/delete-orphan Cascade / 删除或级联删除孤立对象

我们需要配置`User.addresses`的**级联/cascade**属性来改变上面提到的这种行为。我们现在需要完全解除映射并重新开始，也就是关闭`Session`然后使用一个新的`declarative_base()`：

Note: SQLalchemy允许你在任何时候给映射类添加新的属性和关系，但更改似乎不行。

```python
>>> session.close()
ROLLBACK
>>> Base = declarative_base()
```

现在定义`User`映射类，添加含有级联配置项的`addresses`关系：

```python
>>> class User(Base):
...     __tablename__ = 'users'
...     
...     id = Column(Integer, primary_key=True)
...     name = Column(String)
...     fullname = Column(String)
...     password = Column(String)
...
...     addresses = relationship("Address", back_populates='user',
...                     cascade="all, delete, delete-orphan")
...     def __repr__(self):
...         return "<User(name='%s', fullname='%s', password='%s')>" % (
...                                 self.name, self.fullname, self.password)
```

然后重新创建`Address`，和以前完全一样：

```python
>>> class Address(Base):
...     __tablename__ = 'addresses'
...     id = Column(Integer, primary_key=True)
...     email_address = Column(String, nullable=False)
...     user_id = Column(Integer, ForeignKey('users.id'))
...     user = relationship("User", back_populates="addresses")
...
...     def __repr__(self):
...         return "<Address(email_address='%s')>" % self.email_address
```

现在载入`jack`（下面使用`get()`方法，直接用主键载入对象），从它的`addresses`中删除一个邮箱地址，这将导致`Address`被直接删除：

```python
>>> jack = session.query(User).get(5)

>>> del jack.addresses[1]

>>> session.query(Address).filter(Address.email_address.in_(['jack@google.com', 'j25@yahoo.com'])).count()
1
```

其中第二步导致第三步的开头执行了下面的SQL：

```sql
DELETE FROM addresses WHERE addresses.id = ?
(2,)
```

然后，删除Jack的话，将会一并删除Jack和他剩下的`Address`：

```python
>>> session.delete(jack)
>>> session.query(User).filter_by(name='jack').count()
0
>>> session.query(Address).filter(Address.email_address.in_(['jack@google.com', 'j25@yahoo.com'])).count()
0
```

在[Cascades](http://docs.sqlalchemy.org/en/rel_1_0/orm/cascades.html#unitofwork-cascades)中将详细解释关于级联的细节。级联操作也可以用关系数据库的`ON DELETE CASCADE`功能实现，参看[Using Passive Deletes](http://docs.sqlalchemy.org/en/rel_1_0/orm/collections.html#passive-deletes)

- - -

> 就快完啦233 下一节：Building a Many To Many Relationship
