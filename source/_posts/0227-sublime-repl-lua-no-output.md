title: "SublimeREPL 中，Lua 脚本缺少输出的问题"
date: "2017-03-31 20:39"
tags:
- SublimeText
- Lua
---

SublimeText 非常有名的插件 [SublimeREPL](https://packagecontrol.io/packages/SublimeREPL) 在运行 Lua 脚本的时候，可能会出现`io.read()`之前的输出不在 REPL 标签页中显示的问题。比如，用 SublimeREPL 结合 [Load file to REPL](https://packagecontrol.io/packages/Load%20file%20to%20REPL) 插件，运行这样的脚本（Command: `SublimeREPL - Load current file`）：

```lua
print("Hello, Lua")
a = io.read("*n")
print(a)
```

那么 `Hello, Lua` 并不会一开始就显示出来，而是在输入字符并按 <kbd>Enter</kbd> 之后才会和 `print(a)` 的输出一同显示在 REPL 中。

这是因为 Lua 使用了输出缓冲区，阻碍了 REPL 的 `subprocess()` 读取最新的输出。解决方法是，在 REPL 运行文件之前先执行一下 `io.output():setvbuf('no')`，禁用输出缓冲区。

如果用 Load file to REPL 插件的话，在它的配置文件（Command: `Preferences: LoadFileToRepl Settings`）中，将 Lua 的运行命令修改成这样

```js
... ...
    , "python_load_command"       : "exec(open(\"%s\").read())"
    , "lua_load_command"          : "io.output():setvbuf('no');dofile(\"%s\")"
    , "powershell_load_command"   : ". %s"
... ...
```

就可以了。
