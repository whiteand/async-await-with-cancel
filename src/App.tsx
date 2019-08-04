import React from 'react';
import './App.css';
import {runWithCancel} from './PromiseWithCancel';

class App extends React.Component {

    public componentDidMount() {
        this.didMount_().then(() => {
            // finished
        });
    }

    public render() {
        return (
            <React.Fragment>
                <h1>Code start</h1>
                <h1>Code end</h1>
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

    private* doAllTasks(startString: string, finalString: string) {
        console.log(`here we start = ${startString}`);
        yield* this.doTask1();
        yield* this.doTask2();
        yield* this.doTask3();
        console.log(`here we finish = ${finalString}`);
    }

    private didMount_() {
        this.doAllTasks = this.doAllTasks.bind(this);
        let promise = runWithCancel(this.doAllTasks, 'start!', 'finish!');
        promise.cancel();

        return promise;
    }

    private simpleTimeoutPromise(n: number): Promise<number> {
        return new Promise<number>((resolve) => {
            setTimeout(() => {
                console.log(n);
                resolve(n);
            }, 1000);
        })
    }
}







///////////////////////////////

export default App;

