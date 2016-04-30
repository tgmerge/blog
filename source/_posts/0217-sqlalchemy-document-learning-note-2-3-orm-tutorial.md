title: "SQLAlchemy文档和笔记 (2.3) - ORM指南 (3)"
date: "2016-04-29"
tags:
- Python
- SQLAlchemy
- document
---

本篇是 ~~胡乱~~ 翻译自[SQLAlchemy 1.0官方文档 Object Relational Tutorial一章](http://docs.sqlalchemy.org/en/rel_1_0/orm/tutorial.html)的第三篇笔记。

~~抱着“反正正事不管时间多少都能干完”的态度果然可以干蛮多其他事情的……~~

各种保留了原文的术语可以参考[SQLAlchemy术语表](http://docs.sqlalchemy.org/en/rel_1_0/glossary.html)。

- - -

上一部分讲的是`Query`，以及在`Query`中可以使用的各种查询限定方法。包括分页（`offset()`和`limit()`）、筛选（`filter()`）和其中的多种操作符、获取Scalar（`all()`和`one()`等）、计数（`count()`）之类。

下面从Building a Relationship一节开始。如果在新的REPL中测试之后的python语句，需要还原之前插入的数据，可以使用这个：

<!-- more -->

```python
# 在REPL中使用下面的语句执行：
# exec(open('path/to/this_file.py').read())

import sqlalchemy
from sqlalchemy import create_engine, Column, Integer, String, func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

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

Base.metadata.create_all(engine)

Session = sessionmaker(bind=engine)
session = Session()
session.add_all([
    User(name='ed', fullname='Ed Jones', password='f8s7ccs'),
    User(name='wendy', fullname='Wendy Williams', password='foobar'),
    User(name='mary', fullname='Mary Contrary', password='xxg527'),
    User(name='fred', fullname='Fred Flinstone', password='blah')])
session.commit()
```

### Building a Relationship / 建立关系

~~要建立关系先去表白吧hhh~~

<!-- more -->

比如说，每个`User`可以保存任意数量的电子邮箱地址。我们需要一个存储电子邮箱地址的新表`addresses`，然后用一个从`users`表到`addresses`表的**一对多**关系来实现。使用declarative系统，我们可以为这个新表定义一个`Address`映射类：

```python
>>> from sqlalchemy import ForeignKey
>>> from sqlalchemy.orm import relationship

>>> class Address(Base):
...     __tablename__ = 'addresses'
...     id = Column(Integer, primary_key=True)
...     email_address = Column(String, nullable=False)
...     user_id = Column(Integer, ForeignKey('users.id'))
...
...     user = relationship("User", back_populates="addresses")
...
...     def __repr__(self):
...         return "<Address(email_address='%s')>" % self.email_address
...

>>> User.addresses = relationship("Address", order_by=Address.id, back_populates="user")
```

上面这个映射类中出现的`ForeignKey`，是`Column`中可以使用的一个描述符(directive)。它声明这个列的值应该被约束于另一列的数据值之中。这是关系数据库的核心功能之一，用于“粘结”两个数据表。上面的`ForeignKey`表示，`address.user_id`这一列的值应该被约束于`users.id`一列。

而描述符`relationship()`告诉ORM，`Address`这个类本身应该被连接到`User`类。连接使用`Address.user`这个属性。`relationship()`使用两个表中的外键关联来识别连接的类型，在这里它识别出`Address.user`应该是一个**多对一**关系。另外一边，`User`映射类里面也放置了一个`relationship()`，位于`User.addresses`属性中。在这两个`relationship()`描述符中，参数`relationship.back_populates`被设为“对面”的那个属性，这样一来`relationship()`就能知道，`Address.user`是另一边的一个`User`实例，而`User.addresses`是另一边的`Address`实例的列表。

注意：`relationship.back_populates`替代了过去版本的`relationship.backref`。`relationship.backref`参数仍然可用，但`relationship.back_populates`的名字更容易理解一点。详情可以参考[Linking Relationships with Backref](http://docs.sqlalchemy.org/en/rel_1_0/orm/backref.html#relationships-backref)。

**多对一**关系从另一边看一定是**一对多**关系。关于更多`relationship()`的配置案例，可以参看[Basic Relationship Patterns](http://docs.sqlalchemy.org/en/rel_1_0/orm/basic_relationships.html#relationship-patterns)。

`Address.user`和`User.addresses`之间相互的关系构成了SQLAlchemy ORM中的双向关系(bidirectional relationship)。[Linking Relationships with Backref](http://docs.sqlalchemy.org/en/rel_1_0/orm/backref.html#relationships-backref)一章详细解释了这种又被称为"backref"的特性。

传递给`relationship()`一些表示其他映射类的参数时，如果使用了Declarative系统，你可以用字符串把类名传递过去。所有映射结束的时候，这些字符串将被求值（evaluated）为Python表达式，产生实际的参数。在上面的例子中，实际的参数就是`User`类。所有继承了declared base的类都可以作为参数。

关于FOREIGN KEY的一点知识：FOREIGN KEY数据列将在它连结的列数据更新的时候，自动更新自己。FOREIGN KEY约束也可以将多个列连结到多个主键列，称为“复合外键”。

接下来需要在数据库中创建`addresses`表：

```python
>>> Base.metadata.create_all(engine)
```

### Working with Related Objects / 使用包含关系的对象

现在，当我们创建一个`User`对象的时候，将会包含一个空的`addresses`集合。默认来说这个集合的数据类型会是list，但也可以用[Customizing Collection Access](http://docs.sqlalchemy.org/en/rel_1_0/orm/collections.html#custom-collections)中的方式自定义为其他的集合类型，比如set和dictionary。

```python
>>> jack = User(name='jack', fullname='Jack Bean', password='gjffdd')
>>> jack.addresses
[]
```

你可以任意向`User`对象中添加`Address`对象。这里我们直接赋予其一个列表：

```python
>>> jack.addresses = [
...                 Address(email_address='jack@google.com'),
...                 Address(email_address='j25@yahoo.com')]
```

当使用双向关系的时候，在一个方向上添加的元素将立即在另一个方向上变得可见。即使当没有任何SQL执行的时候，也是如此：

```python
>>> jack.addresses[1]
<Address(email_address='j25@yahoo.com')>

>>> jack.addresses[1].user
<User(name='jack', fullname='Jack Bean', password='gjffdd')>
```

现在让我们将`Jack Bean`添加到数据库中。`jack`和它`address`中的两个`Address`成员都会一起被级联地（cascading）添加到session中：

```python
>>> session.add(jack)
>>> session.commit()
```

现在查询Jack，会发现执行的SQL只查询了Jack本身，我们也只得到了Jack本身：

```python
>>> jack = session.query(User).filter_by(name='jack').one()
>>> jack
<User(name='jack', fullname='Jack Bean', password='gjffdd')>
```

```sql
BEGIN (implicit)
SELECT users.id AS users_id,
        users.name AS users_name,
        users.fullname AS users_fullname,
        users.password AS users_password
FROM users
WHERE users.name = ?
('jack',)
```

现在来看看Jack的`addresses`属性。会发现下面的SQL立即被执行：

```python
>>> jack.addresses
[<Address(email_address='jack@google.com')>, <Address(email_address='j25@yahoo.com')>]
```

```sql
SELECT addresses.id AS addresses_id,
        addresses.email_address AS
        addresses_email_address,
        addresses.user_id AS addresses_user_id
FROM addresses
WHERE ? = addresses.user_id ORDER BY addresses.id
(5,)
```

这是一个[惰性加载/延迟加载（lazy loading）](http://docs.sqlalchemy.org/en/rel_1_0/glossary.html#term-lazy-loading)关系的例子。`addresses`集现在的行为就像普通的列表一样了。之后会讲讲如何优化这种加载方式。

### Querying with Joins / 含有表连接的查询

现在可以展示`Query`的更多功能了。要构造包含`User`和`Address`的、最简单的隐式INNER JOIN，可以直接用`Query.filter()`限定让它们相关联的列相等。比如说：

```python
>>> for u, a in session.query(User, address).\
...                     filter(User.id==Address.user_id).\
...                     filter(Address.email_address=='jack@google.com').\
...                     all():
...     print(u)
...     print(a)
<User(name='jack', fullname='Jack Bean', password='gjffdd')> <Address(email_address='jack@google.com')>
```

```sql
SELECT users.id AS users_id,
        users.name AS users_name,
        users.fullname AS users_fullname,
        users.password AS users_password,
        addresses.id AS addresses_id,
        addresses.email_address AS addresses_email_address,
        addresses.user_id AS addresses_user_id
FROM users, addresses
WHERE users.id = addresses.user_id
        AND addresses.email_address = ?
('jack@google.com',)
```

要显式地构造SQL JOIN，使用`Query.join()`比较容易：

```python
>>> session.query(User).join(Address).\
...         filter(Address.email_address=='jack@google.com').\
...         all()
[<User(name='jack', fullname='Jack Bean', password='gjffdd')>]
```

```sql
SELECT users.id AS users_id,
        users.name AS users_name,
        users.fullname AS users_fullname,
        users.password AS users_password
FROM users JOIN addresses ON users.id = addresses.user_id
WHERE addresses.email_address = ?
('jack@google.com',)
```

`Query.join()`知道如何连接`User`和`Address`，因为他们之间只有一个外键关联。如果没有外键、或有多个外键，`Query.join()`在下面几种形式下工作得更好：

```python
query.join(Address, User.id==Address.user_id)       # 显示声明条件
query.join(User.addresses)                          # 声明左侧到右侧的关系
query.join(Address, User.addresses)                 # 和上一种相同，但显式制定了连结目标
query.join('addresses')                             # 和第二种相同，使用字符串指定
```

OUTER JOIN可以用`outerjoin()`指定：

```python
query.outerjoin(User.addresses)   # LEFT OUTER JOIN
```

`join()`的参考文档会详细说明它可以接受的参数类型和其他使用方法。

**注意：**当为`Query`提供了多个参数的时候，`Query.join()`默认将首先连接最左边的那个。比如`session.query(User, Address).join(Address).all()`将执行`FROM users JOIN addresses ON users.id = addresses.user_id`。如果要改变JOIN的第一项，可以使用`Query.select_from()`方法：

```python
query = Session.query(User, Address).select_from(Address).join(User)
# 将执行 FROM addresses JOIN users ON users.id = addresses.user_id
```

#### Using Aliases / 使用别名

当在多个表中查询的时候，如果某张表需要多次在连接中使用，SQL一般需要这张表在多次出现时使用不同的别名作为区分。`Query`可以用`aliased`显式地做到这一点。下面，为了查询拥有两个特定的邮箱地址的用户，需要连接`Address`两次：

```python
>>> from sqlalchemy.orm import aliased
>>> adalias1 = aliased(Address)
>>> adalias2 = aliased(Address)
>>> for username, email1, email2 in \
...     session.query(User.name, adalias1.email_address, adalias2.email_address).\
...     join(adalias1, User.addresses).\
...     join(adalias2, User.addresses).\
...     filter(adalias1.email_address=='jack@google.com').\
...     filter(adalias2.email_address=='j25@yahoo.com'):
...     print(username, email1, email2)
jack jack@google.com j25@yahoo.com
```

#### Using Subqueries / 使用子查询

`Query`能生成可被用作子查询的语句。比如说，我们需要获取`User`和每个`User`具有`Address`的数量，最佳的SQL查询方案是按`User`的id分组获取`Address`的数量，然后将他们JOIN到`User`上。为了让没有任何邮箱地址的用户也返回一行数据，我们需要使用LEFT OUTER JOIN。SQL像这样：

```sql
SELECT users.*, adr_count.address_count FROM users LEFT OUTER JOIN
    (SELECT user_id, count(*) AS address_count
        FROM addresses GROUP BY user_id) AS adr_count
    ON users.id=adr_count.user_id
```

使用`Query`构建语句的时候，需要自内而外。首先，`Query`的`statement`属性将返回生成的SQL表达式，在这里这是`select()`结构的一个实例：

```python
>>> from sqlalchemy.sql import func
>>> stmt = session.query(Address.user_id, func.count('*').label('address_count')).\
...         group_by(Address.user_id).subquery()
```

`func`将生成SQL函数，而`Query`的`subquery()`方法将生成一个SQL表达式结构，代表整个SELECT语句，并包含在一个别名（alias）中。实际上，`subquery()`是`query.statement.alias()`的简便写法。

- - -

Note: 上面这个说法其实蛮乱的……看看这个执行结果可能比较容易理解。`Query`的`statement`属性返回了代表这个SQL结构的对象，在这里是`AnnotatedSelect`，其实是SQLAlchemy内部用于表示一个SELECT的对象。再调用`alias()`即为它创建了一个别名（和上面`aliased()`创建的`AliasedClass`不同）：

```python
>>> session.query(Address.user_id, func.count('*').label('address_count')).group_by(Address.user_id).statement
<sqlalchemy.sql.annotation.AnnotatedSelect at 0x1e532da5668; AnnotatedSelect object>

>>> session.query(Address.user_id, func.count('*').label('address_count')).group_by(Address.user_id).statement.alias()
<sqlalchemy.sql.selectable.Alias at 0x1e532da5860; %(2083912308832 anon)s>
```

- - -

好现在我们有了一个SQL语句对象（上面的`stmt`）。它现在的行为和`Table`就是一样的了。你可以认为，它代表了它查询后的结果。这个语句对象的表列（columns）可以用名为`c`的属性获取（卧槽啥鬼？）：

```python
>>> for u, count in session.query(User, stmt.c.address_count).\
...     outerjoin(stmt, User.id==stmt.c.user_id).order_by(User.id):
...     print(u, count)
<User(name='ed', fullname='Ed Jones', password='f8s7ccs')> None
<User(name='wendy', fullname='Wendy Williams', password='foobar')> None
<User(name='mary', fullname='Mary Contrary', password='xxg527')> None
<User(name='fred', fullname='Fred Flinstone', password='blah')> None
<User(name='jack', fullname='Jack Bean', password='gjffdd')> 2
```

```sql
SELECT users.id AS users_id,
        users.name AS users_name,
        users.fullname AS users_fullname,
        users.password AS users_password,
        anon_1.address_count AS anon_1_address_count
FROM users LEFT OUTER JOIN
    (SELECT addresses.user_id AS user_id, count(?) AS address_count
    FROM addresses GROUP BY addresses.user_id) AS anon_1
    ON users.id = anon_1.user_id
ORDER BY users.id
('*',)
```

- - -

Note: 上面这个概念也是有点乱orz 意思大概是，子查询（作为其查询结果）可以用做像是`User`一样的表，直接参与其他查询。其中的表列要用一个`c`属性访问，和当时定义的一样。在上面，`stmt.c`中包含`stmt.c.user_id`和`stmt.c.address_count`两个子属性，其实就是子查询完成后的表列名称。

- - -

#### Selecting Entities from Subqueries / 从子查询中选择数据对象

在上面的例子中，我们只是从子查询中选择了包含一个列（address_count）的结果。如果需要把子查询和数据对象实体对应起来呢？我们可以使用`aliased()`来关联一个有了别名的映射类和子查询：

```python
>>> stmt = session.query(Address).filter(Address.email_address != 'j25@yahoo.com').subquery()
>>> adalias = aliased(Address, stmt)
>>> for user, address in session.query(User, adalias).join(adalias, User.addresses):
...     print(user)
...     print(address)
<User(name='jack', fullname='Jack Bean', password='gjffdd')>
<Address(email_address='jack@google.com')>
```

- - -

Note: 上面这种实际上就是给了子查询的结果一个对应的类的别名，区别于上上面那个“把子查询作为一个新的类似于映射类的Table”的方式。上面这种方式的、现有映射类的别名具有现有映射类的所有属性。

另外，用这种方式创建子查询的类别名的时候，最好在子查询的`Query()`中直接选择整个类，即类似`Query(User)`的形式，而不是某个属性（如`Query(User.id)`），否则会自动生成隐式的JOIN，蛮奇怪的（。

- - -

#### Using EXISTS / 使用EXISTS

SQL中的EXISTS是一个判断某个查询表达式是否包含数据行的布尔操作符。在SQLAlchemy中可以这样表示：

```python
>>> from sqlalchemy.sql import exists
>>> stmt = exists().where(Address.user_id==User.id)
>>> for name, in session.query(User.name).filter(stmt):
...     print(name)
jack
```

或者也可以写成

```python
>>> for name, in session.query(User.name).filter(exists().where(Address.user_id==User.id)):
...     print(name)
jack
```

`Query`有几个操作符会自动生成EXISTS。上面的这个语句可以在`User.addresses`关系上用`any()`改写成：

```python
>>> for name, in session.query(User.name).filter(User.addresses.any()):
...     print(name)
jack
```

`any()`也可以加入限制条件：

```python
>>> for name, in session.query(User.name).filter(User.addresses.any(Address.email_address.like('%google%'))):
...     print(name)
jack
```

`has()`是和`any()`类似的操作符，但用于多对一关系（注意`~`操作符，意为“非”）：

```python
>>> session.query(Address).filter(~Address.user.has(User.name=='jack')).all()
[]
```

#### Common Relationship Operators / 常用关系操作符

这些操作符用在关系操作上：

* `__eq__()`（多对一关系的“相等”比较）：

    ```python
    query.filter(Address.user == someuser)
    ```

* `__ne__()`（多对一关系的“不等”比较）：

    ```python
    query.filter(Address.user != someuser)
    ```

* IS NULL（多对一关系的比较，也用`__eq()__`实现）：

    ```python
    query.filter(Address.user == None)
    ```

* `contains()`（用于一对多关系中的集合）：

    ```python
    query.filter(User.addresses.contains(someaddress))
    ```

* `any()`（用于集合）：

    ```python
    query.filter(User.addresses.any(Address.email_address == 'bar'))
    
    # 也通过命名参数接受比较条件：
    query.filter(User.addresses.any(email_address='bar'))
    ```

* `has()`（用于“一”那一侧的引用）：

    ```python
    query.filter(Address.user.has(name='ed'))
    ```

* `Query.with_parent()`（用于任意关系，查询关系的另一头是否是某个对象）：

    ```python
    session.query(Address).with_parent(someuser, 'addresses')
    ```

    Note: `with_parent()`实际上就是查询“关系另一头是某个对象的”这一头的对象。第二个参数用于标明另一头（第一个参数的类型那一头，上面的例子第一个参数是`User`）和要查询的对象相关联的集合是什么。当这两个映射类只有唯一一个关系的时候，第二个参数是可以省略的。

- - -

> ORM指南未完。下一节：Eager Loading

