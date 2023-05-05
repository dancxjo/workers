import { ChatCompletionRequestMessage, CreateChatCompletionResponse, OpenAIApi } from "openai";

export abstract class Consultant<Artifact> {
    constructor(protected client: OpenAIApi) { }
    abstract parse(response: CreateChatCompletionResponse): Promise<Artifact>;
    async consult(conversationThusFar: ChatCompletionRequestMessage[] = []): Promise<Artifact> {
        const completion = await this.client.createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages: conversationThusFar,
        }); 

        const response = completion.data;
        const parsed = await this.parse(response);
        return parsed
    }
}