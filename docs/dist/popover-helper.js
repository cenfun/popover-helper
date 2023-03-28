!function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e():"function"==typeof define&&define.amd?define("popover-helper",[],e):"object"==typeof exports?exports["popover-helper"]=e():t["popover-helper"]=e()}(self,(()=>(()=>{"use strict";var t={d:(e,o)=>{for(var i in o)t.o(o,i)&&!t.o(e,i)&&Object.defineProperty(e,i,{enumerable:!0,get:o[i]})},o:(t,e)=>Object.prototype.hasOwnProperty.call(t,e),r:t=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})}},e={};t.r(e),t.d(e,{getBestPosition:()=>a,getDefaultPositions:()=>h,getElement:()=>r,getPositionStyle:()=>f,getRect:()=>s,toRect:()=>i});const o=t=>("number"!=typeof t&&(t=parseFloat(t)),isNaN(t)&&(t=0),t=Math.round(t)),i=t=>t?{left:o(t.left||t.x),top:o(t.top||t.y),width:o(t.width),height:o(t.height)}:{left:0,top:0,width:0,height:0},r=t=>{return"string"==typeof t&&t?t.startsWith("#")?document.getElementById(t.slice(1)):document.querySelector(t):(e=t,Boolean(e&&9===e.nodeType)?t.body:(t=>Boolean(t&&1===t.nodeType))(t)?t:void 0);var e},s=t=>{if(!t)return i();if(e=t,Boolean(e&&e===e.window))return{left:0,top:0,width:window.innerWidth,height:window.innerHeight};var e;const o=r(t);if(!o)return i(t);const s=o.getBoundingClientRect(),n=i(s);return n.left+=window.pageXOffset,n.top+=window.pageYOffset,n.width=o.offsetWidth,n.height=o.offsetHeight,n},n={bottom:(t,e,o)=>{t.space=e.top+e.height-o.top-o.height-t.height,t.top=o.top+o.height,t.left=Math.round(o.left+.5*o.width-.5*t.width)},top:(t,e,o)=>{t.space=o.top-t.height-e.top,t.top=o.top-t.height,t.left=Math.round(o.left+.5*o.width-.5*t.width)},right:(t,e,o)=>{t.space=e.left+e.width-o.left-o.width-t.width,t.top=Math.round(o.top+.5*o.height-.5*t.height),t.left=o.left+o.width},left:(t,e,o)=>{t.space=o.left-t.width-e.left,t.top=Math.round(o.top+.5*o.height-.5*t.height),t.left=o.left-t.width}},h=()=>Object.keys(n),p=(t,e,o,i,r,s)=>{const h={position:t,index:e,top:0,left:0,width:r.width,height:r.height,space:0,offset:0,passed:0,change:0};return((t,e,o)=>{(0,n[t.position])(t,e,o),t.space>=0&&(t.passed+=1)})(h,o,i),((t,e,o)=>{let i="top",r="height";["top","bottom"].includes(t.position)&&(i="left",r="width"),((t,e,o,i,r)=>{const s=t[i],n=t[r],h=e[i],p=e[r],a=o[i],d=o[r];if(n>p){const e=.5*(n-p);return t[i]=h-e,void(t.offset=a+.5*d-h+e)}const f=s-h;if(f>=0&&h+p-(s+n)>=0)return t.passed&&(t.passed+=2),void(t.offset=.5*n);if(t.passed&&(t.passed+=1),f<0)return t[i]=h,void(t.offset=a+.5*d-h);const u=h+p-n;t[i]=u,t.offset=a+.5*d-u})(t,e,o,i,r),t.offset=Math.min(Math.max(t.offset,0),t[r]),t.left=Math.min(Math.max(t.left,e.left),e.left+e.width-t.width),t.top=Math.min(Math.max(t.top,e.top),e.top+e.height-t.height)})(h,o,i),((t,e)=>{if(!e)return;if(t.position===e.position)return;const o=t.left+.5*t.width,i=t.top+.5*t.height,r=e.left+.5*e.width,s=e.top+.5*e.height,n=Math.abs(o-r),h=Math.abs(i-s);t.change=Math.round(Math.sqrt(n*n+h*h))})(h,s),h},a=(t,e,o,i,r)=>{const s=h();let n=!0,a=((t,e)=>{if(t&&(Array.isArray(t)&&(t=t.join(",")),(t=(t=String(t).split(",").map((t=>t.trim().toLowerCase())).filter((t=>t))).filter((t=>e.includes(t)))).length))return t})(i,s);a||(a=s,n=!1);const d=a.map(((i,s)=>p(i,s,t,e,o,r)));return d.sort(((t,e)=>{if(t.passed!==e.passed)return e.passed-t.passed;if(t.passed>=2&&e.passed>=2){if(r)return t.change-e.change;if(n)return t.index-e.index}return t.space!==e.space?e.space-t.space:t.index-e.index})),d[0]},d=(t,e,o,i,r)=>{const s=(t,e)=>[t,e].join(","),n=function(t,e){const o=Math.floor(t);let i=t<o+.5?o+.5:o+1.5;return e&&(i-=1),i},h=function(t){return n(t,!0)},p=[],a=s(n(0),i+r);return p.push(`M${a}`),p.push("V"+(e-r)),p.push(`Q${s(n(0),h(e))} ${s(r,h(e))}`),p.push("H"+(t-r)),p.push(`Q${s(h(t),h(e))} ${s(h(t),e-r)}`),p.push(`V${i+r}`),o<i+r?(p.push(`Q${s(h(t),n(i))} ${s(t-r,n(i))}`),p.push(`H${o+i}`),p.push(`L${s(n(o),1)}`),o<i+1?(p.push(`L${s(n(0),i)}`),p.push(`L${a}`)):(p.push(`L${s(o-i,n(i))}`),p.push(`Q${s(n(0),n(i))} ${a}`))):o>t-i-r?(o>t-i-1?p.push(`L${s(h(t),n(i))}`):p.push(`Q${s(h(t),n(i))} ${s(n(o+i),i)}`),p.push(`L${s(h(o),1)}`),p.push(`L${s(o-i,n(i))}`),p.push(`H${s(r,n(i))}`),p.push(`Q${s(n(0),n(i))} ${a}`)):(p.push(`Q${s(h(t),n(i))} ${s(t-r,n(i))}`),p.push(`H${o+i}`),p.push(`L${s(o,1)}`),p.push(`L${s(o-i,n(i))}`),p.push(`H${r}`),p.push(`Q${s(n(0),n(i))} ${a}`)),p.join("")},f=function(t){let e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};const o={bgColor:"#fff",borderColor:"#ccc",borderRadius:10,arrowSize:10};Object.keys(e).forEach((t=>{const i=e[t];i&&(o[t]=i)}));const i=(r=t.position,s=t.width,n=t.height,h=t.offset,p=o.arrowSize,a=o.borderRadius,{bottom:()=>({d:d(s,n,h,p,a),transform:""}),top:()=>({d:d(s,n,s-h,p,a),transform:`rotate(180,${.5*s},${.5*n})`}),left:()=>({d:d(n,s,h,p,a),transform:`translate(${.5*(s-n)} ${.5*(n-s)}) rotate(90,${.5*n},${.5*s})`}),right:()=>({d:d(n,s,n-h,p,a),transform:`translate(${.5*(s-n)} ${.5*(n-s)}) rotate(-90,${.5*n},${.5*s})`})}[r]());var r,s,n,h,p,a;const f=[`<svg viewBox="${[0,0,t.width,t.height].join(" ")}" xmlns="http://www.w3.org/2000/svg">`,`<path d="${i.d}" fill="${o.bgColor}" stroke="${o.borderColor}" transform="${i.transform}" />`,"</svg>"].join(""),u=`no-repeat center url("data:image/svg+xml;charset=utf8,${encodeURIComponent(f)}")`,l=`${o.borderRadius}px`,c=`${o.arrowSize+o.borderRadius}px`;return{background:u,padding:["bottom","left","top","right"].map((e=>t.position===e?c:l)).join(" ")}};return e})()));