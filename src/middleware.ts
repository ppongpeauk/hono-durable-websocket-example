import { Next } from "hono";
import { ContextGeneric } from "@/types";

export const doMiddleware = async (ctx: ContextGeneric, next: Next) => {
	const id = ctx.env.DO_WEBSOCKET.idFromName("default");
	const durableObjectStub = ctx.env.DO_WEBSOCKET.get(id);

	await ctx.set("durableObjectStub", durableObjectStub);

	await next();
};
