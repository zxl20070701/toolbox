import template from './index.html';

import ResizeObserver from '../../../../tool/ResizeObserver';
import animation from '../../../../tool/animation';
import canvasRender from '../../../../tool/canvas/region';
import ruler from '../../../../tool/ruler';
import drawRuler from '../../../../tool/canvas/extend/ruler';

export default function (obj, props) {

    return {
        name: "echarts-example",
        render: template,
        data: {
            srcUrl: props.srcUrl
        },
        mounted: function () {
            var i, j, k, x, y, radius, gradient, scale, color;

            var data = [
                [
                    // GDP、寿命、人口、国家、年
                    [28604, 77, 17096869, 'Australia', 1990],
                    [31163, 77.4, 27662440, 'Canada', 1990],
                    [1516, 68, 1154605773, 'China', 1990],
                    [13670, 74.7, 10582082, 'Cuba', 1990],
                    [28599, 75, 4986705, 'Finland', 1990],
                    [29476, 77.1, 56943299, 'France', 1990],
                    [31476, 75.4, 78958237, 'Germany', 1990],
                    [28666, 78.1, 254830, 'Iceland', 1990],
                    [1777, 57.7, 870601776, 'India', 1990],
                    [29550, 79.1, 122249285, 'Japan', 1990],
                    [2076, 67.9, 20194354, 'North Korea', 1990],
                    [12087, 72, 42972254, 'South Korea', 1990],
                    [24021, 75.4, 3397534, 'New Zealand', 1990],
                    [43296, 76.8, 4240375, 'Norway', 1990],
                    [10088, 70.8, 38195258, 'Poland', 1990],
                    [19349, 69.6, 147568552, 'Russia', 1990],
                    [10670, 67.3, 53994605, 'Turkey', 1990],
                    [26424, 75.7, 57110117, 'United Kingdom', 1990],
                    [37062, 75.4, 252847810, 'United States', 1990]
                ],
                [
                    [44056, 81.8, 23968973, 'Australia', 2015],
                    [43294, 81.7, 35939927, 'Canada', 2015],
                    [13334, 76.9, 1376048943, 'China', 2015],
                    [21291, 78.5, 11389562, 'Cuba', 2015],
                    [38923, 80.8, 5503457, 'Finland', 2015],
                    [37599, 81.9, 64395345, 'France', 2015],
                    [44053, 81.1, 80688545, 'Germany', 2015],
                    [42182, 82.8, 329425, 'Iceland', 2015],
                    [5903, 66.8, 1311050527, 'India', 2015],
                    [36162, 83.5, 126573481, 'Japan', 2015],
                    [1390, 71.4, 25155317, 'North Korea', 2015],
                    [34644, 80.7, 50293439, 'South Korea', 2015],
                    [34186, 80.6, 4528526, 'New Zealand', 2015],
                    [64304, 81.6, 5210967, 'Norway', 2015],
                    [24787, 77.3, 38611794, 'Poland', 2015],
                    [23038, 73.13, 143456918, 'Russia', 2015],
                    [19360, 76.5, 78665830, 'Turkey', 2015],
                    [38225, 81.4, 64715810, 'United Kingdom', 2015],
                    [53354, 79.1, 321773631, 'United States', 2015]
                ]
            ];

            var mycontent = this._refs.mycontent.value;
            var mycanvas = this._refs.mycanvas.value;

            var painter, updateView, width, height, maxValue = 0, minValue = 100;

            // 求解寿命最大最小值
            for (i = 0; i < data.length; i++) {
                for (j = 0; j < data[i].length; j++) {
                    if (maxValue < data[i][j][1]) maxValue = data[i][j][1];
                    if (minValue > data[i][j][1]) minValue = data[i][j][1];
                }
            }

            // 求解垂直刻度尺
            var yRulerData = ruler(maxValue, minValue, 6);

            // 水平刻度尺
            var xRulerData = [0, 10000, 20000, 30000, 40000, 50000, 60000, 70000];

            // 留白大小
            var grid = {
                left: 70,
                top: 80,
                right: 90,
                bottom: 70
            };

            // 小球的颜色
            var colors = [{
                shadowColor: "rgba(120, 36, 50, 0.5)",
                gradient: ["rgb(251, 118, 123)", "rgb(204, 46, 72)"]
            }, {
                shadowColor: "rgba(25, 100, 150, 0.5)",
                gradient: ["rgb(129, 227, 238)", "rgb(25, 183, 207)"]
            }];

            // 监听画布大小改变
            ResizeObserver(mycontent, function () {
                width = mycontent.clientWidth;
                height = mycontent.clientHeight;

                painter = canvasRender(mycanvas, width, height, true);

                // 计算球数据
                var bubbles = [], legends = [];
                for (i = 0; i < data.length; i++) {
                    var bubble = [];
                    for (j = 0; j < data[i].length; j++) {

                        // 位置
                        x = data[i][j][0] / 70000 * (width - grid.left - grid.right) + grid.left;
                        y = (1 - (data[i][j][1] - yRulerData[0]) / (yRulerData[yRulerData.length - 1] - yRulerData[0])) * (height - grid.bottom - grid.top) + grid.top;

                        // 大小
                        radius = Math.sqrt(data[i][j][2]) * 0.001;

                        bubble.push({
                            x: x,
                            y: y,
                            radius: radius,
                            color: painter.createRadialGradient(x, y, radius).addColorStop(0, colors[i].gradient[0]).addColorStop(1, colors[i].gradient[1]).value()
                        });
                    }

                    bubbles.push(bubble);

                    x = width - 300 + 70 * i, y = 50, radius = 7;
                    legends.push({
                        text: data[i][0][4],
                        x: x,
                        y: y,
                        radius: radius,
                        color: painter.createRadialGradient(x, y, radius).addColorStop(0, colors[i].gradient[0]).addColorStop(1, colors[i].gradient[1]).value()
                    });
                }

                /**
                 * hover可能是如下值：
                 * normal 所有数据有效，但都不特殊标记
                 * [i] 第i组数据有效且全部特殊标记
                 * [i,j] 第i组j条数据有效，但第i组数据特色标记
                 */
                updateView = function (deep, hover) {
                    painter.clearRect(0, 0, width, height);

                    painter.setRegion("");

                    gradient = painter.createRadialGradient(width * 0.3, height * 0.3, Math.max(width, height) * 0.4)
                        .addColorStop(0, "#f7f8fa")
                        .addColorStop(1, "#cdd0d5");

                    // 绘制背景
                    painter.config({
                        "fillStyle": gradient.value()
                    }).fillRect(0, 0, width, height);

                    // 绘制标题
                    painter.config({
                        "fillStyle": "black",
                        "fontSize": 18,
                        "fontWeight": 800,
                        "textAlign": "left"
                    }).fillText("Life Expectancy and GDP by Country", 40, 30);

                    // 垂直刻度尺
                    drawRuler(painter, {
                        value: yRulerData,
                        x: grid.left,
                        y: height - grid.bottom,
                        length: height - grid.top - grid.bottom,
                        direction: "BT",
                        "mark-direction": "left",
                        color: "#6e7079"
                    });

                    // 水平刻度尺
                    drawRuler(painter, {
                        value: xRulerData,
                        x: grid.left,
                        y: height - grid.bottom,
                        length: width - grid.left - grid.right,
                        color: "#6e7079"
                    });

                    var _i = [1, 0];
                    if (hover && Array.isArray(hover) && hover[0] == 1) {
                        _i = [0, 1];
                    }

                    // 绘制球
                    for (k = 0; k < data.length; k++) {
                        i = _i[k];

                        for (j = 0; j < data[i].length; j++) {

                            scale = 1, color = bubbles[i][j].color;
                            if (hover && hover !== 'normal') {
                                if (hover[0] == i) {
                                    if ((hover.length < 2 || hover[1] == j)) {
                                        scale = 1 + deep * 0.2;
                                    }
                                } else {
                                    color = "rgba(" + ["251, 118, 123", "129, 227, 238"][i] + "," + (0.8 - deep * 0.2) + ")";
                                }
                            } else if (hover == 'normal') {
                                scale = deep;
                            }

                            painter.setRegion(i + "-" + j).config({
                                fillStyle: color,
                                shadowBlur: 10,
                                shadowColor: colors[i].shadowColor
                            }).fillCircle(bubbles[i][j].x, bubbles[i][j].y, bubbles[i][j].radius * scale);

                        }
                    }

                    // 文字
                    painter.config({
                        "textAlign": "center",
                        "fillStyle": "black",
                        shadowBlur: 0,
                        "fontWeight": 200
                    });
                    if (hover && Array.isArray(hover)) {

                        if (hover.length == 1) {
                            for (j = 0; j < data[0].length; j++) {
                                painter.fillText(data[hover[0]][j][3], bubbles[hover[0]][j].x, bubbles[hover[0]][j].y - bubbles[hover[0]][j].radius * (1 + deep * 0.2) - 10);
                            }
                        } else {
                            painter.fillText(data[hover[0]][hover[1]][3], bubbles[hover[0]][hover[1]].x, bubbles[hover[0]][hover[1]].y - bubbles[hover[0]][hover[1]].radius * (1 + deep * 0.2) - 10);
                        }

                    }

                    // 绘制图例
                    for (i = 0; i < legends.length; i++) {

                        painter.setRegion(i + "").config({
                            "textAlign": "left",
                            "fontWeight": 800,
                            "fillStyle": "black"
                        })

                            // 文字
                            .fillText(legends[i].text, legends[i].x, legends[i].y)

                            .config({
                                "fillStyle": legends[i].color
                            })

                            // 球
                            .fillCircle(legends[i].x - 10, legends[i].y, legends[i].radius);

                    }

                };

                animation(function (deep) {
                    updateView(deep, "normal");
                }, 300);

                // 当前被悬浮的区域
                var currentRegion;

                // 注册鼠标悬浮事件
                var stop = function () { };
                mycanvas.addEventListener('mousemove', function (event) {
                    if (painter) {
                        var regionName = painter.getRegion(event);

                        if (regionName) {
                            mycanvas.style.cursor = 'pointer';

                            // 如果悬浮区域改变了
                            if (regionName != currentRegion) {
                                stop();

                                currentRegion = regionName;
                                var _currentRegion = currentRegion.split("-");

                                stop = animation(function (deep) {
                                    updateView((deep * 0.3) + 0.7, _currentRegion);
                                }, 400);
                            }

                        } else {
                            mycanvas.style.cursor = 'default';

                            // 如果离开悬浮区域
                            if (currentRegion) {
                                stop();

                                var _currentRegion = currentRegion.split("-");
                                currentRegion = "";

                                stop = animation(function (deep) {
                                    updateView(1 - (deep * 0.3), _currentRegion);
                                }, 400, function () {
                                    updateView(1, "normal");
                                });
                            }

                        }

                    }

                });

            });

        }
    };
};