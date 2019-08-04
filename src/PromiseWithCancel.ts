import {autorun, IObservableValue, observable} from 'mobx';

type functionArgs<U extends unknown[]> = (...args: U) => IterableIterator<unknown>;

function runWithCancel<T extends unknown[]>(fn: functionArgs<T>, ...args: T)
{
    const gen: IterableIterator<unknown> = fn(...args);
    gen.throw = (err?: unknown) =>
    {
        return {
            done: false,
            value: `error = ${err}`
        };
    };

    let cancelled: boolean = false;
    let cancel: IObservableValue<(() => void) | null> = observable.box(null);

    const promise = new MyPromise((resolve, reject) => {
        // set cancel function to return it from our fn
        cancel.set(() => {
            cancelled = true;
            reject({ reason: 'cancelled' });
        });

        onFulfilled();

        function onFulfilled<U>(res?: U)
        {
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

        function onRejected(err: any)
        {
            let result;
            try {
                // assert(gen.throw);
                result = (gen.throw as ((e?: any) => IteratorResult<T>))(err);
            } catch (e) {
                return reject(e);
            }
            next(result);
        }

        function next({done, value} : {done: boolean, value: unknown})
        {
            if (done)
                return resolve(value);
            return Promise.resolve(value).then(<U>(res: U) =>
            {
                onFulfilled(res);
            }, <U>(res: U) =>
            {
                onRejected(res);
            });
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
