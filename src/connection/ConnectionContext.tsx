import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
<<<<<<< HEAD
import {
  CommunicationFactory,
  ConnectionType,
} from "../communication/factories/CommunicationFactory";
import type { IConnectionProvider } from "../communication/interfaces/IConnectionProvider";
import { BleClient, type BleDevice } from "@capacitor-community/bluetooth-le";

// Re-exporta ConnectionType da factory como fonte única da verdade
export { ConnectionType } from "../communication/factories/CommunicationFactory";

const DEFAULT_WIFI_IP = "192.168.1.100";
const DEFAULT_WIFI_PORT = 8080;

interface ConnectionContextType {
  isConnected: boolean;
  connectionType: ConnectionType | null;

  // Dispositivos BLE descobertos durante o scan
  availableBleDevices: BleDevice[];

  // Métodos de conexão
  connectCable: () => Promise<void>;
  connectBluetoothClassic: (address: string) => Promise<void>;
  connectBluetoothLE: (device: BleDevice) => Promise<void>;
  connectWifi: (ip?: string, port?: number) => Promise<void>;
  disconnect: () => Promise<void>;

  // Envio de comandos
  sendCommand: (command: string) => Promise<void>;

  // Escaneamento
  scanBleDevices: () => Promise<void>;
}

=======
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

>>>>>>> 54441e3 (try the connection)
const ConnectionContext = createContext<ConnectionContextType | undefined>(undefined);

export const ConnectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionType, setConnectionType] = useState<ConnectionType | null>(null);
  const [provider, setProvider] = useState<IConnectionProvider | null>(null);
  const [availableBleDevices, setAvailableBleDevices] = useState<BleDevice[]>([]);

<<<<<<< HEAD
  // ==================== Utilitários internos ====================
=======
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
>>>>>>> 54441e3 (try the connection)

  const resetConnection = useCallback(() => {
    setIsConnected(false);
    setConnectionType(null);
    setProvider(null);
  }, []);

  /**
   * Desconecta o provider atual se existir, sem lançar erro.
   * Usado antes de trocar de tipo de conexão.
   */
  const disconnectCurrent = useCallback(async () => {
    if (provider) {
      try {
        await provider.disconnect();
      } catch (err) {
        console.warn("Aviso ao desconectar provider anterior:", err);
      }
    }
  }, [provider]);

  // ==================== Handlers do provider ====================

  const handleData = useCallback((data: string) => {
    console.log("📨 Dados recebidos:", data);
  }, []);

  const handleError = useCallback(
    (error: Error) => {
      console.error("❌ Erro no provider:", error);
      resetConnection();
    },
    [resetConnection]
  );

<<<<<<< HEAD
  // ==================== Métodos de conexão ====================

  /**
   * Conecta via cabo (Web Serial API).
   */
=======
>>>>>>> 54441e3 (try the connection)
  const connectCable = useCallback(async () => {
    await disconnectCurrent();
    try {
      const newProvider = CommunicationFactory.createProvider(ConnectionType.CABLE);
      newProvider.onData(handleData);
      newProvider.onError(handleError);
      await newProvider.connect();
      setProvider(newProvider);
      setConnectionType(ConnectionType.CABLE);
      setIsConnected(true);
<<<<<<< HEAD
      console.log("✅ Conectado via cabo");
    } catch (err) {
=======
      
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
>>>>>>> 54441e3 (try the connection)
      resetConnection();
      throw err;
    }
  }, [disconnectCurrent, handleData, handleError, resetConnection]);

<<<<<<< HEAD
  /**
   * Conecta via Bluetooth Clássico.
   * @param address Endereço MAC do dispositivo (ex: "AA:BB:CC:DD:EE:FF")
   */
  const connectBluetoothClassic = useCallback(
    async (address: string) => {
      await disconnectCurrent();
      try {
        const newProvider = CommunicationFactory.createProvider(
          ConnectionType.BLUETOOTH_CLASSIC,
          { address }
        );
        newProvider.onData(handleData);
        newProvider.onError(handleError);
        await newProvider.connect();
        setProvider(newProvider);
        setConnectionType(ConnectionType.BLUETOOTH_CLASSIC);
        setIsConnected(true);
        console.log("✅ Conectado via Bluetooth Clássico");
      } catch (err) {
        resetConnection();
        throw err;
      }
    },
    [disconnectCurrent, handleData, handleError, resetConnection]
  );

  /**
   * Conecta via Bluetooth LE.
   * @param device Dispositivo BLE obtido via scanBleDevices()
   */
  const connectBluetoothLE = useCallback(
    async (device: BleDevice) => {
      await disconnectCurrent();
      try {
        const newProvider = CommunicationFactory.createProvider(
          ConnectionType.BLUETOOTH_LE,
          { device }
        );
        newProvider.onData(handleData);
        newProvider.onError(handleError);
        await newProvider.connect();
        setProvider(newProvider);
        setConnectionType(ConnectionType.BLUETOOTH_LE);
        setIsConnected(true);
        console.log("✅ Conectado via Bluetooth LE");
      } catch (err) {
        resetConnection();
        throw err;
      }
    },
    [disconnectCurrent, handleData, handleError, resetConnection]
  );

  /**
   * Conecta via WiFi (WebSocket).
   */
  const connectWifi = useCallback(
    async (ip: string = DEFAULT_WIFI_IP, port: number = DEFAULT_WIFI_PORT) => {
      await disconnectCurrent();
      try {
        const newProvider = CommunicationFactory.createProvider(ConnectionType.WIFI, {
          ip,
          port,
        });
        newProvider.onData(handleData);
        newProvider.onError(handleError);
        await newProvider.connect();
        setProvider(newProvider);
=======
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
>>>>>>> 54441e3 (try the connection)
        setConnectionType(ConnectionType.WIFI);
        setIsConnected(true);
        console.log("✅ Conectado via WiFi");
      } catch (err) {
        resetConnection();
        throw err;
      }
    },
    [disconnectCurrent, handleData, handleError, resetConnection]
  );

<<<<<<< HEAD
  /**
   * Desconecta do provider atual.
   */
  const disconnect = useCallback(async () => {
    try {
      await disconnectCurrent();
    } finally {
=======
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
>>>>>>> 54441e3 (try the connection)
      resetConnection();
      console.log("✅ Desconectado");
    }
<<<<<<< HEAD
  }, [disconnectCurrent, resetConnection]);

  /**
   * Envia um comando MicroPython para a placa.
   */
  const sendCommand = useCallback(
    async (command: string) => {
      if (!provider || !isConnected) {
        throw new Error("Não conectado a nenhum dispositivo");
      }
=======
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
>>>>>>> 54441e3 (try the connection)
      try {
        await provider.sendCommand(command);
      } catch (err) {
        console.error("Erro ao enviar comando:", err);
        throw new Error("Falha ao enviar comando ao dispositivo");
      }
    },
    [provider, isConnected]
  );

  // ==================== Escaneamento ====================

  /**
   * Escaneia dispositivos BLE com prefixo "BitDogLab" por 5 segundos.
   * Popula availableBleDevices com os dispositivos encontrados.
   */
  const scanBleDevices = useCallback(async () => {
    try {
      setAvailableBleDevices([]);
      await BleClient.initialize({ androidNeverForLocation: true });

      await BleClient.requestLEScan({ namePrefix: "BitDogLab" }, (result) => {
        setAvailableBleDevices((prev) => {
          const exists = prev.some((d) => d.deviceId === result.device.deviceId);
          return exists ? prev : [...prev, result.device];
        });
      });

      setTimeout(async () => {
        try {
          await BleClient.stopLEScan();
        } catch (err) {
          console.warn("Erro ao parar scan BLE:", err);
        }
      }, 5000);

      console.log("🔍 Scan BLE iniciado (5s)");
    } catch (err) {
      console.error("Erro ao escanear BLE:", err);
      throw new Error("Falha ao buscar dispositivos BLE");
    }
  }, []);

  // ==================== Cleanup ====================

  useEffect(() => {
    return () => {
      if (provider) {
        provider.disconnect().catch(console.error);
      }
    };
  }, [provider]);

  return (
<<<<<<< HEAD
    <ConnectionContext.Provider
      value={{
        isConnected,
        connectionType,
        availableBleDevices,
        connectCable,
        connectBluetoothClassic,
        connectBluetoothLE,
        connectWifi,
        disconnect,
        sendCommand,
        scanBleDevices,
      }}
    >
=======
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
>>>>>>> 54441e3 (try the connection)
      {children}
    </ConnectionContext.Provider>
  );
};

export const useConnection = () => {
  const context = useContext(ConnectionContext);
  if (!context) throw new Error("useConnection must be used within a ConnectionProvider");
  return context;
};