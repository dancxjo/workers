export type Callback<T> = (data: T) => void;

export abstract class Subject<T> {
    protected subscribers: Callback<T>[] = [];

    subscribe(callback: Callback<T>): void {
        this.subscribers.push(callback);
    }

    protected next(data: T): void {
        this.subscribers.forEach((callback) => callback.call(this, data));
    }
}
