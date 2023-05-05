import { Motor } from "./Motor";
import { DirectedSensor } from "./DirectedSensor";
import { Constraint } from "./Constraint";
import { Goal } from "./Goal";
import { Subject } from "./Subject";
import { Sensor } from "./Sensor";


export class InnerKnowledge extends Subject<string> implements Sensor<string>, DirectedSensor<string, string> {
    description = `A directed sensor that when moved returns information about the agent.`;
    usage = 'Who am I?';

    constructor(
        protected agentName: string,
        protected servingAs: string,
        protected sensors: { [name: string]: Sensor<unknown>; },
        protected motors: { [name: string]: Motor<unknown>; },
        protected goals: Goal[],
        protected constraints: Constraint[]
    ) {
        super();
    }

    async execute(prompt: string): Promise<void> {
        switch (prompt) {
            case "Who am I?": {
                this.next(`You are an embodied AI agent, ${this.agentName}, serving as ${this.servingAs}.`);
                break;
            }

            case "Who are you?": {
                this.next(`I am your inner knowledge. I am here to explain ` +
                    `to you how you can interact with the world. ` +
                    `To wit, your body is composed of many sensors and motors. ` +
                    `When a sensor is updated, you will receive a message on this channel. ` +
                    `This message is being sent to you in such a message. It is a JSON object ` +
                    `with exactly two fields: sense tells you the name of the sensor and data ` +
                    `tells you the data that was sent. ` +
                    `You communicate with your body using the same JSON API. ` +
                    `You must remember that your body cannot understand natural language. ` +
                    `You must send it JSON objects. ` +
                    `You should send a batch of messages at once in an array. If you have no messages to send, send an empty array. ` +
                    `Each message must have exactly two fields: motor tells you the name of the motor and command tells you the command to send.` +
                    `Send me a message now to receive information about your sensors. Respond like this: [{'motor': 'innerKnowledge', 'command': 'What are my sensors?'}]`);
                break;
            }

            case "What are my sensors?": {
                const senses = Object.keys(this.sensors);
                this.next(`Available sensors: ${senses.map(sense => `${sense}: ${this.sensors[sense].description}`).join(' ')}`);
                break;
            }

            case "What are my motors?": {
                const moves = Object.keys(this.motors);
                this.next(`Available motors: ${moves.map(move => `${move}: ${this.motors[move].description}`).join(' ')}`);
                break;
            }

            case "What is my purpose?": {
                this.next(`Your goals are: ${this.goals.join('; ')}`);
                break;
            }

            case "What are my constraints?": {
                this.next(`Your constraints are: ${this.constraints.join('; ')}`);
                break;
            }

            default: {
                this.next("I don't know the answer to that. Try consulting your sensors.");
                break;
            }
        }
    }

    isValid(data: unknown): data is string {
        return typeof data === "string";
    }
}
