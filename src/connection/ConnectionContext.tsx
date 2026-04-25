import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
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

const ConnectionContext = createContext<ConnectionContextType | undefined>(undefined);

export const ConnectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionType, setConnectionType] = useState<ConnectionType | null>(null);
  const [provider, setProvider] = useState<IConnectionProvider | null>(null);
  const [availableBleDevices, setAvailableBleDevices] = useState<BleDevice[]>([]);

  // ==================== Utilitários internos ====================

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

  // ==================== Métodos de conexão ====================

  /**
   * Conecta via cabo (Web Serial API).
   */
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
      console.log("✅ Conectado via cabo");
    } catch (err) {
      resetConnection();
      throw err;
    }
  }, [disconnectCurrent, handleData, handleError, resetConnection]);

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

  /**
   * Desconecta do provider atual.
   */
  const disconnect = useCallback(async () => {
    try {
      await disconnectCurrent();
    } finally {
      resetConnection();
      console.log("✅ Desconectado");
    }
  }, [disconnectCurrent, resetConnection]);

  /**
   * Envia um comando MicroPython para a placa.
   */
  const sendCommand = useCallback(
    async (command: string) => {
      if (!provider || !isConnected) {
        throw new Error("Não conectado a nenhum dispositivo");
      }
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
      {children}
    </ConnectionContext.Provider>
  );
};

export const useConnection = () => {
  const context = useContext(ConnectionContext);
  if (!context) throw new Error("useConnection must be used within a ConnectionProvider");
  return context;
};