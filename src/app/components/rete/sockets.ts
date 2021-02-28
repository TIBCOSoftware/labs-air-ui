import { Socket } from "rete";

export const numSocket = new Socket("Number value");
export const strSocket = new Socket("String");
export const jsonSocket = new Socket("Json");
export const eventSocket = new Socket("Event");
export const sqlResultSocket = new Socket("SQLResult");
export const errorSocket = new Socket("Error");