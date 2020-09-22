import './assets/scss/main.scss'; //css libraries are imported to be used in dev (we don't add them via html), for production they will be added to index.html and used from there
import './assets/css/main.css';

import 'bootstrap/js/src/collapse';

let helloWord = new RXstack();
console.log(helloWord);
console.log(helloWord.HelloWord());

const helloWord2 = new RXstack();
console.log(helloWord2.HelloWord());

function random (param) {
    console.log(param);
}




