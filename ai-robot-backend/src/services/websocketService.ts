import { WebSocketServer, WebSocket } from 'ws';
import { Server as HttpServer } from 'http';

// WebSocket服务类
class WebSocketService {
  private wss!: WebSocketServer; // 使用!表示非空断言
  private clients: Map<number, WebSocket[]> = new Map(); // 存储用户ID到WebSocket客户端的映射

  // 初始化WebSocket服务器
  public init(server: HttpServer) {
    this.wss = new WebSocketServer({ server });

    this.wss.on('connection', (ws, req) => {
      // 从请求中获取用户ID，这里假设通过查询参数传递
      const url = new URL(req.url || '', `http://${req.headers.host}`);
      const userIdStr = url.searchParams.get('userId');
      
      if (userIdStr) {
        const userId = parseInt(userIdStr);
        
        // 添加客户端到映射
        if (!this.clients.has(userId)) {
          this.clients.set(userId, []);
        }
        this.clients.get(userId)?.push(ws);

        console.log(`WebSocket client connected for user ${userId}`);

        // 监听客户端关闭连接
        ws.on('close', () => {
          console.log(`WebSocket client disconnected for user ${userId}`);
          // 从映射中移除客户端
          const userClients = this.clients.get(userId) || [];
          const index = userClients.indexOf(ws);
          if (index > -1) {
            userClients.splice(index, 1);
          }
          // 如果该用户没有客户端了，移除用户映射
          if (userClients.length === 0) {
            this.clients.delete(userId);
          }
        });

        // 监听客户端消息
        ws.on('message', (message) => {
          console.log(`Received message from user ${userId}: ${message}`);
          // 可以在这里处理客户端发送的消息
        });
      }
    });

    console.log('WebSocket server initialized');
  }

  // 向特定用户推送消息
  public sendToUser(userId: number, message: any) {
    const userClients = this.clients.get(userId) || [];
    userClients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }

  // 向所有用户推送消息
  public broadcast(message: any) {
    this.wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }

  // 推送设备状态更新
  public sendDeviceStatusUpdate(userId: number, deviceId: number, status: 'online' | 'offline') {
    this.sendToUser(userId, {
      type: 'device_status_update',
      data: {
        deviceId,
        status,
        timestamp: new Date().toISOString()
      }
    });
  }

  // 关闭WebSocket服务器
  public close() {
    this.wss.close();
  }
}

// 导出单例实例
export default new WebSocketService();