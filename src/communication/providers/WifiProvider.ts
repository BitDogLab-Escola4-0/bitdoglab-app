import type { IConnectionProvider } from "../interfaces/IConnectionProvider";

/**
 * Provider para conexão via WiFi (WebSocket)
 */
export class WifiProvider implements IConnectionProvider {
  private ip: string;
  private port: number;
  private websocket: WebSocket | null = null;
  private isConnectedFlag: boolean = false;
  private onDataCallback: ((data: string) => void) | null = null;
  private onErrorCallback: ((error: Error) => void) | null = null;

  constructor(ip: string = "192.168.1.100", port: number = 8080) {
    this.ip = ip;
    this.port = port;
  }

  async connect(): Promise<void> {
    try {
      const url = `ws://${this.ip}:${this.port}`;

      this.websocket = new WebSocket(url);

      this.websocket.onopen = () => {
        this.isConnectedFlag = true;
      };

      this.websocket.onmessage = (event) => {
        this.onDataCallback?.(event.data);
      };

      this.websocket.onerror = (error) => {
        const err = new Error("Erro na conexão WebSocket");
        this.onErrorCallback?.(err);
      };

      this.websocket.onclose = () => {
        this.isConnectedFlag = false;
      };

      // Aguarda a conexão ser estabelecida
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("Timeout na conexão WiFi"));
        }, 5000);

        const originalOnopen = this.websocket!.onopen;
        this.websocket!.onopen = (event) => {
          clearTimeout(timeout);
          originalOnopen?.call(this.websocket!, event);
          resolve();
        };
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.onErrorCallback?.(err);
      throw err;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.websocket) {
        this.websocket.close();
        this.isConnectedFlag = false;
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.onErrorCallback?.(err);
      throw err;
    }
  }

  async sendCommand(command: string): Promise<void> {
    try {
      if (!this.websocket || !this.isConnectedFlag) {
        throw new Error("Não conectado ao dispositivo WiFi");
      }

      this.websocket.send(command + "\r\n");
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.onErrorCallback?.(err);
      throw err;
    }
  }

  isConnected(): boolean {
    return this.isConnectedFlag;
  }

  getConnectionType(): string {
    return "WIFI";
  }

  onData(callback: (data: string) => void): void {
    this.onDataCallback = callback;
  }

  onError(callback: (error: Error) => void): void {
    this.onErrorCallback = callback;
  }
}
