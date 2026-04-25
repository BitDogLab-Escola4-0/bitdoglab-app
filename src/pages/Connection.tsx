import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { useNavigate } from "react-router-dom";
import { useConnection } from "../connection/ConnectionContext";
import type { BleDevice } from '@capacitor-community/bluetooth-le';

// 🔄 Tipos de conexão expandidos
type ConnectionType = "cable" | "bluetooth_classic" | "bluetooth_le" | "wifi";

interface ConnectionState {
  loading: boolean;
  error: string | null;
  selectedConnectionType: ConnectionType;
  scanning: boolean;
  selectedDevice: string | null;           
  selectedBleDevice: BleDevice | null;     
  wifiIp: string;                           // 🆕 Campos WiFi
  wifiPort: string;
}

const INITIAL_STATE: ConnectionState = {
  loading: false,
  error: null,
  selectedConnectionType: "cable",
  scanning: false,
  selectedDevice: null,
  selectedBleDevice: null,
  wifiIp: "192.168.1.100",
  wifiPort: "8080",
};

const MESSAGES = {
  connected: "Você está conectado à placa",
  disconnected: "Antes de começar, primeiro conecte-se com a placa",
  selectDevice: "Selecione um dispositivo Bluetooth",
  selectBleDevice: "Selecione um dispositivo BLE",
  scanningHint: "Isso pode levar alguns segundos...",
  noDevices: "Nenhum dispositivo encontrado",
  availableDevices: "Dispositivos disponíveis:",
  connectionMethod: "Escolha o método de conexão:",
  continue: "Continuar para Componentes",
  errors: {
    scanFailed: "Falha ao buscar dispositivos Bluetooth",
    bleScanFailed: "Falha ao buscar dispositivos BLE",
    disconnectFailed: "Falha ao desconectar",
    connectFailed: "Falha ao conectar",
  },
  buttons: {
    processing: "Processando...",
    disconnect: "Desconectar",
    scanning: "Buscando...",
    scan: "Buscar dispositivos",
    scanBle: "Buscar dispositivos BLE",
    connectCable: "Conectar via cabo",
    connectBluetoothClassic: "Conectar via Bluetooth Clássico",
    connectBluetoothLE: "Conectar via Bluetooth LE",
    connectWifi: "Conectar via WiFi", // 🆕
  },
  connectionTypes: {
    cable: "Conexão via cabo",
    bluetooth_classic: "Conexão Bluetooth Clássico",
    bluetooth_le: "Conexão Bluetooth LE (BLE)",
    wifi: "Conexão via WiFi", // 🆕
  },
} as const;

export default function Connection() {
  const navigate = useNavigate();
  
  const {
    isConnected,
    connectCable,
    connectBluetoothClassic,
    connectBluetoothLE,
    connectWifi,
    disconnect,
  } = useConnection();

  const [state, setState] = useState<ConnectionState>(INITIAL_STATE);

  const updateState = useCallback((updates: Partial<ConnectionState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  // 🔄 Conectar de acordo com o tipo
  const handleConnect = useCallback(async () => {
    try {
      updateState({ loading: true, error: null });

      if (state.selectedConnectionType === "cable") {
        await connectCable();
      } else if (state.selectedConnectionType === "bluetooth_classic") {
        if (!state.selectedDevice) {
          updateState({ error: MESSAGES.selectDevice, loading: false });
          return;
        }
        await connectBluetoothClassic(state.selectedDevice);
      } else if (state.selectedConnectionType === "bluetooth_le") {
        if (!state.selectedBleDevice) {
          updateState({ error: MESSAGES.selectBleDevice, loading: false });
          return;
        }
        await connectBluetoothLE(state.selectedBleDevice);
      } else if (state.selectedConnectionType === "wifi") {
        await connectWifi(state.wifiIp, Number(state.wifiPort));
      }

      navigate("/components");
    } catch (err: any) {
      updateState({ error: err.message || MESSAGES.errors.connectFailed });
    } finally {
      updateState({ loading: false });
    }
  }, [
    state.selectedConnectionType, 
    state.selectedDevice, 
    state.selectedBleDevice, 
    state.wifiIp, 
    state.wifiPort, 
    connectCable, 
    connectBluetoothClassic, 
    connectBluetoothLE, 
    connectWifi, 
    navigate, 
    updateState
  ]);

  const handleDisconnect = useCallback(async () => {
    try {
      updateState({ loading: true });
      await disconnect();
      clearError();
    } catch (err: any) {
      updateState({ error: err.message || MESSAGES.errors.disconnectFailed });
    } finally {
      updateState({ loading: false });
    }
  }, [disconnect, clearError, updateState]);

  const handleConnection = useCallback(() => {
    return isConnected ? handleDisconnect() : handleConnect();
  }, [isConnected, handleDisconnect, handleConnect]);

  const handleConnectionTypeChange = useCallback((type: ConnectionType) => {
    updateState({ 
      selectedConnectionType: type, 
      selectedDevice: null,
      selectedBleDevice: null,
    });
  }, [updateState]);

  const isConnectDisabled = useCallback(() => {
    if (state.loading) return true;
    
    if (state.selectedConnectionType === "bluetooth_classic" && !state.selectedDevice && !isConnected) {
      return true;
    }
    if (state.selectedConnectionType === "bluetooth_le" && !state.selectedBleDevice && !isConnected) {
      return true;
    }
    if (state.selectedConnectionType === "wifi" && (!state.wifiIp || !state.wifiPort) && !isConnected) {
      return true;
    }
    return false;
  }, [state, isConnected]);

  const getConnectButtonText = useCallback(() => {
    if (state.loading) return MESSAGES.buttons.processing;
    if (isConnected) return MESSAGES.buttons.disconnect;
    
    switch (state.selectedConnectionType) {
      case "cable": return MESSAGES.buttons.connectCable;
      case "bluetooth_classic": return MESSAGES.buttons.connectBluetoothClassic;
      case "bluetooth_le": return MESSAGES.buttons.connectBluetoothLE;
      case "wifi": return MESSAGES.buttons.connectWifi; // 🆕
      default: return MESSAGES.buttons.connectCable;
    }
  }, [state.loading, state.selectedConnectionType, isConnected]);


  // 🆕 Seção de conexão WiFi
  const renderWifiSection = () => (
    <div className="mb-4 border rounded-md p-3">
      <h3 className="text-sm font-semibold mb-2">Configuração WiFi</h3>
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={state.wifiIp}
          onChange={e => updateState({ wifiIp: e.target.value })}
          placeholder="IP do dispositivo"
          className="border rounded px-2 py-1 text-sm flex-1"
        />
        <input
          type="number"
          value={state.wifiPort}
          onChange={e => updateState({ wifiPort: e.target.value })}
          placeholder="Porta"
          className="border rounded px-2 py-1 text-sm w-20"
        />

      </div>
    </div>
  );

  // 🎛️ Seletor de tipo de conexão
  const renderConnectionTypeSelector = () => (
    <div className="mb-4">
      <h2 className="text-ubuntu font-medium mb-2">{MESSAGES.connectionMethod}</h2>
      <div className="flex flex-col gap-2">
        {Object.entries(MESSAGES.connectionTypes).map(([key, label]) => (
          <label key={key} className="flex items-center">
            <input
              type="radio"
              name="connectionType"
              checked={state.selectedConnectionType === key}
              onChange={() => handleConnectionTypeChange(key as ConnectionType)}
              className="mr-2"
            />
            {label}
          </label>
        ))}

      </div>
    </div>
  );

  return (
    <div className="p-4">
      <Header title="Conexão" />
      {renderConnectionTypeSelector()}

      {state.selectedConnectionType === "bluetooth_classic" && (
        <div className="mb-4">
          {/* lista + botão scan */}
        </div>
      )}

      {state.selectedConnectionType === "bluetooth_le" && (
        <div className="mb-4">
          {/* lista BLE + botão scan */}
        </div>
      )}

      {state.selectedConnectionType === "wifi" && renderWifiSection()}

      {state.error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {state.error}
        </div>
      )}

      <Button
        onClick={handleConnection}
        disabled={isConnectDisabled()}
        className="w-full"
      >
        {getConnectButtonText()}
      </Button>
    </div>
  );
}
