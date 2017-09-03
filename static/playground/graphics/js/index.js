"use strict";


// 物体位置向量和缩放大小
var vWorld = new THREE.Vector3(0, -1, 20);
var scale = 0.7;

// 相机朝向 - 总是朝向 z+ ，位于 (0, 0, 0)
// 相机视距 - 总是 2
var viewDist = 4;

// 屏幕大小 600x600
var scrWidth = 600, scrHeight = 600;


// 渲染的物体
var thatObj, geometry;

var canvas = document.getElementById('main-canvas');
var context = canvas.getContext('2d');
    context['imageSmoothingEnabled'] = false;       /* standard */
    context['mozImageSmoothingEnabled'] = false;    /* Firefox */
    context['oImageSmoothingEnabled'] = false;      /* Opera */
    context['webkitImageSmoothingEnabled'] = false; /* Safari */
    context['msImageSmoothingEnabled'] = false;     /* IE */

init();


function init() {

    var manager = new THREE.LoadingManager();
    manager.onProgress = function(item, loaded, total) {

        console.log(item, loaded, total);

    };

    // 加载模型

    var onProgress = function(xhr) {
        if (xhr.lengthComputable) {
            var percentComplete = xhr.loaded / xhr.total * 100;
            console.log(Math.round(percentComplete, 2) + '% downloaded');
        }
    };

    var onError = function(xhr) {};

    var loader = new THREE.OBJLoader(manager);
    loader.load('obj/teapot.obj', function(object) {

        thatObj = object;
        geometry = new THREE.Geometry().fromBufferGeometry(thatObj.children[0].geometry);
        // 获取 Geometry: 一个几何形
        //console.log(geometry.faces);
        //console.log(geometry.vertices);

        console.log("Object is loaded!");
        loadSuccess();

    }, onProgress, onError);

}

function loadSuccess() {
    drawAxis();
    // drawVertices();
    // drawTriangle(new THREE.Vector2(28, 244), new THREE.Vector2(23, 269), new THREE.Vector2(1, 269), new THREE.Color(1, 1, 1));
    drawFaces();
}

function drawAxis() {
    var axisRange = 1.0 / scale;
    var axisStep = axisRange / 100.0;
    for (var x = 0; x <= axisRange; x += axisStep) {
        drawVertice(new THREE.Vector3(x, 0, 0), 255, 0, 0);
    }
    for (var y = 0; y <= axisRange; y += axisStep) {
        drawVertice(new THREE.Vector3(0, y, 0), 0, 255, 0);
    }
    for (var z = 0; z <= axisRange; z += axisStep) {
        drawVertice(new THREE.Vector3(0, 0, z), 0, 0, 255);
    }
}

function drawVertices() {
    var vertices = geometry.vertices;
    for (var i = 0; i < vertices.length; i ++) {
        drawVertice(vertices[i]);        
    }
}

function drawFaces() {
    var vertices = geometry.vertices;
    var faces = geometry.faces;
    var color = new THREE.Color(1, 0, 0);
    for (var i = 0; i < faces.length; i ++) {
        var face = faces[i];
        var v1 = vertices[face.a], v2 = vertices[face.b], v3 = vertices[face.c];
        color.setHSL(randColor(i), 0.85, 0.6);
        drawTriangle(transformVertice(v1), transformVertice(v2), transformVertice(v3), color);
    }
}

// ---- drawing

/**
 * 渲染一个点
 * @param vPoint         Vector3, 物体坐标系中的点位置
 * 无返回，不影响 vPoint
 */
function drawVertice(vPoint, r, g, b) {
    var v = transformVertice(vPoint);
    setPixel(v.x, v.y, r === undefined ? 255 : r, g === undefined ? 255 : g, b === undefined ? 255 : b);
}

// --- 光栅化(输入均为 view port 2D 坐标，且需要是整数)

// 光栅化水平直线
function drawHorizontalLine(intX1, intX2, intY, r, g, b) {
    if (intX1 > intX2) {
        var t = intX1;
        intX1 = intX2;
        intX2 = t;
    }
    for (var x = intX1; x <= intX2; x ++) {
        setPixel(x, intY, r, g, b);
    }
}

/** 光栅化平底三角形，v1, v2, v3: Vector2
               1
              / \
             /   \
            2-----3
 */
function drawTriangleA(x1, y1, x2, y2, x3, y3, r, g, b) {
    var xs, xe;
    for (var y = y1; y <= y2; y ++) {
        xs = ~~((y - y1) * (x2 - x1) / (y2 - y1) + x1 + 0.5);  // ~~: 转换为整数
        xe = ~~((y - y1) * (x3 - x1) / (y3 - y1) + x1 + 0.5);
        drawHorizontalLine(xs, xe, y, r, g, b);
    }
}

/** 光栅化平顶三角形，v1, v2, v3: Vector2
            1------2
             \    /
              \  /
                3
 */
function drawTriangleV(x1, y1, x2, y2, x3, y3, r, g, b) {
    var xs, xe;
    for (var y = y1; y <= y3; y ++) {
        xs = ~~((y - y1) * (x3 - x1) / (y3 - y1) + x1 + 0.5);  // ~~: 转换为整数
        xe = ~~((y - y2) * (x3 - x2) / (y3 - y2) + x2 + 0.5);
        drawHorizontalLine(xs, xe, y, r, g, b);
    }
}

/** 光栅化任意三角形 v1, v2, v3: Vector2; color: THREE.Color */
function drawTriangle(v1, v2, v3, color) {
    var x1 = ~~(v1.x), x2 = ~~(v2.x), x3 = ~~(v3.x);
    var y1 = ~~(v1.y), y2 = ~~(v2.y), y3 = ~~(v3.y);
    var r = color.r * 255, g = color.g * 255, b = color.b * 255;

    if (y1 === y2)
    {
        if (y3 <= y1) drawTriangleA(x3, y3, x1, y1, x2, y2, r, g, b);
            else drawTriangleV(x1, y1, x2, y2, x3, y3, r, g, b);
        return;
    }
    if (y1 === y3)
    {
        if (y2 <= y1) drawTriangleA(x2, y2, x1, y1, x3, y3, r, g, b);
            else drawTriangleV(x1, y1, x3, y3, x2, y2, r, g, b);
        return;
    }
    if (y2 === y3)
    {
        if (y1 <= y2) drawTriangleA(x1, y1, x2, y2, x3, y3, r, g, b);
            else drawTriangleV(x2, y2, x3, y3, x1, y1, r, g, b);
        return;
    }

    var xtop, ytop, xmiddle, ymiddle, xbottom, ybottom;
    if (y1 < y2 && y2 < y3) // y1 y2 y3
    {
        xtop = x1;
        ytop = y1;
        xmiddle = x2;
        ymiddle = y2;
        xbottom = x3;
        ybottom = y3;
    }
    else if (y1 < y3 && y3 < y2) // y1 y3 y2
    {
        xtop = x1;
        ytop = y1;
        xmiddle = x3;
        ymiddle = y3;
        xbottom = x2;
        ybottom = y2;
    }
    else if (y2 < y1 && y1 < y3) // y2 y1 y3
    {
        xtop = x2;
        ytop = y2;
        xmiddle = x1;
        ymiddle = y1;
        xbottom = x3;
        ybottom = y3;
    }
    else if (y2 < y3 && y3 < y1) // y2 y3 y1
    {
        xtop = x2;
        ytop = y2;
        xmiddle = x3;
        ymiddle = y3;
        xbottom = x1;
        ybottom = y1;
    }
    else if (y3 < y1 && y1 < y2) // y3 y1 y2
    {
        xtop = x3;
        ytop = y3;
        xmiddle = x1;
        ymiddle = y1;
        xbottom = x2;
        ybottom = y2;
    }
    else if (y3 < y2 && y2 < y1) // y3 y2 y1
    {
        xtop = x3;
        ytop = y3;
        xmiddle = x2;
        ymiddle = y2;
        xbottom = x1;
        ybottom = y1;
    }
    var xl = ~~((ymiddle - ytop) * (xbottom - xtop) / (ybottom - ytop) + xtop + 0.5);

    if (xl <= xmiddle)
    {
        drawTriangleA(xtop, ytop, xl, ymiddle, xmiddle, ymiddle, r, g, b);
        drawTriangleV(xl, ymiddle, xmiddle, ymiddle, xbottom, ybottom, r, g, b);
    }
    else
    {
        drawTriangleA(xtop, ytop, xmiddle, ymiddle, xl, ymiddle, r, g, b);
        drawTriangleV(xmiddle, ymiddle, xl, ymiddle, xbottom, ybottom, r, g, b);
    }
}

/** 
 * 在 Canvas 的 x, y 位置上绘制一个点
 * r, g, b 的范围是 0 ~2 55
 */
var px = context.createImageData(1, 1);
var pxd = px.data;
function setPixel(x, y, r, g, b) {
    pxd[0] = r; pxd[1] = g; pxd[2] = b; pxd[3] = 255;
    context.putImageData(px, x, y);
}

// --- math

/** 
 * 对某个顶点做以下变换操作，返回屏幕上的位置矢量
 * @param vPoint Vector3, 物体坐标系中的点位置，不会被修改
 * @return Vector2, 屏幕上的位置
 */
function transformVertice(vPoint) {
    var v = vPoint.clone();
    ObjectWorldTransform(v);
    var v2 = ObjectProjectTransform(v);
    fitToScreenTransform(v2);
    return v2;
}

/**
 * 变换 - 1. 世界变换
 * V2 = V + W
 * @param  vPoint        Vector3, 物体坐标系中的点位置
 * @return               none, 传入的 vPoint 会变成原来的点在世界坐标系中的位置
 */
function ObjectWorldTransform(vPoint) {
    return vPoint.multiplyScalar(scale).add(vWorld);
}

/** 
 * 变换 - 3. 投影变换
 * 点在最终投影面上的的投影坐标 (x', y') 由 点的位置 vPoint (x, y, z) 计算：
 * x' = 视距 * x / z
 * y' = 视距 * y / z 
 * @param  vPoint        Vector3, 点在世界坐标系中的位置
 * @return               Vector2, vPoint 在投影面中的位置
 */
function ObjectProjectTransform(vPoint) {
    return new THREE.Vector2(vPoint.x * viewDist / vPoint.z, vPoint.y * viewDist / vPoint.z);
}

/**
 * 变换 - 4. 放大到屏幕
 * 将 -1 ~ 1 的投影变换结果放大到屏幕尺寸
 * @param  vPoint         Vector2, 点在投影面中的位置
 * @return                none, 传入的 vPoint 会变成在屏幕上的位置
 */
function fitToScreenTransform(vPoint) {
    vPoint.x = vPoint.x * scrWidth + scrWidth / 2;
    vPoint.y = scrHeight / 2 - vPoint.y * scrHeight;
}

/** 按 face 的序号给它一个随机的色相 - 返回在 0-1 之间 */
var m_z = 987654321;
var mask = 0xffffffff;
function randColor(index)
{
    m_z = (36969 * (m_z & 65535) + (m_z >> 16)) & mask;
    index = (18000 * (index & 65535) + (index >> 16)) & mask;
    var result = ((m_z << 16) + index) & mask;
    result /= 4294967296;
    return result + 0.5;
}