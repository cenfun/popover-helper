# Popover Helper
## Preview
[https://cenfun.github.io/popover-helper](https://cenfun.github.io/popover-helper)

## Install
```sh
npm i popover-helper
```

## Usage
```js
import { getRect, getBestPosition, getPositionStyle } from "popover-helper";

const $popover = document.querySelector('.popover');
let positionInfo;

const update = () => {
    //get 3 rect for calculation
    const containerRect = getRect('.container');
    const targetRect = getRect('.target');
    const popoverRect = getRect('.popover');
    const positions = [];

    positionInfo = getBestPosition(
        containerRect,
        targetRect,
        popoverRect,
        //allowed positions
        positions,
        //previous position info
        positionInfo
    );

    //console.log(positionInfo);
    if (positionInfo.changed) {
        $popover.style.left = `${positionInfo.left}px`;
        $popover.style.top = `${positionInfo.top}px`;
    }

    const style = getPositionStyle(positionInfo, {
        bgColor: "#fff",
        borderColor: "#ccc",
        arrowSize: 10
    });
    // performance optimized
    if (style.changed) {
        $popover.style.background = style.background;
    }
};

update();

```
see [/public/index.html](/public/index.html)

## CHANGELOG

- 2.0.4
    - fixed arrow size (#1)

- 2.0.3
    - fixed performance issue

- 2.0.0
    - replaced css arrow with svg background

- 1.0.3
    - added color to css
    - fixed positions sort issue