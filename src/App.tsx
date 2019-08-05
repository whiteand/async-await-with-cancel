import React from 'react';
import {runWithCancel} from './PromiseWithCancel';
import {configure, observable, runInAction} from 'mobx';

configure({enforceActions: 'always'});

class App extends React.Component {

    @observable private someNumber: number = 5;

    public componentDidMount() {
        let promise = runWithCancel(this.doAllTasks.bind(this), 'start!', 'finish!');
        setTimeout(() => promise.cancel(), 3000);

        return promise;
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
        yield this.simpleTimeoutPromise(3);
        yield this.simpleTimeoutPromise(4);
    }

    private* doTask3(): IterableIterator<Promise<number>> {
        yield this.simpleTimeoutPromise(5);
        yield this.simpleTimeoutPromise(6);
    }

    private* doAllTasks(startString: string, finalString: string): IterableIterator<any> {
        console.log(`here we start = ${startString}`);
        yield* this.doTask1();
        yield* this.doTask2();
        yield* this.doTask3();
        console.log(`here we finish = ${finalString}`);
    }

    private simpleTimeoutPromise(n: number): Promise<number> {
        return new Promise<number>((resolve) => {
            setTimeout(() => {
                runInAction(() =>
                {
                    this.someNumber = n;
                    console.log(`someNumber = ${this.someNumber}`);
                });
                resolve(n);
            }, 1000);
        })
    }
}

export default App;

