import { Motor } from "./Motor";
import { Sensor } from "./Sensor";

export interface DirectedSensor<M, S> extends Sensor<S>, Motor<M> { }
