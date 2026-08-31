/**
 * Communication Module - Factory Method Pattern
 * Exporta todas as interfaces, factories e providers
 */

// Interfaces
export type {
  IConnectionProvider,
  IConnectionProvider as ConnectionProvider,
} from "./interfaces/IConnectionProvider";

// Factory
export {
  CommunicationFactory,
  ConnectionType,
} from "./factories/CommunicationFactory";

// Providers
export { CableProvider } from "./providers/CableProvider";
export { BleProvider } from "./providers/BleProvider";
export { ClassicBluetoothProvider } from "./providers/ClassicBluetoothProvider";
export { WifiProvider } from "./providers/WifiProvider";

