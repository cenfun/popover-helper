# popover-helper

### Install
```sh
npm i popover-helper
```

### API Usage
```js
import { getRect, getBestPosition } from "popover-helper";

//get 3 rect for calculation
const containerRect = getRect(this.container || window);
const targetRect = getRect(this.target);
//update popover content size here
const popoverRect = getRect("popover_selector");

this.positionInfo = getBestPosition(
    containerRect,
    targetRect,
    popoverRect,
    //accept positions
    this.positions,
    //previous position info
    this.positionInfo
);

// positionInfo: {
//     position: String,
//     align: String,
//     top: Number,
//     left: Number,
//     width: Number,
//     height: Number
// }
```

