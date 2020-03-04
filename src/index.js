//import * as PIXI from 'pixi.js';
import { RXstack } from './js/RXstack';

import './assets/scss/main.scss';
import './assets/css/main.css';


let helloWord = new RXstack();
console.log(helloWord);
console.log(helloWord.HelloWord());

const helloWord2 = new RXstack();
console.log(helloWord2.HelloWord());

function random (param) {
    console.log(param);
}



/*let type = "WebGL";

if (!PIXI.utils.isWebGLSupported()) {
   type = "canvas"
}

PIXI.utils.sayHello(type);*/




