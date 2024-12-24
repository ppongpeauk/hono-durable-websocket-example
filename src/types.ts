import { WebsocketDurableObject } from "@/durable-object";
import { Context } from "hono";

export type Bindings = {
	DO_WEBSOCKET: DurableObjectNamespace<WebsocketDurableObject>;
};

export type Environment = {
	durableObjectStub: DurableObjectStub<WebsocketDurableObject>;
};

export type HonoGeneric = {
	Variables: Environment;
	Bindings: Bindings;
};
export type ContextGeneric = Context<HonoGeneric>;
