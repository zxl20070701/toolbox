
import specialWord from "./specialWord";
import calcWidth from "./calcWidth";

export default function (_express, helpEl) {

    var express = [];
    for (var i = 0; i < _express.length; i++) {
        if (_express[i] == '\\') {
            if (_express[i + 1] == 'x') {
                express.push("\\x" + _express[i + 2] + _express[i + 3]);
                i += 3;
            } else {
                express.push("\\" + _express[i + 1]);
                i += 1;
            }
        } else {
            express.push(_express[i]);
        }
    }

    var purviews = [], width = 0;
    for (var i = 0; i < express.length; i++) {
        if (express[i + 1] == '-') {

            var temp1 = specialWord(express[i]);
            var temp2 = specialWord(express[i + 2]);

            var width1 = calcWidth(temp1[0], helpEl) + 10;
            var width2 = calcWidth(temp2[0], helpEl) + 10;

            purviews.push([

                {
                    content: temp1[0],
                    type: temp1[1],
                    max: 1,
                    min: 1,
                    width: width1,
                    height: 24
                },
                {
                    content: temp2[0],
                    type: temp2[1],
                    max: 1,
                    min: 1,
                    width: width2,
                    height: 24
                }
            ]);
            i += 2;

            var width3 = width1 > width2 ? width1 : width2;

            if (12 + width3 * 2 > width) width = 12 + width3 * 2;

        } else {

            var temp1 = specialWord(express[i]);

            var width1 = calcWidth(temp1[0], helpEl) + 10;

            purviews.push({
                content: temp1[0],
                type: temp1[1],
                max: 1,
                min: 1,
                width: width1,
                height: 24
            });

            if (width1 > width) width = width1;
        }
    }

    return [purviews, width + 10];
};
