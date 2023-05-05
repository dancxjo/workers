import { OpenAIApi } from "openai";
import { DirectedSensor } from "./DirectedSensor";
import { Subject } from "./Subject";

export class Consultation extends Subject<string> implements DirectedSensor<string, string> {
    description = `A directed sensor that when moved returns a response from the OpenAI ChatGPT 3 (turbo).`;
    usage = 'Show me a well formatted HTML file.';

    constructor(private client: OpenAIApi) {
        super();
    }

    async execute(data: string): Promise<void> {
        const completion = await this.client.createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: data }]
        });
        const answer = completion.data.choices[0].message?.content ?? '(empty response)';

        this.subscribers.forEach(callback => callback(answer));
    }

    isValid(data: unknown): data is string {
        return typeof data === 'string';
    }
}
