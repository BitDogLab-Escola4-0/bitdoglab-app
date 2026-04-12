import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { useNavigate } from "react-router-dom";
import { useConnection } from "../connection/ConnectionContext";

// 🔄 Tipos de conexão expandidos
type ConnectionType = "cable" | "bluetooth" | "wifi";

interface ConnectionState {
  loading: boolean;
  error: string | null;
  selectedConnectionType: ConnectionType; // Removida, pois é sempre Bluetooth
  scanning: boolean;
  selectedDevice: string | null;
  wifiIp: string;                           // 🆕 Campos WiFi
  wifiPort: string;
}

const INITIAL_STATE: ConnectionState = {
  loading: false,
  error: null,
  selectedConnectionType: "cable", // Removida
  scanning: false,
  selectedDevice: null,
  wifiIp: "192.168.1.100",
  wifiPort: "8080",
};

const MESSAGES = {
  connected: "Você está conectado à placa",
  disconnected: "Antes de começar, primeiro conecte-se com a placa",
  selectDevice: "Selecione um dispositivo Bluetooth",
  scanningHint: "Isso pode levar alguns segundos...",
  noDevices: "Nenhum dispositivo encontrado",
  availableDevices: "Dispositivos disponíveis:",
  connectionMethod: "Escolha o método de conexão:", // Removida
  continue: "Continuar para Componentes",
  errors: {
    scanFailed: "Falha ao buscar dispositivos Bluetooth",
    disconnectFailed: "Falha ao desconectar",
    connectFailed: "Falha ao conectar via Bluetooth", // Texto atualizado
  },
  buttons: {
    processing: "Processando...",
    disconnect: "Desconectar",
    scanning: "Buscando...",
    scan: "Buscar dispositivos",
    connectCable: "Conectar via cabo",
    connectBluetooth: "Conectar via Bluetooth",
    connectWifi: "Conectar via WiFi", //
  },
  connectionTypes: {
    cable: "Conexão via cabo",
    bluetooth: "Conexão Bluetooth",
    wifi: "Conexão via WiFi",
  },
} as const;

export default function Connection() {
  const navigate = useNavigate();
  const {
    isConnected,
    connectCable,
    connectBluetooth,
    connectWifi,
    disconnect,
    scanBluetoothDevices,
    availableDevices,
    wifiLogs,     
    wifiError,
    clearWifiError,
  } = useConnection();

  const [state, setState] = useState<ConnectionState>(INITIAL_STATE);

  const updateState = useCallback((updates: Partial<ConnectionState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const clearError = useCallback(() => {
    updateState({ error: null });
    clearWifiError();
  }, [updateState, , clearWifiError]);

  // 🔄 Conectar de acordo com o tipo
  const handleConnect = useCallback(async () => {
    try {
      updateState({ loading: true, error: null });

      if (state.selectedConnectionType === "cable") {
        await connectCable();
      } else if (state.selectedConnectionType === "bluetooth") {
        if (!state.selectedDevice) {
          updateState({ error: MESSAGES.selectDevice, loading: false });
          return;
        }
        await connectBluetooth(state.selectedDevice);
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
    state.wifiIp, 
    state.wifiPort, 
    connectCable, 
    connectBluetooth, 
    connectWifi, 
    navigate, 
    updateState
  ]);

  const handleScan = useCallback(async () => {
    try {
      updateState({ scanning: true, error: null });
      await scanBluetoothDevices();
    } catch (err: any) {
      updateState({ error: err.message || MESSAGES.errors.scanFailed });
    } finally {
      updateState({ scanning: false });
    }
  }, [scanBluetoothDevices, updateState]);

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

  const handleConnectionTypeChange = useCallback((type: ConnectionType) => {
    updateState({ 
      selectedConnectionType: type, 
      selectedDevice: null,
    });
  }, [updateState]);

  const isConnectDisabled = useCallback(() => {
    if (state.loading) return true;
    
    if (state.selectedConnectionType === "bluetooth" && !state.selectedDevice && !isConnected) {
      return true;
    }
    if (state.selectedConnectionType === "wifi" && (!state.wifiIp || !state.wifiPort) && !isConnected) {
      return true;
    }
    return false;
  }, [state, isConnected]);

  const handleConnection = useCallback(() => {
    return isConnected ? handleDisconnect() : handleConnect();
  }, [isConnected, handleDisconnect, handleConnect]);

  // handleConnectionTypeChange removida, pois não é mais necessário

  const handleDeviceSelect = useCallback((deviceAddress: string) => {
    updateState({ selectedDevice: deviceAddress });
  }, [updateState]);

  const getConnectButtonText = useCallback(() => {
    if (state.loading) return MESSAGES.buttons.processing;
    if (isConnected) return MESSAGES.buttons.disconnect;
    
    switch (state.selectedConnectionType) {
      case "cable": return MESSAGES.buttons.connectCable;
      case "bluetooth": return MESSAGES.buttons.connectBluetooth;
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
      {wifiError && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded mb-2">
          ⚠️ {wifiError}
        </div>
      )}
      {wifiLogs.length > 0 && (
        <div className="bg-gray-50 border rounded p-2 max-h-32 overflow-y-auto text-xs font-mono">
          {wifiLogs.map((log, i) => (
            <div key={i}>📡 {log}</div>
          ))}
        </div>
      )}
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

  const renderBluetoothDeviceList = () => (
    <div className="mt-2 border rounded-md p-2 max-h-32 overflow-y-auto">
      <h3 className="text-sm font-semibold mb-1">{MESSAGES.availableDevices}</h3>
      {availableDevices.length === 0 ? (
        <p className="text-sm text-gray-500">{MESSAGES.noDevices}</p>
      ) : (
        <ul className="space-y-1">
          {availableDevices.map((device) => (
            <li key={device.address} className="flex items-center">
              <label className="flex items-center text-sm">
                <input
                  type="radio"
                  name="bluetoothDevice"
                  value={device.address}
                  checked={state.selectedDevice === device.address}
                  onChange={() => handleDeviceSelect(device.address)}
                  className="mr-2"
                />
                {device.name || device.id}
              </label>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  const renderBluetoothSection = () => (
    <div className="mb-4 gap-2">
      <p className="text-ubuntu text-text justify-center font-medium text-md mb-1 mx-2">Antes de você clicar em buscar dispositivo, você deve ter pareado o bluetooth com o celular, só assim seu dispositivo aparecerá aqui</p>
      <div className="flex items-center justify-center gap-2 mb-2">
        <Button
          onClick={handleScan}
          disabled={state.scanning}
          variant="outline"
          className="text-sm my-2"
        >
          {state.scanning ? MESSAGES.buttons.scanning : MESSAGES.buttons.scan}
        </Button>
        {state.scanning && (
          <span className="text-ubuntu text-sm text-gray-500 my-2">
            {MESSAGES.scanningHint}
          </span>
        )}
      </div>
      {renderBluetoothDeviceList()}
    </div>
  );

  const renderErrorMessage = () => state.error && (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      {state.error}
    </div>
  );

  const renderConnectionForm = () => !isConnected && (
    <div className="w-full max-w-md">
      {/* O seletor de tipo de conexão foi removido, renderizamos apenas a seção Bluetooth */}
      {renderBluetoothSection()}
    </div>
  );

  const renderContinueButton = () => isConnected && (
    <Button onClick={() => navigate("/components")} className="mt-2">
      {MESSAGES.continue}
    </Button>
  );

  return (
    <div className="p-4">
      <Header title="Conexão" showIdeaButton={false} />

      <h1 className="text-ubuntu px-8 font-medium text-lg text-center my-2">
        {isConnected ? MESSAGES.connected : MESSAGES.disconnected}
      </h1>

      {renderConnectionTypeSelector()}

      {state.selectedConnectionType === "bluetooth" && renderConnectionForm()}

      {state.selectedConnectionType === "wifi" && renderWifiSection()}

      {renderErrorMessage()}
      {renderContinueButton()}

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
