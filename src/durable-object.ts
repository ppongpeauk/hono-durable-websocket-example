import { DurableObject } from "cloudflare:workers";
import { Environment } from "@/types";

export class WebsocketDurableObject extends DurableObject<Environment> {
	connections: Set<WebSocket>;

	constructor(ctx: DurableObjectState, env: Environment) {
		super(ctx, env);
		this.connections = new Set<WebSocket>();

		const websockets = this.ctx.getWebSockets();

		for (const ws of websockets) {
			this.connections.add(ws);
		}
	}

	async fetch(req: Request) {
		const websocketPair = new WebSocketPair();
		const [client, server] = Object.values(websocketPair);

		this.ctx.acceptWebSocket(server);
		this.connections.add(client);

		return new Response(null, {
			status: 101,
			webSocket: client,
		});
	}

	webSocketError(ws: WebSocket, error: unknown) {
		this.connections.delete(ws);
	}

	webSocketClose(
		ws: WebSocket,
		_code: number,
		_reason: string,
		_wasClean: boolean
	) {
		this.connections.delete(ws);
	}

	async broadcast(message: string) {
		for (const connection of this.connections) {
			connection.send(message);
		}
	}
}
