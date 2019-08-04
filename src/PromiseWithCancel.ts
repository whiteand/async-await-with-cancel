import {autorun, IObservableValue, observable} from 'mobx';

function runWithCancel(fn: Function, ...args: any)
{
    const gen = fn(...args);
    let cancelled: boolean = false;
    let cancel: IObservableValue<(() => void) | null> = observable.box(null);

    const promise = new MyPromise((resolve, reject) => {
        // set cancel function to return it from our fn
        cancel.set(() => {
            cancelled = true;
            reject({ reason: 'cancelled' });
        });

        onFulfilled();

        function onFulfilled(res?: any) {
            if (!cancelled) {
                let result;
                try {
                    result = gen.next(res);
                } catch (e) {
                    return reject(e);
                }
                next(result);
                return null;
            }
        }

        function onRejected(err: any) {
            let result;
            try {
                result = gen.throw(err);
            } catch (e) {
                return reject(e);
            }
            next(result);
        }

        function next({ done, value } : {done: any, value: any}) {
            if (done)
                return resolve(value);
            return Promise.resolve(value).then(onFulfilled, onRejected);
        }

    });
    autorun(() =>
    {
        promise.cancelFunc.set(cancel.get());
    });

    return promise;
}

export class MyPromise<T> extends Promise<T>
{
    public cancelFunc: IObservableValue<(() => void) | null> = observable.box(null);

    public cancel ()
    {
        autorun(() =>
        {
            if(this.cancelFunc.get())
                (this.cancelFunc.get() as () => void)();
        })
    }
}

export {runWithCancel};
