import { EventEmitter } from "events";

declare global {
  // eslint-disable-next-line no-var
  var __chatEmitter: EventEmitter | undefined;
}

export const chatEmitter: EventEmitter =
  global.__chatEmitter || (global.__chatEmitter = new EventEmitter());

chatEmitter.setMaxListeners(200);
