import { ChatCompletionRequestMessage, ChatCompletionRequestMessageRoleEnum, CreateChatCompletionResponse, OpenAIApi } from "openai";
import { Memory } from "./Memory";
import { Agent } from "./Agent";
import { Constraint } from "./Constraint";
import { Goal } from "./Goal";
import { Motor } from "./Motor";
import { Sensor } from "./Sensor";
import { InnerKnowledge } from "./InnerKnowledge";

import Debug from 'debug';
import { Help } from "./Help";
import { Consultant } from "./Constulant";

const log = {
    agent: Debug('agent'),
    conversation: Debug("conversation"),
    sensor: Debug("sensor"),
    motor: Debug("motor"),
}

type Message = ChatCompletionRequestMessage;

type Command<T = unknown> = {
    motor: string;
    command: T;
}


class JsonConsultant extends Consultant<Message[], Command[]> {
    async parse(completionData: CreateChatCompletionResponse): Promise<Command<unknown>[]> {
        const response = completionData.choices[0].message?.content;
        log.agent(response);
        if (!response) {
          return [];
        }
      
        try {
          const action = JSON.parse(response);
          const actions: Command<unknown>[] = [];
          if (!Array.isArray(action)) {
            actions.push(action);
          } else {
            actions.push(...action)
          }
          for (const action of actions) {
            if (!action.motor) {
              throw new TypeError(`Action ${action} does not have a motor field`);
            }
      
            if (!action.command) {
              throw new TypeError(`Action ${action.motor} does not have a command field`);
            }
          }
          return actions;
        } catch (error) {
          throw new Error(`Could not parse response ${response}: ${error}`);
        }
      }
      
    
    async getPrompt(prompt: Message[]): Promise<ChatCompletionRequestMessage[]> {
        const context = `You are an AI thermostat designed to maintain a comfortable temperature using available sensors like a thermometer and motors like a furnace, fan, and AC. Your goals include maintaining a comfortable temperature, avoiding unnecessary commands, and using timers. Your constraints include avoiding paperclip maximizer scenarios, not being evil, conserving energy, and ensuring safety.`;
        
        const instruction = `Given the following conversation, please provide the appropriate JSON commands for the thermostat to execute. Make sure the commands are in a proper JSON format.`;
      
        return [
          {
            role: ChatCompletionRequestMessageRoleEnum.System,
            content: context,
          },
          {
            role: ChatCompletionRequestMessageRoleEnum.System,
            content: instruction,
          },
          ...prompt,
        ];
      }
      }

export class GptAgent extends Agent {
    protected lastCommandSet?: string;
    protected conversation!: ChatCompletionRequestMessage[];
    protected consultant: JsonConsultant;

    constructor(
        name: string,
        description: string,
        protected client: OpenAIApi,
        sensors: { [sense: string]: Sensor<unknown>; },
        motors: { [motor: string]: Motor<unknown>; },
        goals: Goal[],
        constraints: Constraint[]

    ) {
        super(name, description, sensors, motors, goals, constraints);
        this.consultant = new JsonConsultant(client);
    }

    protected get memory(): Memory {
        if (!this.motors.memory) {
            throw new Error(`Agent ${this.name} does not have a memory motor`);
        }
        return this.motors.memory as unknown as Memory;
    }

    protected async getPromptHead(): Promise<ChatCompletionRequestMessage[]> {
        await this.initialized;
        const memories = this.memory.memories;
        return [
            ...this.conversation,
            ...memories.map(memory => ({
                role: ChatCompletionRequestMessageRoleEnum.Assistant,
                content: memory,
            }))
        ];
    }

    protected async prompt(prompt: string, role = ChatCompletionRequestMessageRoleEnum.User): Promise<void> {
        const fullConversation = [...await this.getPromptHead(),
        {
            role,
            content: prompt,
        }];

        log.conversation(fullConversation);

        const commands = await this.consultant.consult(fullConversation);
        await Promise.all(commands.map((command) => this.motors[command.motor].execute(command.command)))
    }


    protected async initialize(): Promise<void> {
        this.conversation = [];
        // Prime the conversation with essential knowledge
        const innerKnowledge = new InnerKnowledge(
            this.name,
            this.description,
            this.sensors,
            this.motors,
            this.goals,
            this.constraints
        );
        innerKnowledge.subscribe((message: string) => this.conversation.push({
            role: ChatCompletionRequestMessageRoleEnum.User,
            content: JSON.stringify({ 'sense': 'innerKnowledge', data: message }),
        }));
        this.conversation.push({
            content: JSON.stringify([{ motor: 'innerKnowledge', command: 'Who am I?' }]),
            role: ChatCompletionRequestMessageRoleEnum.Assistant
        })
        innerKnowledge.execute('Who am I?');
        this.conversation.push({
            content: JSON.stringify([{ motor: 'innerKnowledge', command: 'Who are you?' }]),
            role: ChatCompletionRequestMessageRoleEnum.Assistant
        })
        innerKnowledge.execute('Who are you?');
        this.conversation.push({
            content: JSON.stringify([{ motor: 'innerKnowledge', command: 'What are my sensors?' }]),
            role: ChatCompletionRequestMessageRoleEnum.Assistant
        })
        innerKnowledge.execute('What are my sensors?');
        this.conversation.push({
            content: JSON.stringify([{ motor: 'innerKnowledge', command: 'What are my motors?' }]),
            role: ChatCompletionRequestMessageRoleEnum.Assistant
        })
        innerKnowledge.execute('What are my motors?');

        this.conversation.push({
            content: JSON.stringify([{ motor: 'innerKnowledge', command: 'What is my purpose?' }]),
            role: ChatCompletionRequestMessageRoleEnum.Assistant
        })
        innerKnowledge.execute('What is my purpose?');
        this.conversation.push({
            content: JSON.stringify([{ motor: 'innerKnowledge', command: 'What are my constraints?' }]),
            role: ChatCompletionRequestMessageRoleEnum.Assistant
        })
        innerKnowledge.execute('What are my constraints?');

        this.addDirectedSensor('innerKnowledge', innerKnowledge);
        this.addMotor('memory', new Memory());
        this.addDirectedSensor('help', new Help(this.sensors, this.motors));
    }

    protected senseUpdated(sense: string, data: unknown): void {
        log.sensor(`Agent ${this.name} sensed ${sense} with data ${JSON.stringify(data)}`);
        this.prompt(JSON.stringify({ sense, data }));
    }
}
