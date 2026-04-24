import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import { useBluetoothLE } from "../hooks/useBluetoothLE";
import { useWifi } from "../hooks/useWifi"; // Importa o hook WiFi
import type { BleDevice } from '@capacitor-community/bluetooth-le';

// Adicionamos WiFi como novo tipo de conexão
export enum ConnectionType {
  CABLE = "cable",
  BLUETOOTH_CLASSIC = "bluetooth_classic",
  BLUETOOTH_LE = "bluetooth_le",
  WIFI = "wifi",           // 🆕 Novo tipo WiFi
  NONE = "none",
}

// Interface para dispositivos Bluetooth Clássico
interface BluetoothDevice {
  id: string;
  name: string;
  address: string;
}

// Interface expandida para suportar WiFi
interface ConnectionContextType {
  isConnected: boolean;
  connectionType: ConnectionType;
  serialPort: any;
  
  // Dispositivos Bluetooth Clássico
  availableDevices: BluetoothDevice[];
  
  // Dispositivos BLE
  bleDevices: BleDevice[];
  isBleScanning: boolean;
  connectedBleDevice?: BleDevice;
  bleError: string | null;
  
  // 🆕 Estados WiFi
  wifiLogs: string[];
  wifiError: string | null;
  
  // Métodos de conexão
  connectCable: () => Promise<void>;
  connectBluetoothClassic: (deviceId: string) => Promise<void>;
  connectBluetoothLE: (device: BleDevice) => Promise<void>;
  connectWifi: (ip?: string, port?: number) => Promise<void>;  // 🆕 Novo método WiFi
  disconnect: () => Promise<void>;
  
  // Envio de comandos
  sendCommand: (command: string) => Promise<void>;
  
  // Métodos de escaneamento
  scanBluetoothDevices: () => Promise<void>;
  scanBleDevices: () => Promise<void>;
  
  // 🆕 Métodos WiFi
  clearWifiLogs: () => void;
  clearWifiError: () => void;
  
  // Métodos BLE
  clearBleError: () => void;
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
  // Estados originais (Serial + Bluetooth Clássico)
  const [isConnected, setIsConnected] = useState(false);
  const [connectionType, setConnectionType] = useState<ConnectionType>(ConnectionType.NONE);
  const [serialPort, setSerialPort] = useState<any>(null);
  const [reader, setReader] = useState<any>(null);
  const [availableDevices, setAvailableDevices] = useState<BluetoothDevice[]>([]);

  // Hook BLE
  const {
    devices: bleDevices,
    isConnected: isBleConnected,
    connectedDevice: connectedBleDevice,
    isScanning: isBleScanning,
    error: bleError,
    scan: scanBle,
    connect: connectBle,
    disconnect: disconnectBle,
    writeData: writeBleData,
    clearError: clearBleError
  } = useBluetoothLE();

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

  // Utilitários existentes (mantidos)
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

  // Método de conexão Serial (mantido)
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

  // Método de escaneamento Bluetooth Clássico (mantido)
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

  // Método de conexão Bluetooth Clássico (mantido)
  const connectBluetoothClassic = useCallback(async (deviceId: string) => {
    try {
      if (isConnected) await disconnect();
      await ensureBluetoothEnabled();
      
      await promisifyBluetooth(window.bluetoothSerial.connect, deviceId);
      
      window.bluetoothSerial.subscribe(
        BLUETOOTH_DELIMITER,
        (data: string) => console.log("Recebido do Bluetooth:", data),
        handleBluetoothError
      );
      
      setConnectionType(ConnectionType.BLUETOOTH_CLASSIC);
      setIsConnected(true);
    } catch (error) {
      console.error("Erro na conexão Bluetooth:", error);
      throw new Error("Falha ao conectar ao dispositivo Bluetooth");
    }
  }, [isConnected, ensureBluetoothEnabled, promisifyBluetooth, handleBluetoothError]);

  // Método de escaneamento BLE (mantido)
  const scanBleDevices = useCallback(async () => {
    try {
      console.log("🔍 Iniciando escaneamento BLE...");
      await scanBle();
    } catch (error) {
      console.error("Erro no escaneamento BLE:", error);
      throw new Error("Falha ao buscar dispositivos BLE");
    }
  }, [scanBle]);

  // Método de conexão BLE (mantido)
  const connectBluetoothLE = useCallback(async (device: BleDevice) => {
    try {
      console.log("🔵 Conectando ao dispositivo BLE:", device.name || device.deviceId);
      
      if (isConnected && connectionType !== ConnectionType.BLUETOOTH_LE) {
        await disconnect();
      }
      
      const success = await connectBle(device);
      
      if (success) {
        setConnectionType(ConnectionType.BLUETOOTH_LE);
        setIsConnected(true);
        console.log("✅ Conectado com sucesso ao BLE");
      } else {
        throw new Error("Falha na conexão BLE");
      }
    } catch (error) {
      console.error("Erro na conexão BLE:", error);
      throw new Error("Falha ao conectar ao dispositivo BLE");
    }
  }, [isConnected, connectionType, connectBle]);

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

  // Método de desconexão (atualizado para WiFi)
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
      } else if (connectionType === ConnectionType.BLUETOOTH_CLASSIC) {
        try { await promisifyBluetooth(window.bluetoothSerial.unsubscribe); } catch {}
        await promisifyBluetooth(window.bluetoothSerial.disconnect);
      } else if (connectionType === ConnectionType.BLUETOOTH_LE) {
        await disconnectBle();
      } else if (connectionType === ConnectionType.WIFI) {
        // 🆕 Desconexão WiFi
        await disconnectWifi();
      }
      resetConnection();
    } catch (error) {
      console.error("Erro ao desconectar:", error);
      throw new Error("Falha ao desconectar do dispositivo");
    }
  }, [connectionType, reader, serialPort, promisifyBluetooth, resetConnection, disconnectBle, disconnectWifi]);

  // Método de envio de comandos (atualizado para WiFi)
  const sendCommand = useCallback(async (command: string) => {
    if (!isConnected) throw new Error("Não conectado a nenhum dispositivo");
    
    try {
      if (connectionType === ConnectionType.CABLE) {
        const fullCommand = command + COMMAND_TERMINATOR;
        const writer = serialPort.writable.getWriter();
        try {
          await writer.write(new TextEncoder().encode(fullCommand));
        } finally {
          writer.releaseLock();
        }
      } else if (connectionType === ConnectionType.BLUETOOTH_CLASSIC) {
        const fullCommand = command + COMMAND_TERMINATOR;
        await promisifyBluetooth(window.bluetoothSerial.write, fullCommand);
      } else if (connectionType === ConnectionType.BLUETOOTH_LE) {
        const success = await writeBleData(command);
        if (!success) {
          throw new Error("Falha ao enviar comando via BLE");
        }
      } else if (connectionType === ConnectionType.WIFI) {
        // 🆕 Envio via WiFi
        const success = await sendWifi(command);
        if (!success) {
          throw new Error("Falha ao enviar comando via WiFi");
        }
      }
      
      console.log(`📤 Comando enviado via ${connectionType}:`, command);
    } catch (error) {
      console.error("Erro ao enviar comando:", error);
      if (connectionType === ConnectionType.BLUETOOTH_CLASSIC) handleBluetoothError(error);
      throw new Error("Falha ao enviar comando ao dispositivo");
    }
  }, [isConnected, connectionType, serialPort, promisifyBluetooth, handleBluetoothError, writeBleData, sendWifi]);

  // 🔄 Efeito para sincronizar estado BLE com o contexto
  useEffect(() => {
    if (connectionType === ConnectionType.BLUETOOTH_LE) {
      if (!isBleConnected && isConnected) {
        console.log("🔵 BLE foi desconectado externamente");
        resetConnection();
      }
    }
  }, [isBleConnected, isConnected, connectionType, resetConnection]);

  // 🔄 Efeito para sincronizar estado WiFi com o contexto
  useEffect(() => {
    if (connectionType === ConnectionType.WIFI) {
      if (!isWifiConnected && isConnected) {
        console.log("📶 WiFi foi desconectado externamente");
        resetConnection();
      }
    }
  }, [isWifiConnected, isConnected, connectionType, resetConnection]);

  // Cleanup e verificação periódica (mantido)
  useEffect(() => {
    return () => { if (isConnected) disconnect().catch(console.error); };
  }, [isConnected, disconnect]);

  useEffect(() => {
    if (!isConnected || connectionType !== ConnectionType.BLUETOOTH_CLASSIC) return;
    
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
      // Estados
      isConnected, 
      connectionType, 
      serialPort, 
      availableDevices,
      
      // Estados BLE
      bleDevices,
      isBleScanning,
      connectedBleDevice,
      bleError,
      
      // 🆕 Estados WiFi
      wifiLogs,
      wifiError,
      
      // Métodos de conexão
      connectCable, 
      connectBluetoothClassic,
      connectBluetoothLE,
      connectWifi,        // 🆕 Novo método
      disconnect, 
      sendCommand, 
      
      // Métodos de escaneamento
      scanBluetoothDevices,
      scanBleDevices,
      
      // 🆕 Métodos WiFi
      clearWifiLogs,
      clearWifiError,
      
      // Métodos BLE
      clearBleError,
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