//import * as PIXI from 'pixi.js';
import { RXstack } from './js/RXstack';

import './scss/main.scss';
import './css/main.css';


console.log("meow");
let helloWord = new RXstack();
console.log(helloWord.HelloWord());

for (var i = 0; i <= 5; i++) {
        setTimeout( () => {
            console.log( i );
        }, 0 );
}

a = 2;
var a;
console.log(a);




function random (param) {
    console.log(param);
}

var foo = true;

if (foo) {
    var bar = foo * 2;
    console.log( bar );
}

console.log( bar ); // ReferenceError*/


/*let type = "WebGL";

if (!PIXI.utils.isWebGLSupported()) {
   type = "canvas"
}

PIXI.utils.sayHello(type);*/




