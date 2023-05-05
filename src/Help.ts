import { Motor } from "./Motor";
import { DirectedSensor } from "./DirectedSensor";
import { Subject } from "./Subject";
import { Sensor } from "./Sensor";

interface HelpRequest {
    name: string;
    type: 'sensor' | 'motor';
}

export class Help extends Subject<string> implements DirectedSensor<HelpRequest, string> {
    description = `A directed sensor that when moved returns the description of a sensor or motor.`;
    usage: HelpRequest = { name: 'inner-knowledge', type: 'sensor' }

    constructor(protected sensors: { [name: string]: Sensor<unknown>; }, protected motors: { [name: string]: Motor<unknown>; }) {
        super();
    }

    async execute(data: HelpRequest): Promise<void> {
        const component = data.type === 'sensor' ? this.sensors[data.name] : this.motors[data.name];
        let response = `You have no ${data.type} named ${data.name}`;

        if (component) {
            response = component.description;
        }

        this.next(response);
    }

    isValid(data: unknown): data is HelpRequest {
        return typeof data === 'object'
            && data !== null
            && 'name' in data
            && typeof data.name === 'string'
            && 'type' in data
            && typeof data.type === 'string'
            && (data.type === 'sensor' || data.type === 'motor');
    }
}
