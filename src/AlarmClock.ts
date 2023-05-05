import { DirectedSensor } from "./DirectedSensor";
import { Subject } from "./Subject";

type AlarmRequest = {
    delayMs: number; message: string; recurrent?: boolean;
};

export class AlarmClock extends Subject<string> implements DirectedSensor<AlarmRequest, string> {
    description = "A directed sensor that when moved sets an alarm clock that goe off after a delay.";
    usage = { 'delayMs': 1000, recurrent: false, 'message': 'Wake up!' };
    async execute(data: AlarmRequest): Promise<void> {
        const method = data.recurrent ? setInterval : setTimeout;
        method(() => {
            this.next(data.message);
        }, data.delayMs);
    }

    isValid(data: unknown): data is AlarmRequest {
        return typeof data === 'object'
            && data !== null
            && 'delayMs' in data
            && typeof data.delayMs === 'number'
            && 'message' in data
            && typeof data.message === 'string'
            && (!('recurrent' in data) || (
                typeof data.recurrent === "boolean"
            ))
    }
}
