title: "iOS 8.1.2 + Flex 2 beta + jubeat / reflecbeat"
date: 2015-01-20 01:16:00
tags:
- daily
---
破解方法。

1. iOS升级至8.1.2
2. Cydia添加源：http://getdelta.co/
3. 上述源内安装：Flex 2 Beta(当前版本1.952)
4. Flex 2 Beta内对jubeat覆盖两个`-(BOOL) isPurchased()`函数的返回值为TRUE
5. 对reflecbeat覆盖三个`-(BOOL) isPurchased()`函数的返回值为TRUE
6. 完成咯

之前自作聪明装了个旧版本的Flex 2尝试解决版本兼容性问题……结果差点把系统干掉