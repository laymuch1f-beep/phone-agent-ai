import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';

@WebSocketGateway({ path: '/media-stream' })
export class MediaStreamGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connections = new Map<string, WebSocket>();

  handleConnection(client: WebSocket, request: any) {
    console.log('🔗 WebSocket Client connected to /media-stream');
    
    // Get call parameters from URL
    const url = new URL(request.url, `http://${request.headers.host}`);
    const callSid = url.searchParams.get('callSid');
    
    if (callSid) {
      console.log(`📞 WebSocket connected for Twilio call: ${callSid}`);
      this.connections.set(callSid, client);
      
      // Send welcome message
      client.send(JSON.stringify({
        event: 'connected',
        callSid,
        timestamp: new Date().toISOString()
      }));
    }

    client.on('message', (message: Buffer) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('📨 Received from Twilio:', data);
        
        // Here you would forward to OpenAI Realtime API
        // and handle the response
      } catch (e) {
        console.log('📨 Raw WebSocket message:', message.toString());
      }
    });

    client.on('error', (error) => {
      console.error('❌ WebSocket error:', error);
    });
  }

  handleDisconnect(client: WebSocket) {
    console.log('🔌 WebSocket Client disconnected');
    
    // Clean up
    for (const [callSid, ws] of this.connections.entries()) {
      if (ws === client) {
        this.connections.delete(callSid);
        console.log(`📞 Removed WebSocket for call: ${callSid}`);
        break;
      }
    }
  }
}