import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { doMiddleware } from "@/middleware";
import { WebsocketDurableObject } from "@/durable-object";
import { HonoGeneric } from "@/types";
import { apiReference } from "@scalar/hono-api-reference";

const app = new OpenAPIHono<HonoGeneric>();

app.use("*", doMiddleware);

app.openapi(
	createRoute({
		method: "post",
		path: "/broadcast",
		description: "Broadcast a message to all connected clients.",
		request: {
			body: {
				content: {
					"application/json": {
						schema: z.object({
							message: z.string().openapi({
								description: "The message to broadcast.",
								example:
									"This is a test message over a websocket.",
							}),
						}),
					},
				},
			},
		},
		responses: {
			204: {
				description: "Message broadcasted successfully.",
			},
		},
	}),
	async (c) => {
		const { message } = await c.req.json();
		const stub = c.get("durableObjectStub");
		await stub.broadcast(message);
		return c.text(null as any, 204);
	}
);

/**
 * Websocket Route
 */
app.openapi(
	createRoute({
		method: "get",
		path: "/ws",
		description: "Connect to the websocket.",
		responses: {
			200: {
				description: "Successfully connected to the websocket.",
			},
			426: {
				description: "Not a websocket request.",
			},
		},
	}),
	async (c) => {
		if (c.req.header("upgrade") !== "websocket") {
			return c.text("Not a websocket request.", 426);
		}

		const stub = c.get("durableObjectStub");
		return stub.fetch(c.req.raw);
	}
);

/**
 * API Documentation
 */
app.doc("/openapi", {
	openapi: "3.0.0",
	info: {
		version: "1.0.0",
		title: "Hono Durable Object Websocket Example",
	},
});

app.get(
	"/",
	apiReference({
		theme: "saturn",
		spec: { url: "/openapi" },
	})
);

export { WebsocketDurableObject };
export default app;
