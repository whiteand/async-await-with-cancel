import React from 'react';
import {runWithCancel, SPromise} from './PromiseWithCancel';

class App extends React.Component {

    public componentDidMount() {
        runWithCancel(this.doAllTasks.bind(this), 'start!', 'finish!');
        // setTimeout(() => promise.cancel(), 5000);
    }

    public render() {
        return (
            <React.Fragment>
                <h1>Open console and look for example!</h1>
            </React.Fragment>
        );
    }

    private* doTask1(): IterableIterator<Promise<number>> {
        yield this.simpleTimeoutPromise(1);
        yield this.simpleTimeoutPromise(2);
    }

    private* doTask2(): IterableIterator<Promise<number>> {
        yield this.simpleTimeoutPromise(10);
        yield this.simpleTimeoutPromise(20);
        yield this.simpleTimeoutPromise(30);
        yield this.simpleTimeoutPromise(40);
        yield this.simpleTimeoutPromise(50);
        yield this.simpleTimeoutPromise(60);
    }

    private* doTask3(): IterableIterator<Promise<number>> {
        yield this.simpleTimeoutPromise(5);
        yield this.simpleTimeoutPromise(6);
    }

    private* doAllTasks(startString: string, finalString: string): IterableIterator<any> {
        console.log(`here we start = ${startString}`);
        yield* this.doTask1();
        yield this.doSomething(this.doTask2.bind(this));
        yield* this.doTask3();
        console.log(`here we finish = ${finalString}`);
    }

    private simpleTimeoutPromise(n: number): Promise<number> {
        return new Promise<number>((resolve) => {
            setTimeout(() => {
                console.log(n);
                resolve(n);
            }, 1000);
        })
    }

    private doSomething(fn: any, ...args: any)
    {
        let promise = runWithCancel(fn, args);

        setTimeout(() => promise.cancel(), 4000);

        return promise;
    }
}

export default App;

