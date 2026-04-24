/**
 * Tipos e configurações para o Communication Module
 */

import type { IConnectionProvider } from "./interfaces/IConnectionProvider";
import type { BleDevice } from "@capacitor-community/bluetooth-le";

/**
 * Configuração específica para cada tipo de conexão
 */
export interface CableConfig {
  // Configurações vazias por padrão para conexão via cabo
}

export interface BleConfig {
  device: BleDevice;
  serviceUUID?: string;
  txCharacteristicUUID?: string;
  rxCharacteristicUUID?: string;
}

export interface ClassicBluetoothConfig {
  address: string;
}

export interface WifiConfig {
  ip?: string;
  port?: number;
  ssl?: boolean;
  reconnectAttempts?: number;
  reconnectDelay?: number;
}

/**
 * Union type para todas as configurações
 */
export type ConnectionConfig =
  | CableConfig
  | BleConfig
  | ClassicBluetoothConfig
  | WifiConfig;

/**
 * Listener callbacks
 */
export interface ConnectionListeners {
  onData?: (data: string) => void;
  onError?: (error: Error) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

/**
 * Contexto de conexão com gerenciamento de listeners
 */
export interface ManagedConnectionProvider extends IConnectionProvider {
  setListeners(listeners: ConnectionListeners): void;
  removeListeners(): void;
}

/**
 * Estado de conexão
 */
export interface ConnectionState {
  isConnected: boolean;
  connectionType: string;
  lastError?: Error;
  lastConnectTime?: Date;
  lastDisconnectTime?: Date;
  messageCount: number;
  errorCount: number;
}

/**
 * Estratégia de reconexão
 */
export interface ReconnectionStrategy {
  enabled: boolean;
  maxAttempts: number;
  initialDelay: number; // em ms
  maxDelay: number; // em ms
  backoffMultiplier: number;
}

/**
 * Configuração avançada do provider
 */
export interface ProviderOptions {
  timeout?: number; // timeout para operações
  autoReconnect?: boolean;
  reconnectionStrategy?: ReconnectionStrategy;
  commandDelay?: number; // delay entre comandos
  bufferSize?: number; // tamanho do buffer de comandos
}

/**
 * Payload de evento de conexão
 */
export interface ConnectionEvent {
  type: "connect" | "disconnect" | "data" | "error";
  timestamp: Date;
  connectionType: string;
  data?: string | Error;
}

/**
 * Monitor de qualidade de conexão
 */
export interface ConnectionQualityMetrics {
  successRate: number; // 0-100%
  averageResponseTime: number; // ms
  errorRate: number; // 0-100%
  packetsLost: number;
  reconnectCount: number;
}
