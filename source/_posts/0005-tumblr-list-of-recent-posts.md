title: tumblr里的最近文章列表
date: "2013-06-05"
tags:
- tumblr
---
tumblr是有多喜欢dashboard……很不喜欢在侧边栏显示个关注列表搞得跟SNS一样，结果发现居然没有最近文章列表这个widget，只能改主题吗……

比较简单的实现是抓RSS配合jQuery撸一个列表出来。先把jQuery塞进主题

```javascript
    <script type="text/javascript" 
        src="http://www.google.com/jsapi"></script>

    <script type="text/javascript">
      google.load("jquery", "1.3");
      google.setOnLoadCallback(function() {
        jQuery(function($) {
          // do some stuff here, eg load your tweets, ...
        });
      });
    </script>
```

然后在setOnLoadCallback()添加

```javascript
    $(function() {
        var url = '/rss';
        var $list = $('#recent-posts');
        $.ajax({
            url: url,
            type: 'GET',
            dataType: 'xml',
            success: function(data) {                
                var $items = $(data).find('item');
                $items.each( function() {
                    var $item = $(this);
                    var link = $item.children('link').text();
                    var title = $item.children('title').text();
                    if (link && title) {
                        $list.append($('<li><a href="' + link + '">' + title + '</a></li>'));
                    }
                });
            }
        });
    });
```

最后随便在哪里添加上

```javascript
    <ul id=”recent-posts”></ul>
```

资料：

[Alicia Liu | Blog](http://blog.alicialiu.net/post/28774045588/how-to-add-list-of-recent-posts-to-tumblr)  
[Late Nite](http://latenite.tumblr.com/post/523511693/use-jquery-in-your-tumblr-theme)