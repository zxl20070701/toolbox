import template from './index.html';

import ResizeObserver from '../../../../tool/ResizeObserver';
import animation from '../../../../tool/animation';
import canvasRender from '../../../../tool/canvas/region';
import rotate from "../../../../tool/transform/rotate";

export default function (obj, props) {

    return {
        name: "echarts-example",
        render: template,
        data: {
            srcUrl: props.srcUrl
        },
        mounted: function () {

            var data = {
                value: 39,
                children: [
                    {
                        name: 'Grandpa',
                        value: 29,
                        children: [
                            {
                                name: 'Uncle Leo',
                                value: 15,
                                children: [
                                    {
                                        name: 'Cousin Mary',
                                        value: 5,
                                        children: [
                                            {
                                                name: 'Jackson',
                                                value: 2
                                            }
                                        ]
                                    },
                                    {
                                        name: 'Cousin Ben',
                                        value: 4
                                    },
                                    {
                                        name: 'Cousin Jack',
                                        value: 2
                                    }
                                ]
                            },
                            {
                                name: 'Father',
                                value: 10,
                                children: [
                                    {
                                        name: 'Me',
                                        value: 5
                                    },
                                    {
                                        name: 'Brother Peter',
                                        value: 1
                                    }
                                ]
                            },
                            {
                                name: 'Aunt Jane',
                                value: 4,
                                children: [
                                    {
                                        name: 'Cousin Kate',
                                        value: 4
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        name: 'Mike',
                        value: 7,
                        children: [
                            {
                                name: 'Uncle Dan',
                                value: 7,
                                children: [
                                    {
                                        name: 'Cousin Luck',
                                        value: 4,
                                        children: [
                                            {
                                                name: 'Nephew',
                                                value: 2
                                            }
                                        ]
                                    },
                                    {
                                        name: 'Cousin Lucy',
                                        value: 3
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        name: 'Nancy',
                        value: 3,
                        children: [
                            {
                                name: 'Uncle Nike',
                                value: 3,
                                children: [
                                    {
                                        name: 'Cousin Jenny',
                                        value: 2
                                    },
                                    {
                                        name: 'Cousin Betty',
                                        value: 1
                                    }
                                ]
                            }
                        ]
                    }
                ]
            };

            var mycontent = this._refs.mycontent.value;
            var mycanvas = this._refs.mycanvas.value;

            var painter, cx, cy, radius, updateView, legendColor, x, y, w, h, beginDeg = -Math.PI * 0.5;

            // 色彩
            var colors = ['#2F93C8', '#AEC48F', '#FFDB5C', '#F98862'];

            ResizeObserver(mycontent, function () {

                painter = canvasRender(mycanvas, mycontent.clientWidth, mycontent.clientHeight);

                x = 20, y = mycontent.clientHeight - 175, w = 20, h = 160;
                legendColor = painter.createLinearGradient(x, y + h, x, y)
                    .addColorStop(0, colors[0])
                    .addColorStop(0.33, colors[1])
                    .addColorStop(0.66, colors[2])
                    .addColorStop(1, colors[3])
                    .value();

                // 圆心和半径
                cx = mycontent.clientWidth * 0.5;
                cy = mycontent.clientHeight * 0.5;
                radius = Math.max(Math.min(cx, cy) - 50, 0) * 0.25;

                if (radius <= 0) return;

                updateView = function (deep, hover) {
                    painter.clearRect(0, 0, mycontent.clientWidth, mycontent.clientHeight).setRegion("");

                    // 颜色矩形
                    painter.config({
                        "fillStyle": legendColor
                    }).fillRect(x, y, w, h);

                    painter.config({
                        "strokeStyle": "white",
                        "textAlign": "center",
                        "font-weight": 200,
                        "font-size": 12
                    });
                    (function doit(data, beginDeg, deg, radiusNum, isSelect) {
                        if (data.children) {
                            for (var i = 0; i < data.children.length; i++) {
                                var curDeg = deg * data.children[i].value / data.value;
                                var colorVal = data.children[i].value >= 10 ? 9.9 : data.children[i].value;
                                var colorX = x + w * 0.5, colorY = y + (10 - colorVal) * 0.1 * h;

                                var _isSelect = isSelect;
                                var curColor = painter.getColor(colorX, colorY);

                                if (hover == data.children[i].name) {
                                    _isSelect = true;

                                    // 绘制吸管圈
                                    painter.config({
                                        "fillStyle": curColor,
                                        "strokeStyle": "white"
                                    }).fullCircle(colorX, colorY, 5)

                                        .config({
                                            "fillStyle": "black"
                                        })

                                        // 值文字
                                        .fillText(data.children[i].value, colorX + 20, colorY);

                                }

                                painter.config({

                                    // 吸取指定数据的颜色
                                    "fillStyle": curColor
                                }).setRegion(data.children[i].name).fullArc(cx, cy, radiusNum * radius, (radiusNum + deep) * radius, beginDeg, curDeg);

                                if (hover && !_isSelect) {
                                    painter.config({
                                        "fillStyle": "rgba(255,255,255,0.5)"
                                    }).fullArc(cx, cy, radiusNum * radius, (radiusNum + deep) * radius, beginDeg, curDeg);
                                }

                                var textP = rotate(cx, cy, beginDeg + curDeg * 0.5, cx + (radiusNum + 0.5) * radius, cy);

                                // 绘制文字
                                painter.config({
                                    "fillStyle": "rgba(0,0,0," + deep + ")"
                                }).fillText(data.children[i].name, textP[0], textP[1], (beginDeg + curDeg * 0.5 > Math.PI * 0.5 && beginDeg + curDeg * 0.5 < Math.PI * 1.5) ? Math.PI + beginDeg + curDeg * 0.5 : beginDeg + curDeg * 0.5);

                                doit(data.children[i], beginDeg, curDeg, radiusNum + 1, _isSelect);
                                beginDeg += curDeg;
                            }
                        }
                    })(data, beginDeg, Math.PI * 2, 0);

                };

                animation(function (deep) {
                    updateView(deep);
                }, 300);

            });

            mycanvas.addEventListener('mousemove', function (event) {
                if (painter) {
                    var regionName = painter.getRegion(event);

                    updateView(1, regionName)
                    mycanvas.style.cursor = regionName ? 'pointer' : 'default';

                }
            });

        }
    };
};