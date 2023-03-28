const toNum = (num) => {
    if (typeof (num) !== 'number') {
        num = parseFloat(num);
    }
    if (isNaN(num)) {
        num = 0;
    }
    num = Math.round(num);
    return num;
};

const isWindow = (obj) => {
    return Boolean(obj && obj === obj.window);
};

const isDocument = (obj) => {
    return Boolean(obj && obj.nodeType === 9);
};

const isElement = (obj) => {
    return Boolean(obj && obj.nodeType === 1);
};

export const toRect = (obj) => {
    if (obj) {
        return {
            left: toNum(obj.left || obj.x),
            top: toNum(obj.top || obj.y),
            width: toNum(obj.width),
            height: toNum(obj.height)
        };
    }
    return {
        left: 0,
        top: 0,
        width: 0,
        height: 0
    };
};

export const getElement = (selector) => {
    if (typeof selector === 'string' && selector) {
        if (selector.startsWith('#')) {
            return document.getElementById(selector.slice(1));
        }
        return document.querySelector(selector);
    }

    if (isDocument(selector)) {
        return selector.body;
    }
    if (isElement(selector)) {
        return selector;
    }
};

export const getRect = (target) => {
    if (!target) {
        return toRect();
    }

    if (isWindow(target)) {
        return {
            left: 0,
            top: 0,
            width: window.innerWidth,
            height: window.innerHeight
        };
    }

    const elem = getElement(target);
    if (!elem) {
        return toRect(target);
    }

    const br = elem.getBoundingClientRect();
    const rect = toRect(br);

    // fix offset
    rect.left += window.pageXOffset;
    rect.top += window.pageYOffset;
    rect.width = elem.offsetWidth;
    rect.height = elem.offsetHeight;

    return rect;
};

// ===========================================================================================

const calculators = {

    bottom: (info, containerRect, targetRect) => {
        info.space = containerRect.top + containerRect.height - targetRect.top - targetRect.height - info.height;
        info.top = targetRect.top + targetRect.height;
        info.left = Math.round(targetRect.left + targetRect.width * 0.5 - info.width * 0.5);
    },

    top: (info, containerRect, targetRect) => {
        info.space = targetRect.top - info.height - containerRect.top;
        info.top = targetRect.top - info.height;
        info.left = Math.round(targetRect.left + targetRect.width * 0.5 - info.width * 0.5);
    },

    right: (info, containerRect, targetRect) => {
        info.space = containerRect.left + containerRect.width - targetRect.left - targetRect.width - info.width;
        info.top = Math.round(targetRect.top + targetRect.height * 0.5 - info.height * 0.5);
        info.left = targetRect.left + targetRect.width;
    },

    left: (info, containerRect, targetRect) => {
        info.space = targetRect.left - info.width - containerRect.left;
        info.top = Math.round(targetRect.top + targetRect.height * 0.5 - info.height * 0.5);
        info.left = targetRect.left - info.width;
    }
};

export const getDefaultPositions = () => {
    return Object.keys(calculators);
};

const calculateSpace = (info, containerRect, targetRect) => {
    const calculator = calculators[info.position];
    calculator(info, containerRect, targetRect);
    if (info.space >= 0) {
        info.passed += 1;
    }
};

// ===========================================================================================

const calculateAlignOffset = (info, containerRect, targetRect, alignType, sizeType) => {

    const popoverStart = info[alignType];
    const popoverSize = info[sizeType];

    const containerStart = containerRect[alignType];
    const containerSize = containerRect[sizeType];

    const targetStart = targetRect[alignType];
    const targetSize = targetRect[sizeType];

    // size overflow
    if (popoverSize > containerSize) {
        const overflow = (popoverSize - containerSize) * 0.5;
        info[alignType] = containerStart - overflow;
        info.offset = targetStart + targetSize * 0.5 - containerStart + overflow;
        return;
    }

    const space1 = popoverStart - containerStart;
    const space2 = (containerStart + containerSize) - (popoverStart + popoverSize);

    // both side passed, default to center
    if (space1 >= 0 && space2 >= 0) {
        if (info.passed) {
            info.passed += 2;
        }
        info.offset = popoverSize * 0.5;
        return;
    }

    // one side passed
    if (info.passed) {
        info.passed += 1;
    }

    if (space1 < 0) {
        info[alignType] = containerStart;
        info.offset = targetStart + targetSize * 0.5 - containerStart;
        return;
    }

    // space2 < 0
    const start = containerStart + containerSize - popoverSize;
    info[alignType] = start;
    info.offset = targetStart + targetSize * 0.5 - start;

};

const calculateOffset = (info, containerRect, targetRect) => {

    let alignType = 'top';
    let sizeType = 'height';
    if (['top', 'bottom'].includes(info.position)) {
        alignType = 'left';
        sizeType = 'width';
    }

    calculateAlignOffset(info, containerRect, targetRect, alignType, sizeType);

    // clamp offset
    info.offset = Math.min(Math.max(info.offset, 0), info[sizeType]);

    info.left = Math.min(Math.max(info.left, containerRect.left), containerRect.left + containerRect.width - info.width);
    info.top = Math.min(Math.max(info.top, containerRect.top), containerRect.top + containerRect.height - info.height);
};

// ===========================================================================================

const calculateChange = (info, previousInfo) => {
    if (!previousInfo) {
        return;
    }
    // no change if position no change with previous
    if (info.position === previousInfo.position) {
        return;
    }
    const ax = info.left + info.width * 0.5;
    const ay = info.top + info.height * 0.5;
    const bx = previousInfo.left + previousInfo.width * 0.5;
    const by = previousInfo.top + previousInfo.height * 0.5;
    const dx = Math.abs(ax - bx);
    const dy = Math.abs(ay - by);
    info.change = Math.round(Math.sqrt(dx * dx + dy * dy));
};

const calculatePositionInfo = (position, index, containerRect, targetRect, popoverRect, previousInfo) => {
    const info = {
        position,
        index,

        top: 0,
        left: 0,
        width: popoverRect.width,
        height: popoverRect.height,

        space: 0,

        offset: 0,
        passed: 0,

        change: 0
    };


    calculateSpace(info, containerRect, targetRect);
    calculateOffset(info, containerRect, targetRect);
    calculateChange(info, previousInfo);

    return info;
};

const getAllowPositions = (positions, defaultAllowPositions) => {
    if (!positions) {
        return;
    }
    if (Array.isArray(positions)) {
        positions = positions.join(',');
    }
    positions = String(positions).split(',').map((it) => it.trim().toLowerCase()).filter((it) => it);
    positions = positions.filter((it) => defaultAllowPositions.includes(it));
    if (!positions.length) {
        return;
    }
    return positions;
};

export const getBestPosition = (containerRect, targetRect, popoverRect, positions, previousInfo) => {

    const defaultAllowPositions = getDefaultPositions();
    let withOrder = true;
    let allowPositions = getAllowPositions(positions, defaultAllowPositions);
    if (!allowPositions) {
        allowPositions = defaultAllowPositions;
        withOrder = false;
    }

    // console.log('withOrder', withOrder);

    const infoList = allowPositions.map((p, i) => {
        return calculatePositionInfo(p, i, containerRect, targetRect, popoverRect, previousInfo);
    });

    // 1, position space
    // 2, align space
    const safePassed = 2;

    infoList.sort((a, b) => {
        if (a.passed !== b.passed) {
            return b.passed - a.passed;
        }

        if (a.passed >= safePassed && b.passed >= safePassed) {
            if (previousInfo) {
                return a.change - b.change;
            }
            if (withOrder) {
                return a.index - b.index;
            }
        }

        if (a.space !== b.space) {
            return b.space - a.space;
        }

        return a.index - b.index;
    });

    // logTable(infoList);

    return infoList[0];
};

// const logTable = (() => {
//     let time_id;
//     return (info) => {
//         clearTimeout(time_id);
//         time_id = setTimeout(() => {
//             console.table(info);
//         }, 10);
//     };
// })();

const getTemplatePath = (width, height, arrowOffset, arrowSize, borderRadius) => {
    const p = (px, py) => {
        return [px, py].join(',');
    };

    const px = function(num, alignEnd) {
        const floor = Math.floor(num);
        let n = num < floor + 0.5 ? floor + 0.5 : floor + 1.5;
        if (alignEnd) {
            n -= 1;
        }
        return n;
    };

    const pxe = function(num) {
        return px(num, true);
    };

    const ls = [];
    const startPoint = p(px(0), arrowSize + borderRadius);

    ls.push(`M${startPoint}`);
    ls.push(`V${height - borderRadius}`);
    ls.push(`Q${p(px(0), pxe(height))} ${p(borderRadius, pxe(height))}`);
    ls.push(`H${width - borderRadius}`);
    ls.push(`Q${p(pxe(width), pxe(height))} ${p(pxe(width), height - borderRadius)}`);
    ls.push(`V${arrowSize + borderRadius}`);

    if (arrowOffset < arrowSize + borderRadius) {
        ls.push(`Q${p(pxe(width), px(arrowSize))} ${p(width - borderRadius, px(arrowSize))}`);
        ls.push(`H${arrowOffset + arrowSize}`);
        ls.push(`L${p(px(arrowOffset), 1)}`);
        if (arrowOffset < arrowSize + 1) {
            ls.push(`L${p(px(0), arrowSize)}`);
            ls.push(`L${startPoint}`);
        } else {
            ls.push(`L${p(arrowOffset - arrowSize, px(arrowSize))}`);
            ls.push(`Q${p(px(0), px(arrowSize))} ${startPoint}`);
        }
    } else if (arrowOffset > width - arrowSize - borderRadius) {
        if (arrowOffset > width - arrowSize - 1) {
            ls.push(`L${p(pxe(width), px(arrowSize))}`);
        } else {
            ls.push(`Q${p(pxe(width), px(arrowSize))} ${p(px(arrowOffset + arrowSize), arrowSize)}`);
        }
        ls.push(`L${p(pxe(arrowOffset), 1)}`);
        ls.push(`L${p(arrowOffset - arrowSize, px(arrowSize))}`);
        ls.push(`H${p(borderRadius, px(arrowSize))}`);
        ls.push(`Q${p(px(0), px(arrowSize))} ${startPoint}`);
    } else {
        ls.push(`Q${p(pxe(width), px(arrowSize))} ${p(width - borderRadius, px(arrowSize))}`);
        ls.push(`H${arrowOffset + arrowSize}`);
        ls.push(`L${p(arrowOffset, 1)}`);
        ls.push(`L${p(arrowOffset - arrowSize, px(arrowSize))}`);
        ls.push(`H${borderRadius}`);
        ls.push(`Q${p(px(0), px(arrowSize))} ${startPoint}`);
    }
    return ls.join('');
};

const getPathData = function(position, width, height, arrowOffset, arrowSize, borderRadius) {

    const handlers = {

        bottom: () => {
            const d = getTemplatePath(width, height, arrowOffset, arrowSize, borderRadius);
            return {
                d,
                transform: ''
            };
        },

        top: () => {
            const d = getTemplatePath(width, height, width - arrowOffset, arrowSize, borderRadius);
            return {
                d,
                transform: `rotate(180,${width * 0.5},${height * 0.5})`
            };
        },

        left: () => {
            const d = getTemplatePath(height, width, arrowOffset, arrowSize, borderRadius);
            const x = (width - height) * 0.5;
            const y = (height - width) * 0.5;
            return {
                d,
                transform: `translate(${x} ${y}) rotate(90,${height * 0.5},${width * 0.5})`
            };
        },

        right: () => {
            const d = getTemplatePath(height, width, height - arrowOffset, arrowSize, borderRadius);
            const x = (width - height) * 0.5;
            const y = (height - width) * 0.5;
            return {
                d,
                transform: `translate(${x} ${y}) rotate(-90,${height * 0.5},${width * 0.5})`
            };
        }
    };

    return handlers[position]();
};

// bindResize
export const getPositionStyle = (info, options = {}) => {

    const o = {
        bgColor: '#fff',
        borderColor: '#ccc',
        borderRadius: 10,
        arrowSize: 10
    };
    Object.keys(options).forEach((k) => {
        const v = options[k];
        if (v) {
            o[k] = v;
        }
    });

    // console.log(options);

    const data = getPathData(info.position, info.width, info.height, info.offset, o.arrowSize, o.borderRadius);
    // console.log(data);

    const viewBox = [0, 0, info.width, info.height].join(' ');
    const svg = [
        `<svg viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg">`,
        `<path d="${data.d}" fill="${o.bgColor}" stroke="${o.borderColor}" transform="${data.transform}" />`,
        '</svg>'
    ].join('');

    // console.log(svg);

    const background = `no-repeat center url("data:image/svg+xml;charset=utf8,${encodeURIComponent(svg)}")`;
    const padding = ['bottom', 'left', 'top', 'right'].map((k) => (info.position === k ? `${o.arrowSize}px` : 0)).join(' ');

    return {
        background,
        padding
    };
};
