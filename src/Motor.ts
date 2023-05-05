export interface Motor<T> {
    description: string;
    usage: T;
    execute(data: T): Promise<void>;
    isValid(data: unknown): data is T;
}
