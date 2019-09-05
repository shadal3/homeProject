import * as PIXI from 'pixi.js';

//module rx from "RXstack";
//module PIXI from pixi.js;
//module { pixing } from pixi
//module {rxModule} from RXstack;

import { $observable } from './RXstack'
//import { rx } from "./RXstack";
import './scss/main.scss';
import './css/main.css';

console.log($observable);

for (var i = 0; i <= 5; i++) {
    ((i) => {
        setTimeout( () => {
            console.log( i );
        }, 0 );
    })(i);
}

a = 2;
var a;
console.log(a);




function random (param) {
    console.log(param);
}

/*var foo = true;

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




