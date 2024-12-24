import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
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
		responses: {
			200: {
				description: "Message broadcasted successfully.",
			},
		},
	}),
	(c) => {
		const stub = c.get("durableObjectStub");
		stub.broadcast("This is a test message over a websocket.");
		return c.json({ success: true });
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
