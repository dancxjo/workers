import { Motor } from "./Motor";


export class Memory implements Motor<string> {
    description = `A motor that stores data in memory. It will appear in all future prompts to you.`;
    usage = `Replying in English will result in an error. Just send an array in JSON.`;
    protected memory: string[] = [];

    async execute(data: string): Promise<void> {
        this.memory.push(data);
    }

    isValid(data: unknown): data is string {
        return typeof data === "string";
    }

    public get memories(): string[] {
        return [...this.memory];
    }
}
