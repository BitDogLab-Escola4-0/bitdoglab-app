interface BluetoothSerial {
  list(): Promise<{
    devices: Array<{
      id: string;
      name: string;
      class: number;
      address: string;
      uuid: string;
    }>;
  }>;
  connect(macAddress_or_uuid: string): Promise<void>;
  disconnect(): Promise<void>;
  write(data: string): Promise<void>;
  subscribe(
    delimiter: string,
    success: (data: string) => void,
    failure?: (error: any) => void
  ): Promise<void>;
  unsubscribe(): Promise<void>;
  isEnabled(): Promise<void>;
  enable(): Promise<void>;
  isConnected(): Promise<void>;
}

interface Window {
  bluetoothSerial: BluetoothSerial;
}