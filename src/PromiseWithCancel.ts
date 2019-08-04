import {autorun, IObservableValue, observable} from 'mobx';

type functionArgs<U extends unknown[]> = (...args: U) => IterableIterator<unknown>;

export function runWithCancel<T extends unknown[]>(fn: functionArgs<T>, ...args: T): SPromise<unknown>
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

    const promise = new SPromise<unknown>((resolve, reject) =>
    {
        // Set cancel function to return it from our fn
        cancel.set(() => {
            cancelled = true;
            reject({ reason: 'cancelled' });
        });


        // The first run of the onFulfilled function.
        onFulfilled();

        function onFulfilled<U>(res?: U)
        {
            if (!cancelled)
            {
                let result: IteratorResult<unknown>;

                try
                {
                    result = gen.next(res);
                }
                catch (e)
                {
                    return reject(e);
                }

                next(result);

                return null;
            }
        }

        function onRejected(err: any)
        {
            let result: IteratorResult<unknown>;

            try
            {
                // assert(gen.throw);
                result = (gen.throw as ((e?: any) => IteratorResult<T>))(err);
            }
            catch (e)
            {
                return reject(e);
            }

            next(result);
        }


        // Here we resolve promise and recursively run onFulfilled/onRejected again
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

export class SPromise<T> extends Promise<T>
{
    public cancelFunc: IObservableValue<(() => void) | null> = observable.box(null);

    public cancel()
    {
        let toDispose: boolean = false;
        let firstRun: boolean = true;
        let disposer = autorun(() =>
        {
            if(this.cancelFunc.get())
            {
                (this.cancelFunc.get() as () => void)();
                toDispose = true;
                if (!firstRun)
                    disposer();
            }
            firstRun = false;
        });
        if (toDispose)
            disposer();
    }
}

