import {of, Subject, interval, from, timer} from "rxjs";
import { concatMap, delay, takeUntil, map} from "rxjs/operators";


/*const add = (a, b) => a + b;
console.log(add(3,6));*/

export class RXstack {

    constructor() {
        const a = 5;
        const b = 4;
        const c = 3;
        const d = 5;

        if (typeof RXstack.instance === 'object') {
            return RXstack.instance;
        }
        this.counter = 15;
        RXstack.instance = this;
        console.log(RXstack.instance);
    }

    HelloWord() {
        const asa = 5;

        const array = [];

        console.log(this.counter);

        this.counter = 20;

        const obs = of(1,2,3,4,5);
        const obsTransfer = new Subject();

        const ticker = obs.pipe(concatMap(item => {
            return of(item).pipe(delay(1000))
        }));

        ticker.subscribe(item => console.log(item));

        /*const $observable = (() => {
            const temp = of(1,2,3,4,5,6);

            const obs = temp.pipe(concatMap(item => {
                return of(item).pipe(delay(1000))
            }));

            obs.subscribe(item => console.log(item));

        })();*/
        //timer(10000).subscribe(() => console.log(array));
        console.log(array);
        return obsTransfer.value;
    }
}





