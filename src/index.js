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

const clamp = function(value, min, max) {
    return Math.max(min, Math.min(max, value));
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

    const targetCenter = targetStart + targetSize * 0.5;

    // size overflow
    if (popoverSize > containerSize) {
        const overflow = (popoverSize - containerSize) * 0.5;
        info[alignType] = containerStart - overflow;
        info.offset = targetCenter - containerStart + overflow;
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
        const min = containerStart;
        info[alignType] = min;
        info.offset = targetCenter - min;
        return;
    }

    // space2 < 0
    const max = containerStart + containerSize - popoverSize;
    info[alignType] = max;
    info.offset = targetCenter - max;

};

const calculateHV = (info, containerRect) => {
    if (['top', 'bottom'].includes(info.position)) {
        info.top = clamp(info.top, containerRect.top, containerRect.top + containerRect.height - info.height);
        return ['left', 'width'];
    }
    info.left = clamp(info.left, containerRect.left, containerRect.left + containerRect.width - info.width);
    return ['top', 'height'];
};

const calculateOffset = (info, containerRect, targetRect) => {

    const [alignType, sizeType] = calculateHV(info, containerRect);

    calculateAlignOffset(info, containerRect, targetRect, alignType, sizeType);

    info.offset = clamp(info.offset, 0, info[sizeType]);

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

// ===========================================================================================

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

    const innerLeft = px(arrowSize);
    const innerRight = pxe(width - arrowSize);
    arrowOffset = clamp(arrowOffset, innerLeft, innerRight);

    const innerTop = px(arrowSize);
    const innerBottom = pxe(height - arrowSize);

    const startPoint = p(innerLeft, innerTop + borderRadius);
    const arrowPoint = p(arrowOffset, 1);

    const LT = p(innerLeft, innerTop);
    const RT = p(innerRight, innerTop);

    const AOT = p(arrowOffset - arrowSize, innerTop);
    const RRT = p(innerRight - borderRadius, innerTop);

    ls.push(`M${startPoint}`);
    ls.push(`V${innerBottom - borderRadius}`);
    ls.push(`Q${p(innerLeft, innerBottom)} ${p(innerLeft + borderRadius, innerBottom)}`);
    ls.push(`H${innerRight - borderRadius}`);
    ls.push(`Q${p(innerRight, innerBottom)} ${p(innerRight, innerBottom - borderRadius)}`);
    ls.push(`V${innerTop + borderRadius}`);

    if (arrowOffset < innerLeft + arrowSize + borderRadius) {
        ls.push(`Q${RT} ${RRT}`);
        ls.push(`H${arrowOffset + arrowSize}`);
        ls.push(`L${arrowPoint}`);
        if (arrowOffset < innerLeft + arrowSize) {
            ls.push(`L${LT}`);
            ls.push(`L${startPoint}`);
        } else {
            ls.push(`L${AOT}`);
            ls.push(`Q${LT} ${startPoint}`);
        }
    } else if (arrowOffset > innerRight - arrowSize - borderRadius) {
        if (arrowOffset > innerRight - arrowSize) {
            ls.push(`L${RT}`);
        } else {
            ls.push(`Q${RT} ${p(arrowOffset + arrowSize, innerTop)}`);
        }
        ls.push(`L${arrowPoint}`);
        ls.push(`L${AOT}`);
        ls.push(`H${innerLeft + borderRadius}`);
        ls.push(`Q${LT} ${startPoint}`);
    } else {
        ls.push(`Q${RT} ${RRT}`);
        ls.push(`H${arrowOffset + arrowSize}`);
        ls.push(`L${arrowPoint}`);
        ls.push(`L${AOT}`);
        ls.push(`H${innerLeft + borderRadius}`);
        ls.push(`Q${LT} ${startPoint}`);
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

// cache one last result
const styleCache = {
    key: '',
    value: ''
};

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

    const key = [
        info.position,
        info.width,
        info.height,
        info.offset,
        o.arrowSize,
        o.borderRadius,
        o.bgColor,
        o.borderColor
    ].join('-');

    if (key === styleCache.key) {
        return styleCache.value;
    }

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

    const padding = `${o.arrowSize + o.borderRadius}px`;

    const style = {
        background,
        padding
    };

    styleCache.key = key;
    styleCache.value = style;

    return style;
};
