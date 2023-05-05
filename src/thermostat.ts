import { GptAgent } from "./GptAgent";
import { DirectedSensor } from "./DirectedSensor";
import { Motor } from "./Motor";
import { OpenAIApi } from "openai";
import { Subject } from "./Subject";
import { Clock } from "./Clock";
import { AlarmClock } from "./AlarmClock";
import { Inquiry } from "./Inquiry";

// TemperatureSensor class
class Thermometer extends Subject<number> implements DirectedSensor<null, number> {
    description = `A directed sensor that when moved returns the current temperature in degrees Fahrenheit.`;
    usage = null;

    constructor(public temperature: number) {
        super();
     }
    
    async execute(data: null): Promise<void> {
        this.next(this.temperature);
    }
    
    isValid(data: unknown): data is null {
        return data === null;
    }

    updateTemperature(newTemperature: number): void {
        this.temperature = newTemperature;
        this.subscribers.forEach((callback) => callback(newTemperature));
    }
}

class Switch implements Motor < boolean > {
    get description(): string {
        return `A motor that when moved turns ${this.deviceName} on or off. Use a boolean for the command.`;
    } 

    usage = true;

    private isOn = false;
    
    constructor(protected deviceName: string) { }

    async execute(data: boolean): Promise<void> {
        this.isOn = data;
    }

    isValid(data: unknown): data is boolean {
        return typeof data === "boolean";
    }
}

// ThermostatAgent class
class ThermostatAgent extends GptAgent {
}

export async function testThermostat(client: OpenAIApi): Promise<void> {
    const thermometer = new Thermometer(2);
    const furnace = new Switch('the furnace');
    const fan = new Switch('the fan');
    const ac = new Switch('the air conditioner');

    const thermostatAgent = new ThermostatAgent(
        "Thermostat",
        "a thermostat",
        client,
        { thermometer },
        { thermometer, furnace, fan, ac },
        ["don't make unnecessary commands", "maintain comfortable temperature", "use timers to keep checking on the temperature", "don't send redundant commands"],
        [
            "Avoid any paperclip maximizer scenarios",
            "Don't be evil",
            "I am a computer program that can only read JSON",
            "You can only be activated 25 times in 3 hours",
            "do not waste energy",
            "if you don't set a recurrent alarm clock, you won't continue to run",
            "check on the safety of the user if the temperature is dangerous",
            "each time you're called, you'll only receive this prompt and anything you've remembered with memory"
        ]
    );

    thermostatAgent.addDirectedSensor('clock', new Clock());
    thermostatAgent.addDirectedSensor('alarm', new AlarmClock());
    thermostatAgent.addDirectedSensor("inquiry", new Inquiry());

    await thermostatAgent.initialized.then(() => console.log('Agent initialized'));
    thermometer.updateTemperature(2);
}
