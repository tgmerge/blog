title: "Windows, python, cmd, encoding, _(:3 / L)_"
date: 2014-12-02 22:42:00
tags:
- daily
---
就不说windows和python编码的那一大坨问题了，只大概记一下怎么科学地鸟枪法码代码。

* `sys.getfilesystemencoding()`可以得到系统内用于文件系统的编码，在windows上很大可能是`mbcs`这个蛋疼的东西。
* `sys.stdout.encoding`是用于subprocess等标准输出的编码，根据运行环境不同可能是`utf-8`，`gb2312`或者其他啥的。

以上两个东西在用到`subprocess`调用其它可执行文件或命令行的时候尤其蛋疼。实在没办法，把出问题的文件放到浅一点的目录里，在repl里面`subprocess.check_output()`试试。

总之不管什么东西，只要一进来就确保`decode()`成unicode，能`type(str) => unicode`就好。输出的话，再`encode`出去。

`subprocess`出问题的时候，从没有问题的路径调用想要调用的程序，试着让它输出有问题的路径。

然后用`chardet`这个模块检测一下输出结果的编码。用法是`chatdet.detect(myStr)`。输入的编码应该和这个相同。

最后把`subprocess`的每个参数都`encode()`成这个编码吧。**别忘了文件路径两边的双引号。**

唔python的subprocess编码支持其实有问题……233
