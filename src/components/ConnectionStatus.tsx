import { useConnection, ConnectionType } from "../connection/ConnectionContext";
import { useNavigate } from "react-router-dom";

export const ConnectionStatus = () => {
  const { isConnected, connectionType } = useConnection();
  const navigate = useNavigate();

  // Get connection label based on type
  const getConnectionLabel = () => {
    if (!isConnected) {
      return "Desconectado";
    }
    switch (connectionType) {
      case ConnectionType.BLUETOOTH_CLASSIC:
        return "Conectado via Bluetooth Clássico";
      case ConnectionType.BLUETOOTH_LE:
        return "Conectado via Bluetooth LE";
      case ConnectionType.WIFI:
        return "Conectado via WiFi";
      case ConnectionType.CABLE:
        return "Conectado via Cabo";
      default:
        return "Conectado";
    }
  };

  return (
    <button
      className="fixed top-2 left-1/2 -translate-x-1/2 px-2 mt-2 rounded-full text-xs font-small z-50 shadow transition-colors"
      style={{
        backgroundColor: isConnected
          ? "rgba(0, 200, 0, 0.2)"
          : "rgba(200, 0, 0, 0.2)",
        color: isConnected ? "rgb(0, 100, 0)" : "rgb(100, 0, 0)",
        cursor: "pointer",
      }}
      onClick={() => navigate("/connection")}
    >
      {getConnectionLabel()}
    </button>
  );
};