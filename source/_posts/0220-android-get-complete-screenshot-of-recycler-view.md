title: "Android: 获取RecyclerView的完整截图"
date: "2016-10-23 14:53"
tags:
- Android
- Java
---

写 Android 应用的时候，偶尔会遇到“需要对某个 view 截图”的问题。对一个单独的简单 view ，常见的实现方法有以下两种：

1.  使用`view.getDrawingCache()`方法。如：

    ```java
    TextView textView = findViewById(R.id.some_activity_some_article_text);
    textView.setDrawingCacheEnabled(true);
    Bitmap drawingCache = textView.getDrawingCache();
    ```

    所得到的`drawingCache`即为`textView`显示在屏幕上的图像。这种方法比较简单，但对于比较高的 view ，经常会由于 drawing cache 不够大而出现 [View too large to fit into drawing cache](http://stackoverflow.com/questions/16500379/view-too-large-to-fit-into-drawing-cache-when-calling-getdrawingcache) 的问题。

2.  使用``view.draw(canvas)``方法。如：

    ```java
    TextView textView = findViewById(R.id.some_activity_some_article_text);
    Bitmap viewBitmap = Bitmap.createBitmap(textView.getMeasuredWidth(), textView.getMeasuredHeight(), Bitmap.Config.RGBA_8888);
    Canvas canvas = new Canvas(viewBitmap);
    textView.draw(canvas);
    ```

    这之后`viewBitmap`这个 Bitmap 即为`textView`的图像。这对普通的 view 基本已经够用了，除非 view 的高度太大，可能还是会内存不足。

然而实际需求中，这种截图常常用于“分享”之类的功能，需要截图的部分一般都是比较复杂的 ViewGroup 。而其中 RecyclerView 的截图尤其麻烦，由于它回收复用 view 和 ViewHolder 的特性，难以用普通的方法截到完整的图片。

<!-- more -->

StackOverflow 上有人给出了一个[对 RecyclerView 截图的方案](http://stackoverflow.com/a/30124162/2996355)：

```java
public static Bitmap getRecyclerViewScreenshot(RecyclerView view) {
        int size = view.getAdapter().getItemCount();
        RecyclerView.ViewHolder holder = view.getAdapter().createViewHolder(view, 0);
        view.getAdapter().onBindViewHolder(holder, 0);
        holder.itemView.measure(View.MeasureSpec.makeMeasureSpec(view.getWidth(), View.MeasureSpec.EXACTLY),
                View.MeasureSpec.makeMeasureSpec(0, View.MeasureSpec.UNSPECIFIED));
        holder.itemView.layout(0, 0, holder.itemView.getMeasuredWidth(), holder.itemView.getMeasuredHeight());
        Bitmap bigBitmap = Bitmap.createBitmap(view.getMeasuredWidth(), holder.itemView.getMeasuredHeight() * size,
                Bitmap.Config.ARGB_8888);
        Canvas bigCanvas = new Canvas(bigBitmap);
        bigCanvas.drawColor(Color.WHITE);
        Paint paint = new Paint();
        int iHeight = 0;
        holder.itemView.setDrawingCacheEnabled(true);
        holder.itemView.buildDrawingCache();
        bigCanvas.drawBitmap(holder.itemView.getDrawingCache(), 0f, iHeight, paint);
        holder.itemView.setDrawingCacheEnabled(false);
        holder.itemView.destroyDrawingCache();
        iHeight += holder.itemView.getMeasuredHeight();
        for (int i = 1; i < size; i++) {
            view.getAdapter().onBindViewHolder(holder, i);
            holder.itemView.setDrawingCacheEnabled(true);
            holder.itemView.buildDrawingCache();
            bigCanvas.drawBitmap(holder.itemView.getDrawingCache(), 0f, iHeight, paint);
            iHeight += holder.itemView.getMeasuredHeight();
            holder.itemView.setDrawingCacheEnabled(false);
            holder.itemView.destroyDrawingCache();
        }
        return bigBitmap;
    }
```

思路是，对 RecyclerView 的每个 item 依次创建对应的 ViewHolder ，`onBindViewHolder()`并`measure()`它们，分别获取每个 ViewHolder 的图像，最后拼接成一个大号的整体截图(`bitBitmap`)。

这种方法已经可以完整地截取一些 RecyclerView 的图像了。~~然而谁都知道从 StackOverflow 直接抄代码的坑有多深……~~在截取包含图像的 RecyclerView 时，这样截取的图片经常会出现 ImageView 区域空白的问题。究其原因，含有图片的 ViewHolder 是在`onBindViewHolde()`的时候，从URL加载图片显示在 ImageView 上的，而加载图片往往是异步过程。调用`onBindViewHolder()`之后立即获取它的 drawing cache 、或者把它画在 Canvas 上，此时可能还没有下载到图片，显然只能得到空白的 ImageView 。

- - -

简单折腾一下之后解决了这个问题，不过也需要对 RecyclerView 的 adapter 进行一点修改。

思路其实蛮简单的，让 adapter 实现一个阻塞的`onBindViewHolder()`，特殊处理含有图片的 ViewHolder 就可以了。

当然，为了做到这一点，含有图片的 ViewHolder 也需要实现一个阻塞地更新内容的方法。将问题从下到上解决，是这样的：

1.  提供一个阻塞地从 URL 加载图片到 ImageView 的方法
    
    这里使用的是 Universal Image Loader 的`loadImageSync()`， Glide 和 Picasso 也有类似的方法。
    
    ```java
    import com.nostra13.universalimageloader.core.ImageLoader;
    
    class ImageUtil {
        
        // ... 普通的图片显示工具方法 ...
        
        /**
         * 阻塞地在ImageView上显示图片
        * timeoutInSecond: 最大超时
         * failResId: 如果经过了timeoutInSecond秒仍没有完成加载，则显示这个resId作为图片内容
        *
         * 网络请求不能在UIThread上执行，需要加载新的线程操作UIL的loadImageSync。
        */
        public static void displayImageSync(final String uri, final ImageView imageView, int timeoutInSecond, final int failResId) {
            imageView.setImageResource(failResId);
            Thread t = new Thread(new Runnable() {
                @Override
                public void run() {
                    Bitmap bitmap = ImageLoader.getInstance().loadImageSync(uri);
                    imageView.setImageBitmap(bitmap);
                }
            });
            t.start();
            try {
                t.join(timeoutInSecond * 1000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
    }
    ```

    其实这里蛮蠢的……由于后面其他部分的实现方式已经放在其他线程中了，这里其实可以不需要单独开线程使用`loadImageSync()`。单独开线程的好处只有可以控制等待加载的时间……
    
2.  让含有图片的 ViewHolder 提供阻塞的更新方法

    我倾向于让 ViewHolder 提供一个`update()`方法来更新 ViewHolder 内的 UI 元件，于是增加一个`updateSync()`方法：

    ```java
    final class ImageViewHolder extends RecyclerView.ViewHolder {
        private ImageView imageView;
        private TextView titleView;

        ImageViewHolder(View itemView, ViewGroup parent) {
            super(itemView);
            imageView = (ImageView) itemView.findViewById(R.id.image);
            titleView = (TextView) itemView.findViewById(R.id.title);
        }

        void update(String imageUrl, String title) {
            url = imageUrl;
            // 普通的非阻塞图片加载方法
            ImageUtil.displayImage(imageUrl, imageView, ImageUtil.optionWithCacheWithLoading);
            titleView.setText(title);
            imageView.setOnClickListener(this);
        }

        void updateSync(String imageUrl, String title) {
            url = imageUrl;
            // 阻塞的图片加载方法
            ImageUtil.displayImageSync(imageUrl, imageView, 5, R.drawable.ic_load_failed);
            titleView.setText(title);
        }
    }
    ```

3.  让 RecyclerView 的 adapter 提供阻塞的`onBindViewHolder()`方法

    创建一个提供阻塞版`onBindViewHolder()`方法的接口：

    ```java
    public interface CapturableAdapter{
        void onBindViewHolderSync(RecyclerView.ViewHolder holder, int position);
    }
    ```

    让需要截图的 RecyclerView 的 adapter 实现它：

    ```java

    final public class DetailAdapter extends RecyclerView.Adapter<RecyclerView.ViewHolder> implements CapturableAdapter {

        // ... ...

        @Override
        public void onBindViewHolder(RecyclerView.ViewHolder holder, int position) {
            if (holder instanceof HeaderViewHolder) {
                // ... 更新不含图片的ViewHolder
            } else if (holder instanceof TextViewHolder) {
                // ... 更新不含图片的ViewHolder
            } else if (holder instanceof ImageViewHolder) {
                imageViewHolder.update(/* 更新含图片的ViewHolder */);
            }
        }

        @Override
        public void onBindViewHolderSync(RecyclerView.ViewHolder holder, int position) {
            if (holder instanceof ImageViewHolder) {
                imageViewHolder.updateSync(/* 更新含有图片的ViewHolder */);
            } else {
                // 不含图片的ViewHolder仍然用普通的onBindViewHolder方法更新
                onBindViewHolder(holder, position);
            }
        }
    }
    ```

4.  最后，对 RecyclerView 截图的工具方法：

    使用之前的思路，分别对每个 ViewHolder 截图，最后拼接成一个大号的 Bitmap 就可以了。可以在内存占用方面考虑得多一点，截取按比例缩小的图片、使用`RGB_565`而不是`RGBA_8888`，牺牲一点图像质量，换取更少的内存消耗。

    ```java

    /**
     * 截取一个RecyclerView的图片（用于分享之类）
     * @param scale  图片的缩放比例（e.g. 0.5 - 图片是原来的0.5倍尺寸）
     * @return       截取到的图片
     */
    static private Bitmap getScreenshotFromRecyclerView(RecyclerView view, float scale) {

        // 1. 获取RecyclerView的Adapter，生成一个Bitmap用于绘制
        RecyclerView.Adapter adapter = view.getAdapter();
        Bitmap bigBitmap = null;
        if (adapter == null) {
            return bigBitmap;
        }

        int itemCount = adapter.getItemCount();
        int bigHeight = 0;  // bigBitmap的高度，随着ViewHolder的绘制逐渐增高

        // 2. 估计一下能用的内存数量 放一个LruCache作每个ViewHolder的图像存储
        final int maxMemory = (int) (Runtime.getRuntime().maxMemory() / 1024 / 1024);
        final int cacheSize = maxMemory / 4;
        LruCache<Integer, Bitmap> bitmapCache = new LruCache<>(cacheSize);

        for (int i = 0; i < itemCount; i++) {
            // 3. 创建每一个ViewHolder...
            RecyclerView.ViewHolder holder = adapter.createViewHolder(view, adapter.getItemViewType(i));

            // 4. 如果Adapter实现了“阻塞地onBindViewHolder”，则调用阻塞的onBindViewHolderSync方法
            if (adapter instanceof CapturableAdapter) {
                ((CapturableAdapter) adapter).onBindViewHolderSync(holder, i);
            } else {
                adapter.onBindViewHolder(holder, i);
            }

            holder.itemView.measure(View.MeasureSpec.makeMeasureSpec(view.getWidth(), View.MeasureSpec.EXACTLY),
                    View.MeasureSpec.makeMeasureSpec(0, View.MeasureSpec.UNSPECIFIED));
            holder.itemView.layout(0, 0, holder.itemView.getMeasuredWidth(), holder.itemView.getMeasuredHeight());

            // 5. 按缩放比例创建Bitmap和Canvas，把ViewHolder的View画上去
            //    并把得到的Bitmap放进LruCache
            //    这里使用RGB_565而不是ARGB_8888，大概节约一半内存
            Bitmap itemBitmap = Bitmap.createBitmap(
                    (int) (holder.itemView.getMeasuredWidth() * scale),
                    (int) (holder.itemView.getMeasuredHeight() * scale), Bitmap.Config.RGB_565);
            Canvas itemCanvas = new Canvas(itemBitmap);
            itemCanvas.scale(scale, scale);
            itemBitmap.eraseColor(Color.WHITE);
            holder.itemView.draw(itemCanvas);
            if (itemBitmap != null) {
                bitmapCache.put(i, itemBitmap);
            }

            // 6. 增加总高度
            bigHeight += holder.itemView.getMeasuredHeight() * scale;
        }

        // 7. 弄一个大号的Bitmap出来放置所有内容，尺寸当然也是缩放过的
        bigBitmap = Bitmap.createBitmap((int) (view.getMeasuredWidth() * scale), bigHeight, Bitmap.Config.RGB_565);
        Canvas bigCanvas = new Canvas(bigBitmap);
        bigCanvas.drawColor(Color.WHITE);

        // 8. 依次把LruCache里的Bitmap画到相应位置
        Paint paint = new Paint();
        int height = 0;
        for (int i = 0; i < itemCount; i++) {
            Bitmap bitmap = bitmapCache.get(i);
            if (bitmap != null) {
                bigCanvas.drawBitmap(bitmap, 0f, height, paint);
                height += bitmap.getHeight();
                bitmap.recycle();
            }
        }

        return bigBitmap;
    }
    ```

    又要加载图片又要截图，这种耗时间的操作当然需要异步完成，可以包在一个 Thread 里或者包装成 AsyncTask 。这里简单地包了一个新线程：

    ```
    public interface AfterScreenshotHandler {
        void done(Bitmap bmp);
    }

    static public void getScreenshotFromRecyclerViewAsync(final RecyclerView view, final float scale, final AfterScreenshotHandler onDone) {
        Thread t = new Thread(new Runnable() {
            @Override
            public void run() {
                final Bitmap bmp = getScreenshotFromRecyclerView(view, scale);
                view.post(new Runnable() {
                    @Override
                    public void run() {
                        onDone.done(bmp);
                    }
                });
            }
        });
        t.start();
    }
    ```

    由于之前的`loadImageSync()`方法设置了最大超时，截图不会无限卡死。可以在截图过程中放一个 ProgressBar 之类的防止用户误操作，在`onDone.done()`中完成后续操作就可以了。

5.  一个使用的例子：

    ```java
    // ... 在某个Activity中
    public void screenshotAndShare() {
        showToast("准备分享图片……");
        showLoadingView();  // 显示ProgressBar
        ScreenshotUtil.getScreenshotFromRecyclerViewAsync(recyclerView, 0.5f, new ScreenshotUtil.AfterScreenshotHandler() {
            @Override
            public void done(Bitmap bmp) {
                stopLoadingView();  // 关闭ProgressBar
                ShareUtil.shareBmp(SectionDetailActivity.this, bmp);  // 分享得到的截图
            }
        });
    }
    ```

经过测试，这种方法可以比较完美地截取较长的 RecyclerView 图片（数个到十几个屏幕的尺寸）。

感觉可以通过 RecyclerView 中 item 的数量，动态设置`scale`的缩放比例；或者把每个 ViewHolder 的图像先写到文件里这种方式来进一步避免内存问题……不过暂时已经足够了，就先这样。