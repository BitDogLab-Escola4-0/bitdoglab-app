interface SerialPort {
  readable: ReadableStream;
  writable: WritableStream;
  open: (options: { baudRate: number }) => Promise<void>;
  close: () => Promise<void>;
}

interface SerialPortRequestOptions {
  filters?: SerialPortFilter[];
}

interface SerialPortFilter {
  usbVendorId?: number;
  usbProductId?: number;
}

interface Navigator {
  serial: {
    requestPort: (options?: SerialPortRequestOptions) => Promise<SerialPort>;
    getPorts: () => Promise<SerialPort[]>;
  };
}