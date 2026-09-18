import type { IConnectionProvider } from "../interfaces/IConnectionProvider";
import type { BleDevice } from "@capacitor-community/bluetooth-le";
import {
  BleClient,
  textToDataView,
  dataViewToText,
} from "@capacitor-community/bluetooth-le";

/**
 * Provider para conexão via Bluetooth Low Energy (BLE)
 */
export class BleProvider implements IConnectionProvider {
  private device: BleDevice | null = null;
  private isConnectedFlag: boolean = false;
  private onDataCallback: ((data: string) => void) | null = null;
  private onErrorCallback: ((error: Error) => void) | null = null;
  private serviceUUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e"; // NUS Service UUID
  private txCharacteristicUUID = "6e400003-b5a3-f393-e0a9-e50e24dcca9e"; // TX Characteristic
  private rxCharacteristicUUID = "6e400002-b5a3-f393-e0a9-e50e24dcca9e"; // RX Characteristic

  constructor(device: BleDevice) {
    this.device = device;
  }

  async connect(): Promise<void> {
    try {
      if (!this.device) {
        throw new Error("Dispositivo BLE não definido");
      }

      await BleClient.connect(this.device.deviceId, (deviceId) => {
        console.log(`Dispositivo BLE desconectado: ${deviceId}`);
        this.isConnectedFlag = false;
      });

      this.isConnectedFlag = true;

      // Inicia notificações
      await this.startNotifications();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.onErrorCallback?.(err);
      throw err;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.device && this.isConnectedFlag) {
        await BleClient.stopNotifications(
          this.device.deviceId,
          this.serviceUUID,
          this.rxCharacteristicUUID
        ).catch(() => {});
        await BleClient.disconnect(this.device.deviceId);
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
      if (!this.device || !this.isConnectedFlag) {
        throw new Error("Não conectado ao dispositivo BLE");
      }

      const dataView = textToDataView(command + "\r\n");

      await BleClient.write(
        this.device.deviceId,
        this.serviceUUID,
        this.txCharacteristicUUID,
        dataView
      );
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
    return "BLUETOOTH_LE";
  }

  onData(callback: (data: string) => void): void {
    this.onDataCallback = callback;
  }

  onError(callback: (error: Error) => void): void {
    this.onErrorCallback = callback;
  }

  private async startNotifications(): Promise<void> {
    try {
      if (!this.device) return;

      await BleClient.startNotifications(
        this.device.deviceId,
        this.serviceUUID,
        this.rxCharacteristicUUID,
        (value: DataView) => {
          const data = dataViewToText(value);
          this.onDataCallback?.(data);
        }
      );
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.onErrorCallback?.(err);
    }
  }
}

