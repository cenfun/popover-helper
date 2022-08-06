# popover-helper
## Online Demo
[https://cenfun.github.io/popover-helper](https://cenfun.github.io/popover-helper)

## Install
```sh
npm i popover-helper
```

## Usage
```js
import { getRect, getBestPosition } from "popover-helper";

const $popover = document.querySelector('.popover');
let positionInfo;

const update = () => {
    //get 3 rect for calculation
    const containerRect = getRect('.container');
    //10px for arrow spacing
    const targetRect = getRect('.target', 10);
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

    $popover.style.left = `${positionInfo.left}px`;
    $popover.style.top = `${positionInfo.top}px`;
    $popover.className = `popover popover-${positionInfo.position} popover-${positionInfo.type}`;

};

update();

```
see [/public/index.html](/public/index.html)

## Popover CSS
see [/public/popover.css](/public/popover.css)
