import { Callback } from "./Subject";

export interface Sensor<T> {
    description: string;
    subscribe(callback: Callback<T>): void;
}
