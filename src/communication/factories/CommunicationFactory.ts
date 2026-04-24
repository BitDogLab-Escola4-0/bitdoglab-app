import type { IConnectionProvider } from "../interfaces/IConnectionProvider";
import { CableProvider } from "../providers/CableProvider";
import { BleProvider } from "../providers/BleProvider";
import { ClassicBluetoothProvider } from "../providers/ClassicBluetoothProvider";
import { WifiProvider } from "../providers/WifiProvider";
import type { BleDevice } from "@capacitor-community/bluetooth-le";

/**
 * Enum para tipos de conexão suportados
 */
export enum ConnectionType {
  CABLE = "cable",
  BLUETOOTH_CLASSIC = "bluetooth_classic",
  BLUETOOTH_LE = "bluetooth_le",
  WIFI = "wifi",
}

/**
 * Factory Method para criar providers de comunicação
 * Implementa o padrão Factory Method para desacoplar a criação
 * de instâncias de provedores de comunicação do cliente
 */
export class CommunicationFactory {
  /**
   * Cria um provider de comunicação baseado no tipo de conexão
   *
   * @param connectionType Tipo de conexão desejada
   * @param config Configurações específicas do provedor (depende do tipo)
   * @returns Uma instância de IConnectionProvider
   *
   * @example
   * // Criar provider para cabo
   * const cableProvider = CommunicationFactory.createProvider(ConnectionType.CABLE);
   *
   * @example
   * // Criar provider para BLE
   * const bleProvider = CommunicationFactory.createProvider(
   *   ConnectionType.BLUETOOTH_LE,
   *   { device: bleDevice }
   * );
   *
   * @example
   * // Criar provider para WiFi
   * const wifiProvider = CommunicationFactory.createProvider(
   *   ConnectionType.WIFI,
   *   { ip: "192.168.1.100", port: 8080 }
   * );
   */
  static createProvider(
    connectionType: ConnectionType,
    config?: any
  ): IConnectionProvider {
    switch (connectionType) {
      case ConnectionType.CABLE:
        return new CableProvider();

      case ConnectionType.BLUETOOTH_LE:
        if (!config?.device) {
          throw new Error("Dispositivo BLE não fornecido na configuração");
        }
        return new BleProvider(config.device as BleDevice);

      case ConnectionType.BLUETOOTH_CLASSIC:
        if (!config?.address) {
          throw new Error(
            "Endereço do dispositivo Bluetooth não fornecido na configuração"
          );
        }
        return new ClassicBluetoothProvider(config.address as string);

      case ConnectionType.WIFI:
        const ip = config?.ip || "192.168.1.100";
        const port = config?.port || 8080;
        return new WifiProvider(ip, port);

      default:
        throw new Error(`Tipo de conexão não suportado: ${connectionType}`);
    }
  }

  /**
   * Cria um provider baseado em um identificador de string
   * Útil quando o tipo vem de configurações ou banco de dados
   *
   * @param connectionTypeString String identificador do tipo ("cable", "bluetooth_le", etc)
   * @param config Configurações específicas do provedor
   * @returns Uma instância de IConnectionProvider
   */
  static createProviderByString(
    connectionTypeString: string,
    config?: any
  ): IConnectionProvider {
    const connectionType = connectionTypeString as ConnectionType;
    return this.createProvider(connectionType, config);
  }
}
