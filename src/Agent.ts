import { OpenAIApi } from "openai";
import { Motor } from "./Motor";
import { DirectedSensor } from "./DirectedSensor";
import { Goal } from "./Goal";
import { Constraint } from "./Constraint";
import { Sensor } from "./Sensor";
import { InnerKnowledge } from "./InnerKnowledge";
import { Help } from "./Help";
import { Memory } from "./Memory";

export abstract class Agent {
    readonly initialized: Promise<void>;
    constructor(
        readonly name: string,
        protected description: string,
        protected sensors: { [sense: string]: Sensor<unknown>; },
        protected motors: { [motor: string]: Motor<unknown>; },
        protected goals: Goal[],
        protected constraints: Constraint[]
    ) {
        this.initialized = this.initialize().then(() => {
            for (const sense in this.sensors) {
                const sensor = sensors[sense];
                sensor.subscribe((data) => this.senseUpdated(sense, data));
            }
        });
    }

    protected abstract initialize(): Promise<void>;
    protected abstract senseUpdated(sense: string, data: unknown): void;

    addDirectedSensor(name: string, sensor: DirectedSensor<unknown, unknown>): void {
        this.addSensor(name, sensor);
        this.addMotor(name, sensor);
    }

    removeDirectedSensor(name: string): void {
        this.removeMotor(name);
        this.removeSensor(name);
    }

    addSensor(name: string, sensor: Sensor<unknown>): void {
        if (name in this.sensors) {
            throw new Error(`Sensor ${name} already exists`);
        }
        this.sensors[name] = sensor;
    }

    removeSensor(name: string): void {
        if (name in this.sensors) {
            delete this.sensors[name];
        }
    }

    addMotor(name: string, motor: Motor<unknown>): void {
        if (name in this.motors) {
            throw new Error(`Motor ${motor} already exists`);
        }
        this.motors[name] = motor;
    }

    removeMotor(name: string): void {
        if (name in this.motors) {
            delete this.motors[name];
        }
    }

    addGoal(goal: string): void {
        this.goals.push(goal);
    }

    removeGoal(goal: string): void {
        this.goals = this.goals.filter((g) => g !== goal);
    }

    addConstraint(constraint: string): void {
        this.constraints.push(constraint);
    }

    removeConstraint(constraint: string): void {
        this.constraints = this.constraints.filter((c) => c !== constraint);
    }
}
