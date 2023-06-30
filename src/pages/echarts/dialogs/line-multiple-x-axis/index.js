import template from './index.html';

import ResizeObserver from '../../../../tool/ResizeObserver';
import canvasRender from '../../../../tool/canvas/index';
import ruler from '../../../../tool/ruler';
import cardinal from '../../../../tool/interpolation/cardinal';
import animation from '../../../../tool/animation';

export default function (obj, props) {

    return {
        name: "echarts-example",
        render: template,
        data: {
            srcUrl: props.srcUrl
        },
        mounted: function () {
            var i, j, x, y;

            var data = [{
                year: "2015",
                value: [2.6, 5.9, 9.0, 26.4, 28.7, 70.7, 175.6, 182.2, 48.7, 18.8, 6.0, 2.3],
                color: "#5470C6"
            }, {
                year: "2016",
                value: [3.9, 5.9, 11.1, 18.7, 48.3, 69.2, 231.6, 46.6, 55.4, 18.4, 10.3, 0.7],
                color: "#EE6666"
            }]

            var mycontent = this._refs.mycontent.value;
            var mycanvas = this._refs.mycanvas.value;

            var painter, updateView, maxValue = 0, calcY, hadInit, itemWidth;

            // 求解值总数
            for (i = 0; i < data.length; i++) {
                for (j = 0; j < data[i].value.length; j++) {
                    if (data[i].value[j] > maxValue) maxValue = data[i].value[j];
                }
            }

            // 刻度尺
            var rulerData = ruler(maxValue, 0, 5);

            // 留白大小
            var grid = {
                left: 100,
                top: 120,
                right: 100,
                bottom: 100
            };

            // 监听画布大小改变
            ResizeObserver(mycontent, function () {
                if (mycontent.clientWidth < 10) return;

                itemWidth = (mycontent.clientWidth - grid.left - grid.right) / data[0].value.length;

                hadInit = false;
                painter = canvasRender(mycanvas, mycontent.clientWidth, mycontent.clientHeight).config({
                    "fontSize": 12
                });

                // 根据值计算出对应的坐标y值
                calcY = function (value) {
                    return (rulerData[rulerData.length - 1] - value) / rulerData[rulerData.length - 1] * (mycontent.clientHeight - grid.top - grid.bottom) + grid.top;
                };

                // 生成点真实位置
                var pointsTop = [], pointsBottom = [];
                for (i = 0; i < data[0].value.length; i++) {
                    x = (i + 0.5) * ((mycontent.clientWidth - grid.left - grid.right) / data[0].value.length) + grid.left;

                    pointsTop.push([x, calcY(data[0].value[i])]);
                    pointsBottom.push([x, calcY(data[1].value[i])]);
                }

                // 生成插值函数实例
                var cardinalTop = cardinal().setP(pointsTop);
                var cardinalBottom = cardinal().setP(pointsBottom);

                updateView = function (deep, hoverData) {
                    painter.clearRect(0, 0, mycontent.clientWidth, mycontent.clientHeight);

                    // 垂直刻度尺
                    painter.config({
                        "textAlign": "right",
                        "fillStyle": "#6e7079",
                        "lineWidth": 1,
                        "lineDash": []
                    });
                    for (i = 0; i < rulerData.length; i++) {
                        y = calcY(rulerData[i]);

                        painter.fillText(rulerData[i], grid.left - 5, y);

                        painter.config({
                            "strokeStyle": i == 0 ? data[1].color : i == rulerData.length - 1 ? data[0].color : "#e0e6f1"
                        }).beginPath().moveTo(grid.left, y).lineTo(mycontent.clientWidth - grid.right, y).stroke();
                    }

                    // 上边水平刻度尺
                    painter.config({
                        "textAlign": "center",
                        "strokeStyle": data[0].color,
                        "fillStyle": data[0].color
                    });
                    for (i = 0; i < data[0].value.length; i++) {
                        x = (i + 0.5) * itemWidth + grid.left;

                        painter.fillText(data[0].year + "-" + (i + 1), x, grid.top - 15);
                        painter.beginPath().moveTo(x, grid.top).lineTo(x, grid.top - 5).stroke();
                    }

                    // 下边水平刻度尺
                    painter.config({
                        "strokeStyle": data[1].color,
                        "fillStyle": data[1].color
                    });
                    for (i = 0; i < data[1].value.length; i++) {
                        x = (i + 0.5) * itemWidth + grid.left;
                        y = mycontent.clientHeight - grid.bottom;

                        painter.fillText(data[1].year + "-" + (i + 1), x, y + 15);
                        painter.beginPath().moveTo(x, y).lineTo(x, y + 5).stroke();
                    }

                    // 第一个图例
                    painter.config({
                        "fillStyle": "white",
                        "strokeStyle": data[0].color,
                        "lineWidth": 2,
                        "textAlign": "left"
                    })
                        .beginPath().moveTo(mycontent.clientWidth * 0.5 - 140, 30).lineTo(mycontent.clientWidth * 0.5 - 110, 30).stroke()
                        .fullCircle(mycontent.clientWidth * 0.5 - 125, 30, 5)
                        .config({
                            "fillStyle": "black"
                        })
                        .fillText('Precipitation(' + data[0].year + ')', mycontent.clientWidth * 0.5 - 100, 30);

                    // 第二个图例
                    painter.config({
                        "fillStyle": "white",
                        "strokeStyle": data[1].color,
                        "lineWidth": 2
                    })
                        .beginPath().moveTo(mycontent.clientWidth * 0.5 + 20, 30).lineTo(mycontent.clientWidth * 0.5 + 50, 30).stroke()
                        .fullCircle(mycontent.clientWidth * 0.5 + 35, 30, 5)
                        .config({
                            "fillStyle": "black"
                        })
                        .fillText('Precipitation(' + data[1].year + ')', mycontent.clientWidth * 0.5 + 60, 30);

                    // 第一个曲线
                    painter.config({
                        "strokeStyle": data[0].color,
                        "lineWidth": 2
                    }).beginPath();
                    for (x = grid.left; x < (mycontent.clientWidth - grid.left) * deep + grid.left - grid.right; x += 5) {
                        painter.lineTo(x, cardinalTop(x));
                    }
                    painter.stroke();

                    // 第二个曲线
                    painter.config({
                        "strokeStyle": data[1].color
                    }).beginPath();
                    for (x = grid.left; x < (mycontent.clientWidth - grid.left) * deep + grid.left - grid.right; x += 5) {
                        painter.lineTo(x, cardinalBottom(x));
                    }
                    painter.stroke();

                    // 显示悬浮
                    if (hoverData) {

                        // 垂直线条
                        painter.config({
                            "lineDash": [2],
                            "strokeStyle": "black",
                            "lineWidth": 1
                        })
                            .beginPath().moveTo(grid.left, hoverData.yAxis.top).lineTo(mycontent.clientWidth - grid.right, hoverData.yAxis.top).stroke()
                            .beginPath().moveTo(hoverData.xAxis.left, grid.top).lineTo(hoverData.xAxis.left, mycontent.clientHeight - grid.bottom).stroke();

                        // 左侧提示
                        painter.config({
                            "fillStyle": "black"
                        }).fillRect(grid.left - 50, hoverData.yAxis.top - 10, 46, 20)
                            .config({
                                "fillStyle": "white",
                                "textAlign": "center"
                            })
                            .fillText(hoverData.yAxis.value, grid.left - 27, hoverData.yAxis.top);

                        // 顶部提示
                        painter.config({
                            "fillStyle": data[0].color
                        }).fillRect(hoverData.xAxis.left - 90, grid.top - 24, 180, 20)
                            .config({
                                "fillStyle": "white"
                            }).fillText("Precipitation " + data[0].year + "-" + (hoverData.xAxis.index + 1) + " " + data[0].value[hoverData.xAxis.index], hoverData.xAxis.left, grid.top - 14);

                        // 底部提示
                        painter.config({
                            "fillStyle": data[1].color
                        }).fillRect(hoverData.xAxis.left - 90, mycontent.clientHeight - grid.bottom + 4, 180, 20)
                            .config({
                                "fillStyle": "white"
                            }).fillText("Precipitation " + data[1].year + "-" + (hoverData.xAxis.index + 1) + " " + data[1].value[hoverData.xAxis.index], hoverData.xAxis.left, mycontent.clientHeight - grid.bottom + 14);

                    }

                    if (deep == 1) {
                        painter.config({
                            "fillStyle": "white",
                            "lineDash": [],
                            "lineWidth": 2
                        });
                        for (i = 0; i < data.length; i++) {
                            for (j = 0; j < data[i].value.length; j++) {
                                painter.config({
                                    "strokeStyle": data[i].color
                                }).fullCircle((j + 0.5) * itemWidth + grid.left, calcY(data[i].value[j]), (hoverData && hoverData.xAxis.index == j) ? 5 : 3);
                            }
                        }
                    }

                };

                animation(function (deep) {
                    updateView(deep);
                }, 1000, function () {
                    hadInit = true;
                });

            });

            // 注册鼠标移动事件
            var hasCurrent;
            mycanvas.addEventListener('mousemove', function (event) {

                // 完成初始化以后才响应鼠标事件
                if (hadInit) {

                    // 悬浮提示
                    if (event.offsetX > grid.left && event.offsetX < mycontent.clientWidth - grid.right && event.offsetY > grid.top && event.offsetY < mycontent.clientHeight - grid.bottom) {

                        var index = Math.floor((event.offsetX - grid.left) / itemWidth);
                        updateView(1, {
                            xAxis: {
                                index: index,
                                left: (index + 0.5) * itemWidth + grid.left
                            },
                            yAxis: {
                                value: ((1 - (event.offsetY - grid.top) / (mycontent.clientHeight - grid.bottom - grid.top)) * rulerData[rulerData.length - 1]).toFixed(2),
                                top: event.offsetY
                            }
                        });
                        hasCurrent = true;
                    }

                    // 出悬浮区域，隐藏悬浮提示
                    else if (hasCurrent) {
                        updateView(1);
                        hasCurrent = false;
                    }

                }
            });

        }
    };
};