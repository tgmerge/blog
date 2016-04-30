title: "SQLAlchemy文档和笔记 (2.2) - ORM指南 (2)"
date: "2016-04-28 02:00:00"
tags:
- Python
- SQLAlchemy
- 文档
- 翻译
---

本篇 ~~胡乱~~ 翻译自[SQLAlchemy 1.0官方文档 Object Relational Tutorial一章](http://docs.sqlalchemy.org/en/rel_1_0/orm/tutorial.html)。

各种保留了原文的术语可以参考[SQLAlchemy术语表](http://docs.sqlalchemy.org/en/rel_1_0/glossary.html)。

- - -

这章的上一部分讲的基本是`Engine`，`Declarative Base`，`Mapping Class`和`Mapping Class`的实例，以及`Session`。

下面的部分从Querying一节开始。

### Querying / 查询

使用`Session`对象的`query()`方法，就可以创建一个`Query`对象。`query()`方法接受多种不同的参数，可以是类、或描述对象（class-instrumented descriptors）的任意组合。

下面使用`Query`来读取`User`实例。在迭代环境中运行的时候，将会返回一个包含`User`对象的结果列表：

<!-- more -->

```python
>>> for instance in session.query(User).order_by(User.id):
...     print(instance.name, instance.fullname)
ed Ed Jones
wendy Wendy Williams
mary Mary Contrary
fred Fred Flinstone
```

`Query`也接受ORM-instrumented descriptors（经过instrument过程的映射类中，对应表列的属性。如`User.name`）作为参数。如果多个类或表列作为`query()`的参数，返回的结果将包含在对应的元组中：

```python
>>> for name, fullname in session.query(User.name, User.fullname):
...     print(name, fullname)
wendy Wendy Williams
mary Mary Contrary
fred Fred Flinstone
```

`Query`返回的是命名元组(named tuples)，由`KeyedTuple`类提供。其各个列属性可以用属性名访问，整个数据类则可以用类名访问：

```python
>>> for row in session.query(User, User.name).all():
...     print(row.User, row.name)
<User(name='ed', fullname='Ed Jones', password='f8s7ccs')> ed
<User(name='wendy', fullname='Wendy Williams', password='foobar')> wendy
<User(name='mary', fullname='Mary Contrary', password='xxg527')> mary
<User(name='fred', fullname='Fred Flinstone', password='blah')> fred
```

你可以用`label()`方法控制某个表列的访问名，在任何`ColumnElement`上调用即可。注意，这样一来原先映射的名称就会无效（如下面的例子，只能用`row.name_label`访问结果的name列了）：

```python
>>> for row in session.query(User.name.label('name_label')).all():
...     print(row.name_label)
ed
wendy
mary
fred
```

可以用`aliased()`控制赋予整个映射对象的别名：

```python
>>> from sqlalchemy.orm import aliased
>>> user_alias = aliased(User, name='user_alias')
>>> for row in session.query(user_alias, user_alias.name).all():
...     print(row.user_alias)
<User(name='ed', fullname='Ed Jones', password='f8s7ccs')>
<User(name='wendy', fullname='Wendy Williams', password='foobar')>
<User(name='mary', fullname='Mary Contrary', password='xxg527')>
<User(name='fred', fullname='Fred Flinstone', password='blah')>
```

别名在这种时候非常有用：

```python
>>> my_alias = aliased(MyClass)
>>> session.query(MyClass, my_alias).filter(MyClass.id > my_alias.id)
```

`Query`中可以进行一些基本操作，比如LIMIT和OFFSET，最简单的用法是使用Python的数组切片表示。一般来说会和ORDER BY一起使用：

```python
>>> from u in session.query(User).order_by(User.id)[1:3]:
>>>     print(u)
<User(name='wendy', fullname='Wendy Williams', password='foobar')>
<User(name='mary', fullname='Mary Contrary', password='xxg527')>
```

也可以使用`offset()`和`limit()`进行分页。例如：

```python
from u in session.query(User).order_by(User.id).offset(10).limit(5):
    print(u)
```

基本操作还有`filter()`，它使用更多灵活的SQL expression language结构，你可以在映射类的属性上使用常见的Python操作符进行过滤：

```python
>>> for name, in session.query(User.name).filter(User.fullname=='Ed Jones'):
...     print(name)
ed
```

`Query`对象是完全 generative/构造型 的，也就是说，大多数`Query`上的方法调用将返回一个添加了更多规则的新`Query`对象。比如说你可以添加两次`filter()`来进行过滤：

```python
>>> for user in session.query(User).filter(User.name=='ed').filter(User.fullname=='Ed Jones'):
...     print(user)
<User(name='ed', fullname='Ed Jones', password='f8s7ccs')>
```

#### Common Filter Operators / 常用的过滤操作符

`filter()`中常用的操作符如下：

* `equals`:

    ```py
    query.filter(User.name == 'ed')
    ```

* `not equals`:

    ```py
    query.filter(User.name != 'ed')
    ```

* `LIKE`:

    ```py
    query.filter(User.name.like('%ed%'))
    ```

* `IN` ← 由于和in关键字冲突所以叫`in_()`:

    ```py
    query.filter(User.name.in_(['ed', 'wendy', 'jack']))
    
    # 可以结合Query对象嵌套使用:
    query.filter(Users.name.in_(
        session.query(User.name).filter(User.name.like('%ed'))
    ))
    ```

* `NOT IN`:

    ```py
    query.filter(~User.name.in_(['ed', 'wendy', 'jack']))
    ```

* `IS NULL`:

    ```py
    query.filter(User.name == None)
    
    # 如果代码规范检查器(pep8, etc)不接受上面的形式，可以采用这种:
    query.filter(User.name.is_(None))
    ```

* `IS NOT NULL`:

    ```py
    query.filter(User.name != None)
    
    # 类似地，为了适应pep8:
    query.filter(User.name.isnot(None))
    ```

* `AND`

    ```py
    # 1. 可以使用and_()
    from sqlalchemy import and_
    query.filter(and_(User.name == 'ed', User.fullname == 'Ed Jones'))
    
    # 2. 可以给filter()发送多个表达式
    query.filter(User.name == 'ed', User.fullname == 'Ed Jones')
    
    # 3. 也可以链式连接多个filter()或filter_by()
    query.filter(User.name == 'ed').filter(User.fullname == 'Ed Jones')
    ```

    **注意：使用`and_()`，不要错误地使用了Python的`and`操作符！**也就是说第一种写法基本就是废的

* `OR`:

    ```py
    from sqlalchemy import or_
    query.filter(or_(User.name == 'ed', User.name == 'wendy'))
    ```

    **注意：使用`or_()`，不要使用Python的`or`操作符！**

* `MATCH`:

    ```py
    query.filter(User.name.match('wendy'))
    ```

    **注意：`match`使用特定于数据库系统的`MATCH`或者`CONTAINS`函数，行为在不同数据库上可能会有所不同。SQLite等不支持`match`。**

#### Returning Lists and Scalars / 返回列表或标志数据(Scalar?)

**关于Scalar**：

> It means a single value as opposed to a set of values. It often means a constant, such as a string or a number. It can also refer to a variable, and I believe a column. [Source](https://social.msdn.microsoft.com/Forums/sqlserver/en-US/1e011a1a-d5d0-42a1-88d5-f43709be7172/scalar-value?forum=sqlgetstarted)

Scalar来源于数学中的[标量](https://www.wikiwand.com/en/Scalar_(mathematics))。作为“单一的数据”，与“多个数据”相对。相对于一个查询返回的多个row，单个的row即为Scalar；相对于一个row的多个列，单个列即为Scalar，大概这样。

在`Query`上调用一些方法的时候，将导致SQL被立即执行并返回结果。下面是它们的简要介绍：

* `all()`将返回一个list：

    ```py
    >>> query = session.query(User).filter(User.name.like('%ed')).order_by(User.id)
    >>> query.all()
    [<User(name='ed', fullname='Ed Jones', password='f8s7ccs')>,
      <User(name='fred', fullname='Fred Flinstone', password='blah')>]
    ```

* `first()`将设置一个值为1的limit，然后返回第一个结果行作为scalar：

    ```py
    >>> query.first()
    <User(name='ed', fullname='Ed Jones', password='f8s7ccs')>
    ```

* `one()`将获取所有结果行。但若并非有且仅有一个结果，或者结果中出现了复合行(composite row)，将会抛出异常。当结果是多行时：

    ```py
    >>> user = query.one()
    Traceback (most recent call last):
    ...
    MultipleResultsFound: Multiple rows were found for one()
    ```

    当结果为空时：

    ```py
    >>> user = query.filter(User.id == 99).one()
    Traceback (most recent call last):
    ...
    NoResultFound: No row was found for one()
    ```

* `one_or_none()`和`one()`类似，但当结果为空时并不抛出异常，只是返回`None`。结果含有多行时仍然会抛出异常。

* `scalar()`将会调用`one()`方法，然后返回结果的第一个元素作为Scalar：

    ```py
    >>> query = session.query(User.id).filter(User.name == 'ed').\
    ...    order_by(User.id)
    >>> query.scalar()
    1
    ```

    `scalar()`和`one()`是有区别的。比如：
    
    ```py
    >>> query = session.query(User.name, User.id).filter(User.name == 'ed')
    >>> query.one()
    ('ed', 1)
    >>> query.scalar()
    'ed'
    ```

#### Using Textual SQL / 直接使用SQL语句

在`Query`中，可以使用`text()`方法声明需要直接使用在SQL中的字符串。多数的方法都支持`text()`的这种用法。比如说，`filter()`和`order_by()`：

```python
>>> from sqlalchemy import text
>>> for user in session.query(User).filter(text("id<224")).order_by(text("id")).all():
...     print(user.name)
ed
wendy
mary
fred
```

你可以在这些SQL字符串中使用冒号标明SQL参数（bind parameters），使用`params()`方法来给它们赋值：

```python
>>> session.query(User).finter(text("id<:value and name=:name")).\
...     params(value=224, name='fred').order_by(User.id).one()
<User(name='fred', fullname='Fred Flinstone', password='blah')>
```

如果要直接执行SQL字符串，可以使用`from_statement()`方法。你需要自行保证你的SQL语句返回的表列名在映射类中出现过。比如：

```python
>>> session.query(User).from_statement(
...                     text("SELECT * from users where name=:name")).\
...                     params(name='ed').all()
[<User(name='ed', fullname='Ed Jones', password='f8s7ccs')>]
```

#### Counting / 计数

`Query`提供了叫做`count()`的方法，用于计数：

```python
>>> session.query(User).filter(User.name.like('%ed')).count()
2
```

`count()`方法用来获取SQL语句执行后得到的结果行数。它生成的SQL语句中，将用子查询加上一个`count`函数的方法来获取行数。

如果你要特别指定“需要被计数的东西”，可以用`func.count()`直接指定一个“count”聚类函数。（……等等这个`func`是啥）下面来获取各个用户名出现的次数：

```python
>>> from sqlalchemy import func
>>> session.query(func.count(User.name), User.name).group_by(User.name).all()
[(1, u'ed'), (1, u'fred'), (1, u'mary'), (1, u'wendy')]
```

注意：`Query.count`将会无条件地使用子查询加上`count`来获取计数。如果必须不使用子查询，你可以用`func.count()`。比如说，如果要产生`SELECT count(*) FROM table`，可以：

```python
>>> session.query(func.count('*')).select_from(User).scalar()
4
```

如果在`count`中声明使用`User`的主键，`select_from()`也可以省略：

```python
>>> session.query(func.count(User.id)).scalar()
4
```

- - -

> ORM指南未完。下一节：Builing a Relationship

