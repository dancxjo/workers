import prompts, { PromptObject } from 'prompts';
import { DirectedSensor } from "./DirectedSensor";
import { Subject } from './Subject';

export class Inquiry extends Subject<string> implements DirectedSensor<PromptObject<string>, string> {
    description = `A directed sensor that when moved prompts the user for input. This uses the npm package prompts@^2.4.2. You won't be able to send non-JSON, so don't try to write functions.`;
    usage: PromptObject<string> = {
        type: 'confirm',
        name: 'doingOkay',
        message: 'Are you doing okay?',
        initial: true
    }

    async execute(data: PromptObject<string>): Promise<void> {
        const response = await prompts(data);
        const answer = response[0] ?? '(empty response)';
        this.next(answer);
    }

    // TODO: This should be a more robust check.
    isValid(data: unknown): data is PromptObject<string> {
        return typeof data === "object" && data !== null;
    }
}
