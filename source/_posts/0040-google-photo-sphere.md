title: "Google Photo Sphere"
date: "2013-10-25 16:49:00"
tags:
- daily
---
<p>QSC办公室的360°球形全景。事实证明就算距离很近Photo Sphere还能用……</p>
<p>使用Android 4.2.2 自带相机。脑残转圈/无处理/满地接缝/在意细节的都是⑨！</p>
<p>在tumblr dashboard中并不能正常显示。请访问<a href="http://tgmerge.me/post/65031532945/photo-sphere-qsc-w">本文章</a>。拖拽和鼠标滚轮操作。</p>

<style type="text/css">
p.button {
  text-align:center;
}
a.abutton {
  background: #ddd;
  border:1px solid #ccc;
  border-radius: 2px;
  width: 100px;
  text-align:center;
  line-height: 120%;
}
</style>

<script type="text/javascript" src="https://apis.google.com/js/plusone.js">
</script>

<script type="text/javascript">
function sizeup() {
  document.querySelector('div#sidebar').style.display='none';
  document.querySelector('div#container').style.width='900px';
  var photoSphereq = document.getElementById('photoSphereq');
  photoSphereq.innerHTML = "<g:panoembed imageurl=\'https://lh3.googleusercontent.com/-xLZuTDtd-CY/Umoh9jt-42I/AAAAAAAABeg/K6TGvt136dM/w430-h215-no/PANO_20131025_154144.jpg\' fullsize=\'4000,2000\' croppedsize=\'4000,2000\' offset=\'0,0\' displaysize=\'850,500\' />";
  gapi.panoembed.go();
}
function sizedown() {
  document.querySelector('div#sidebar').style.display='block';
  document.querySelector('div#container').style.width='580px';
  var photoSphereq = document.getElementById('photoSphereq');
  photoSphereq.innerHTML = "<g:panoembed imageurl=\'https://lh3.googleusercontent.com/-xLZuTDtd-CY/Umoh9jt-42I/AAAAAAAABeg/K6TGvt136dM/w430-h215-no/PANO_20131025_154144.jpg\' fullsize=\'4000,2000\' croppedsize=\'4000,2000\' offset=\'0,0\' displaysize=\'500,300\' />";
  gapi.panoembed.go();
}
</script>

</script>
<div id="photoSphereq"></div>
<script type="text/javascript">
  var photoSphereq = document.getElementById('photoSphereq');
  photoSphereq.innerHTML = "<g:panoembed imageurl=\'https://lh3.googleusercontent.com/-xLZuTDtd-CY/Umoh9jt-42I/AAAAAAAABeg/K6TGvt136dM/w430-h215-no/PANO_20131025_154144.jpg\' fullsize=\'4000,2000\' croppedsize=\'4000,2000\' offset=\'0,0\' displaysize=\'500,300\' />";
  gapi.panoembed.go();
</script>

<p class="button">
  <a class="abutton" href="javascript:sizeup()">　放大　</a>
  　|　
  <a class="abutton" href="javascript:sizedown()">　缩小　</a>
</p>

<img src="http://media.tumblr.com/67ade936ff723058f8e49708f478d863/tumblr_inline_mv7x0ttSAh1s1w710.png" style="display:none;'>