import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';

@WebSocketGateway({
  path: '/media-stream',
  cors: {
    origin: '*',
  },
})
export class MediaStreamGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server; // Add ! to tell TypeScript it will be initialized

  private connections = new Map<string, WebSocket>();

  handleConnection(client: WebSocket, request: any) {
    console.log('🔗 WebSocket Client connected to /media-stream');
    
    try {
      // Get call parameters from URL
      const url = new URL(request.url, `http://${request.headers.host}`);
      const callSid = url.searchParams.get('callSid');
      const from = url.searchParams.get('from');
      const to = url.searchParams.get('to');
      
      if (callSid) {
        console.log(`✅ WebSocket registered for Twilio call: ${callSid}`);
        this.connections.set(callSid, client);
        
        // Store metadata
        (client as any).callSid = callSid;
        (client as any).from = from;
        (client as any).to = to;
        (client as any).connectedAt = new Date();

        // Send welcome message
        const welcomeMessage = {
          event: 'connected',
          protocol: 'Call',
          version: '1.0.0',
          callSid,
          streamSid: `MD${Date.now()}`,
          timestamp: new Date().toISOString()
        };

        client.send(JSON.stringify(welcomeMessage));
      } else {
        console.warn('⚠️ WebSocket connected without callSid');
      }

    } catch (error) {
      console.error('❌ Error handling WebSocket connection:', error);
    }
  }

  handleDisconnect(client: WebSocket) {
    console.log('🔌 WebSocket Client disconnected');
    
    // Clean up
    for (const [callSid, ws] of this.connections.entries()) {
      if (ws === client) {
        this.connections.delete(callSid);
        break;
      }
    }
  }
}