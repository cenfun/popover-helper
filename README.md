# popover-helper

## Install
```sh
npm i popover-helper
```

## Preview
[https://cenfun.github.io/popover-helper](https://cenfun.github.io/popover-helper)

## API Usage
```js
import { getRect, getBestPosition } from "popover-helper";

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
        //acceptable positions
        positions,
        //previous position info
        positionInfo
    );

    //console.log(positionInfo);
    // positionInfo: {
    //     position: String,
    //     align: String,
    //     top: Number,
    //     left: Number,
    //     width: Number,
    //     height: Number
    // }

    $popover.style.left = `${positionInfo.left}px`;
    $popover.style.top = `${positionInfo.top}px`;

};

update();

```
see source code [/public/index.html](/public/index.html)
