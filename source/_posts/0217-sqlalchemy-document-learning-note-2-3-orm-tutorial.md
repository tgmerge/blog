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

> TBC