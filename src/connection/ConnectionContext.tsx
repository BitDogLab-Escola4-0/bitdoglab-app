import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import { useWifi } from "../hooks/useWifi";

export enum ConnectionType {
  CABLE = "cable",
  BLUETOOTH = "bluetooth",
  WIFI = "wifi",
  NONE = "none",
}

interface BluetoothDevice {
  id: string;
  name: string;
  address: string;
}

interface ConnectionContextType {
  isConnected: boolean;
  connectionType: ConnectionType;
  serialPort: any;
  availableDevices: BluetoothDevice[];
  // 🆕 Estados WiFi
  wifiLogs: string[];
  wifiError: string | null;
  connectCable: () => Promise<void>;
  connectBluetooth: (deviceId: string) => Promise<void>;
  connectWifi: (ip?: string, port?: number) => Promise<void>;
  disconnect: () => Promise<void>;
  sendCommand: (command: string) => Promise<void>;
  scanBluetoothDevices: () => Promise<void>;
   // 🆕 Métodos WiFi
  clearWifiLogs: () => void;
  clearWifiError: () => void;
}

const BAUD_RATE = 9600;
const COMMAND_TERMINATOR = "\r\n";
const BLUETOOTH_DELIMITER = "\n";
const CONNECTION_CHECK_INTERVAL = 5000;
const BLUETOOTH_ERRORS = ["bt socket closed", "read return: -1", "IOException", "disconnected", "Connection lost", "Device not connected"];
// 🆕 Configurações padrão WiFi
const DEFAULT_WIFI_IP = "192.168.1.100"; // IP padrão da Pico W
const DEFAULT_WIFI_PORT = 8080;

const ConnectionContext = createContext<ConnectionContextType | undefined>(undefined);

export const ConnectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionType, setConnectionType] = useState<ConnectionType>(ConnectionType.NONE);
  const [serialPort, setSerialPort] = useState<any>(null);
  const [reader, setReader] = useState<any>(null);
  const [availableDevices, setAvailableDevices] = useState<BluetoothDevice[]>([]);

  // 🆕 Hook WiFi
  const {
    isConnected: isWifiConnected,
    //isConnecting: isWifiConnecting,
    logs: wifiLogs,
    error: wifiError,
    connect: connectWifiDirect,
    send: sendWifi,
    disconnect: disconnectWifi,
    clearLogs: clearWifiLogs,
    clearError: clearWifiError
  } = useWifi();

  const promisifyBluetooth = useCallback(<T,>(fn: (...args: any[]) => void, ...args: any[]): Promise<T> => 
    new Promise((resolve, reject) => fn(...args, resolve, reject)), []);

  const resetConnection = useCallback(() => {
    setIsConnected(false);
    setConnectionType(ConnectionType.NONE);
  }, []);

  const isBluetoothError = useCallback((error: any): boolean => {
    const errorStr = error?.toString?.() || JSON.stringify(error) || "";
    return BLUETOOTH_ERRORS.some(keyword => errorStr.includes(keyword));
  }, []);

  const ensureBluetoothEnabled = useCallback(async () => {
    try {
      await promisifyBluetooth(window.bluetoothSerial.isEnabled);
    } catch {
      await promisifyBluetooth(window.bluetoothSerial.enable).catch(() => {
        throw new Error("Por favor, ative o Bluetooth do dispositivo");
      });
    }
  }, [promisifyBluetooth]);

  const handleBluetoothError = useCallback((error: any) => {
    console.error("Erro Bluetooth:", error);
    if (isBluetoothError(error)) {
      resetConnection();
      try { window.bluetoothSerial.unsubscribe().catch(() => {}); } catch {}
    } else {
      resetConnection();
    }
  }, [isBluetoothError, resetConnection]);

  const connectCable = useCallback(async () => {
    if (!navigator.serial) throw new Error("Web Serial API não é suportada neste navegador");
    
    try {
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: BAUD_RATE });
      
      setSerialPort(port);
      setConnectionType(ConnectionType.CABLE);
      setIsConnected(true);
      
      // Leitura assíncrona
      const portReader = port.readable.getReader();
      setReader(portReader);
      const decoder = new TextDecoder();
      
      (async () => {
        try {
          while (true) {
            const { value, done } = await portReader.read();
            if (done) break;
            if (false) {
              console.log("Recebido da Serial:", decoder.decode(value));
            }
            // Dados recebidos podem ser processados aqui se necessário
          }
        } catch (error) {
          resetConnection();
          console.error("Erro na leitura Serial:", error);
        } finally {
          portReader.releaseLock();
        }
      })();
    } catch (error) {
      console.error("Erro na conexão Serial:", error);
      resetConnection();
      throw error;
    }
  }, [resetConnection]);

  const scanBluetoothDevices = useCallback(async () => {
    try {
      await ensureBluetoothEnabled();
      const devices = await promisifyBluetooth<BluetoothDevice[]>(window.bluetoothSerial.list);
      setAvailableDevices(devices);
    } catch (error) {
      console.error("Erro na busca Bluetooth:", error);
      throw new Error("Falha ao buscar dispositivos Bluetooth");
    }
  }, [ensureBluetoothEnabled, promisifyBluetooth]);

  const connectBluetooth = useCallback(async (deviceId: string) => {
    try {
      if (isConnected) await disconnect();
      await ensureBluetoothEnabled();
      
      await promisifyBluetooth(window.bluetoothSerial.connect, deviceId);
      
      window.bluetoothSerial.subscribe(
        BLUETOOTH_DELIMITER,
        (data: string) => console.log("Recebido do Bluetooth:", data),
        handleBluetoothError
      );
      
      setConnectionType(ConnectionType.BLUETOOTH);
      setIsConnected(true);
    } catch (error) {
      console.error("Erro na conexão Bluetooth:", error);
      throw new Error("Falha ao conectar ao dispositivo Bluetooth");
    }
  }, [isConnected, ensureBluetoothEnabled, promisifyBluetooth, handleBluetoothError]);

  // 🆕 Método de conexão WiFi
  const connectWifi = useCallback(async (ip: string = DEFAULT_WIFI_IP, port: number = DEFAULT_WIFI_PORT) => {
    try {
      console.log(`📶 Conectando via WiFi em ${ip}:${port}...`);
      
      // Se já estiver conectado em outro tipo, desconecta primeiro
      if (isConnected && connectionType !== ConnectionType.WIFI) {
        await disconnect();
      }
      
      // Tenta conectar usando o hook WiFi
      const success = await connectWifiDirect({ ip, port });
      
      if (success) {
        setConnectionType(ConnectionType.WIFI);
        setIsConnected(true);
        console.log("✅ Conectado com sucesso via WiFi");
      } else {
        throw new Error("Falha na conexão WiFi");
      }
    } catch (error) {
      console.error("Erro na conexão WiFi:", error);
      throw new Error("Falha ao conectar via WiFi");
    }
  }, [isConnected, connectionType, connectWifiDirect]);

  const disconnect = useCallback(async () => {
    try {
      if (connectionType === ConnectionType.CABLE) {
        if (reader) {
          await reader.cancel();
          reader.releaseLock();
        }
        if (serialPort) await serialPort.close();
        setSerialPort(null);
        setReader(null);
      } else if (connectionType === ConnectionType.BLUETOOTH) {
        try { await promisifyBluetooth(window.bluetoothSerial.unsubscribe); } catch {}
        await promisifyBluetooth(window.bluetoothSerial.disconnect);
      } else if (connectionType === ConnectionType.WIFI) {
        // 🆕 Desconexão WiFi
        await disconnectWifi();
      }
      resetConnection();
    } catch (error) {
      console.error("Erro ao desconectar:", error);
      throw new Error("Falha ao desconectar do dispositivo");
    }
  }, [connectionType, reader, serialPort, promisifyBluetooth, resetConnection]);

  const sendCommand = useCallback(async (command: string) => {
    if (!isConnected) throw new Error("Não conectado a nenhum dispositivo");
    
    const fullCommand = command + COMMAND_TERMINATOR;
    
    try {
      if (connectionType === ConnectionType.CABLE) {
        const writer = serialPort.writable.getWriter();
        try {
          await writer.write(new TextEncoder().encode(fullCommand));
        } finally {
          writer.releaseLock();
        }
      } else if (connectionType === ConnectionType.BLUETOOTH) {
        await promisifyBluetooth(window.bluetoothSerial.write, fullCommand);
      }else if (connectionType === ConnectionType.WIFI) {
        // 🆕 Envio via WiFi
        const success = await sendWifi(command);
        if (!success) {
          throw new Error("Falha ao enviar comando via WiFi");
        }
      }
      
      console.log(`📤 Comando enviado via ${connectionType}:`, command);
    } catch (error) {
      console.error("Erro ao enviar comando:", error);
      if (connectionType === ConnectionType.BLUETOOTH) handleBluetoothError(error);
      throw new Error("Falha ao enviar comando ao dispositivo");
    }
  }, [isConnected, connectionType, serialPort, promisifyBluetooth, handleBluetoothError]);

  // 🔄 Efeito para sincronizar estado WiFi com o contexto
  useEffect(() => {
    if (connectionType === ConnectionType.WIFI) {
      if (!isWifiConnected && isConnected) {
        console.log("📶 WiFi foi desconectado externamente");
        resetConnection();
      }
    }
  }, [isWifiConnected, isConnected, connectionType, resetConnection]);

  // Cleanup e verificação periódica
  useEffect(() => {
    return () => { if (isConnected) disconnect().catch(console.error); };
  }, [isConnected, disconnect]);

  useEffect(() => {
    if (!isConnected || connectionType !== ConnectionType.BLUETOOTH) return;
    
    const interval = setInterval(async () => {
      try {
        await promisifyBluetooth(window.bluetoothSerial.isConnected);
      } catch (error) {
        handleBluetoothError(error);
      }
    }, CONNECTION_CHECK_INTERVAL);
    
    return () => clearInterval(interval);
  }, [isConnected, connectionType, promisifyBluetooth, handleBluetoothError]);

  return (
    <ConnectionContext.Provider value={{
      isConnected, connectionType, serialPort, availableDevices,
      // 🆕 Estados WiFi
      wifiLogs,
      wifiError,
      connectCable, connectBluetooth, connectWifi, disconnect, sendCommand, scanBluetoothDevices,
      // 🆕 Métodos WiFi
      clearWifiLogs,
      clearWifiError,
    }}>
      {children}
    </ConnectionContext.Provider>
  );
};

export const useConnection = () => {
  const context = useContext(ConnectionContext);
  if (!context) throw new Error("useConnection must be used within a ConnectionProvider");
  return context;
};