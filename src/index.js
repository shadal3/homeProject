import './assets/scss/main.scss'; //css libraries are imported to be used in dev (we don't add them via html), for production they will be added to index.html and used from there
import './assets/css/main.css';
import 'bootstrap/js/src/collapse';
import * as PIXI from 'pixi.js'
import { keyboard } from './js/keyboard.js'

let type = "WebGL";
if (!PIXI.utils.isWebGLSupported()) {
    type = "canvas"
}

PIXI.utils.sayHello(type);

//Create a Pixi Application (stage)
let app = new PIXI.Application({
        width: 512,         // default: 800
        height: 512,        // default: 600
        antialias: true,    // default: false, smoothes the edges of fonts and graphic primitives
        transparent: false, // default: false
        resolution: 1,       // default: 1
        forceCanvas: false
    }
);
//Add the canvas that Pixi automatically created for you to the HTML document
document.body.appendChild(app.view);

let keyObject = keyboard('ArrowUp');

app.renderer.backgroundColor = 0x061639;
app.renderer.autoResize = true;
app.renderer.resize(512, 512);

app.renderer.view.style.position = "absolute";
app.renderer.view.style.display = "block";
app.renderer.resize(window.innerWidth, window.innerHeight);

window.PIXI = PIXI;

const loader = new PIXI.Loader();
const Sprite = PIXI.Sprite;
const Rectangle = PIXI.Rectangle;
const textureCache = PIXI.utils.TextureCache;

//loader.add('worm', "./assets/img/worm.png");
//loader.add('spyro', "./assets/img/spyro.png");
//loader.add('cat', "./assets/img/cat.png");
//loader.add('tileset', "./assets/img/tileset.png");
loader.add('dragonsAndWorm', "./assets/img/dragonsAndWorms.json");

loader.onLoad.add((loader, resources) => {
    //Display the file `url` currently being loaded
    console.log("loading: " + resources.url);

    //Display the percentage of files currently loaded
    console.log("progress: " + loader.progress + "%");

    //If you gave your files names as the first argument
    //of the `add` method, you can access them like this
    //console.log("loading: " + resource.name)
});

loader.load((loader, resources) => {
    //or from textureCache
   let wormSprite = new Sprite(resources.dragonsAndWorm.textures['worm.png']);
   let spyroSprite = new Sprite(resources.dragonsAndWorm.textures['spyro.png']);

    app.stage.addChild(spyroSprite);
    app.stage.addChild(wormSprite);
    spyroSprite.visible = true;

    wormSprite.width = 240;
    wormSprite.height = 240;
    wormSprite.x = app.stage.width / 2 - wormSprite.width / 2;

    spyroSprite.position.set(window.innerWidth / 2, window.innerHeight / 2);
    spyroSprite.width = 240;
    spyroSprite.height = 240;
    spyroSprite.anchor.set(0.5, 0.5);
    spyroSprite.rotation = 6.28 / 1;
    spyroSprite.vx = 1;

    keyObject.press = () => {
        spyroSprite.y -= spyroSprite.vx ;
    };
    keyObject.release = () => {
        //key object released
    };

    /*app.ticker.add(delta => {
        spyroSprite.y += spyroSprite.vx ;
    });*/
});





/*let textureCache = PIXI.utils.TextureCache;
console.log(textureCache);
let texture = textureCache['./assets/img/cat.png'];
console.log(texture);*/



