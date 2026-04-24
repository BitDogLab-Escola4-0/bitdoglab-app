import type { IConnectionProvider } from "../interfaces/IConnectionProvider";

/**
 * Provider para conexão via cabo (Web Serial API)
 */
export class CableProvider implements IConnectionProvider {
  private port: any;
  private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  private isConnectedFlag: boolean = false;
  private onDataCallback: ((data: string) => void) | null = null;
  private onErrorCallback: ((error: Error) => void) | null = null;

  async connect(): Promise<void> {
    try {
      const { serial } = navigator as any;
      if (!serial) {
        throw new Error("Web Serial API não suportada neste navegador");
      }

      this.port = await serial.requestPort();
      await this.port.open({ baudRate: 115200 });

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
      if (this.reader) {
        await this.reader.cancel();
      }
      if (this.port) {
        await this.port.close();
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
      if (!this.port || !this.isConnectedFlag) {
        throw new Error("Não conectado ao dispositivo");
      }

      const writer = this.port.writable.getWriter();
      const encoder = new TextEncoder();
      await writer.write(encoder.encode(command + "\r\n"));
      writer.releaseLock();
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
    return "CABLE";
  }

  onData(callback: (data: string) => void): void {
    this.onDataCallback = callback;
  }

  onError(callback: (error: Error) => void): void {
    this.onErrorCallback = callback;
  }

  private async startReading(): Promise<void> {
    try {
      this.reader = this.port.readable.getReader();

      while (this.isConnectedFlag) {
        const { value, done } = await this.reader.read();
        if (done) break;

        const decoder = new TextDecoder();
        const data = decoder.decode(value);
        this.onDataCallback?.(data);
      }
    } catch (error) {
      if (this.isConnectedFlag) {
        const err = error instanceof Error ? error : new Error(String(error));
        this.onErrorCallback?.(err);
      }
    }
  }
}
