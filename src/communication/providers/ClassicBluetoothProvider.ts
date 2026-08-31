import type { IConnectionProvider } from "../interfaces/IConnectionProvider";

/**
 * Provider para conexão via Bluetooth Clássico
 */
export class ClassicBluetoothProvider implements IConnectionProvider {
  private deviceAddress: string;
  private socket: any;
  private isConnectedFlag: boolean = false;
  private onDataCallback: ((data: string) => void) | null = null;
  private onErrorCallback: ((error: Error) => void) | null = null;

  constructor(deviceAddress: string) {
    this.deviceAddress = deviceAddress;
  }

  async connect(): Promise<void> {
    try {
      // Implementar conexão com Bluetooth Clássico
      // Este é um exemplo de estrutura - a implementação real depende da API disponível

      const { bluetooth } = navigator as any;
      if (!bluetooth) {
        throw new Error("Bluetooth Clássico não suportado neste navegador");
      }

      // Conectar ao dispositivo
      this.socket = await this.createSocket(this.deviceAddress);
      this.isConnectedFlag = true;

      // Inicia leitura de dados
      this.startReading();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.onErrorCallback?.(err);
      throw err;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.socket) {
        this.socket.close();
      }
      this.isConnectedFlag = false;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.onErrorCallback?.(err);
      throw err;
    }
  }

  async sendCommand(command: string): Promise<void> {
    try {
      if (!this.socket || !this.isConnectedFlag) {
        throw new Error("Não conectado ao dispositivo Bluetooth");
      }

      const encoder = new TextEncoder();
      this.socket.send(encoder.encode(command + "\r\n"));
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
    return "BLUETOOTH_CLASSIC";
  }

  onData(callback: (data: string) => void): void {
    this.onDataCallback = callback;
  }

  onError(callback: (error: Error) => void): void {
    this.onErrorCallback = callback;
  }

  private async createSocket(_address: string): Promise<any> {
    // Implementação específica da API de Bluetooth Clássico
    // Este é um placeholder para a estrutura
    return Promise.resolve({
      send: () => {},
      close: () => {},
    });
  }

  private async startReading(): Promise<void> {
    try {
      // Lógica para leitura contínua de dados
      while (this.isConnectedFlag) {
        // Implementar lógica de leitura
        if (this.onDataCallback) {
          // Callback registrado para receber dados
        }
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    } catch (error) {
      if (this.isConnectedFlag) {
        const err = error instanceof Error ? error : new Error(String(error));
        this.onErrorCallback?.(err);
      }
    }
  }
}
