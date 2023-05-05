import { DirectedSensor } from "./DirectedSensor";
import { Subject } from "./Subject";

export class Clock extends Subject<string> implements DirectedSensor<null, string> {
    description = `A directed sensor that when moved returns the current time in ISO format.`;
    usage = null;

    async execute(data: null): Promise<void> {
        const now = new Date().toISOString();
        this.next(now);
    }

    isValid(data: unknown): data is null {
        return data === null;
    }
}
