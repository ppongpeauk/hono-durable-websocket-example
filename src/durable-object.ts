import { DurableObject } from "cloudflare:workers";
import { Environment } from "@/types";

export class WebsocketDurableObject extends DurableObject<Environment> {
	constructor(ctx: DurableObjectState, env: Environment) {
		super(ctx, env);
	}

	async fetch(req: Request) {
		const websocketPair = new WebSocketPair();
		const [client, server] = Object.values(websocketPair);

		this.ctx.acceptWebSocket(server);

		return new Response(null, {
			status: 101,
			webSocket: client,
		});
	}

	webSocketError(ws: WebSocket, error: unknown) {
		ws.close();
	}

	webSocketClose(
		ws: WebSocket,
		_code: number,
		_reason: string,
		_wasClean: boolean
	) {
		ws.close();
	}

	async broadcast(message: string) {
		const webSockets = this.ctx.getWebSockets();
		console.log(
			`[Websocket Durable Object] message: ${message}, connections: ${webSockets.length}`
		);

		/**
		 * For some odd reason, when the durable object is
		 * waking up from hibernation, the websocket connections in this.connections
		 * are not available. But if we use the ctx.getWebSockets() method, it will always
		 * return the websocket connections.
		 */
		for (const ws of webSockets) {
			ws.send(message);
		}
	}
}
