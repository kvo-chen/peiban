import type { WebSocketEvent } from '../types';

// WebSocket服务类
class WebSocketService {
  private ws: WebSocket | null = null;
  private userId: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private eventHandlers: Map<string, Array<(data: any) => void>> = new Map();

  // 初始化WebSocket连接
  public init() {
    const user = localStorage.getItem('user');
    if (user) {
      const parsedUser = JSON.parse(user);
      this.userId = parsedUser.id;
    }

    if (!this.userId) {
      console.error('User ID not found, cannot initialize WebSocket connection');
      return;
    }

    try {
      // 创建WebSocket连接
      this.ws = new WebSocket(`ws://localhost:3001?userId=${this.userId}`);

      // 连接打开事件
      this.ws.onopen = () => {
        console.log('WebSocket connection established');
        this.reconnectAttempts = 0;
      };

      // 接收消息事件
      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketEvent = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      // 连接关闭事件
      this.ws.onclose = () => {
        console.log('WebSocket connection closed');
        this.handleReconnect();
      };

      // 连接错误事件
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to initialize WebSocket connection:', error);
      this.handleReconnect();
    }
  }

  // 处理消息
  private handleMessage(message: WebSocketEvent) {
    const { type, data } = message;
    
    // 调用对应类型的事件处理器
    const handlers = this.eventHandlers.get(type) || [];
    handlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error(`Error handling ${type} event:`, error);
      }
    });
  }

  // 处理重连
  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.init();
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('Max reconnect attempts reached, stopping reconnection');
    }
  }

  // 注册事件处理器
  public on(eventType: string, handler: (data: any) => void) {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType)?.push(handler);
  }

  // 移除事件处理器
  public off(eventType: string, handler: (data: any) => void) {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
      if (handlers.length === 0) {
        this.eventHandlers.delete(eventType);
      }
    }
  }

  // 发送消息
  public send(message: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected, cannot send message');
    }
  }

  // 关闭WebSocket连接
  public close() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// 导出单例实例
export default new WebSocketService();
