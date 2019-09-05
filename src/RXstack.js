import {of, Subject, interval, from} from "rxjs";
import { concatMap, delay, takeUntil, map} from "rxjs/operators";


/*const add = (a, b) => a + b;
console.log(add(3,6));*/

var number = null;


const $observable = (() => {
    const temp = of(1,2,3,4,5,6);

    const obs = temp.pipe(concatMap(item => {
        return of(item).pipe(delay(1000))
    }));

    obs.subscribe(item => console.log(item));

    return number;
});

export { number };






