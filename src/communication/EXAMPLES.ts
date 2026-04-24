/**
 * Exemplos de uso do Communication Factory Pattern
 * Este arquivo demonstra como usar o factory em diferentes cenários
 */

import { CommunicationFactory, ConnectionType } from "./factories/CommunicationFactory";
import type { BleDevice } from "@capacitor-community/bluetooth-le";

/**
 * Exemplo 1: Conexão via Cabo
 */
export async function exemploConexaoCabo() {
  try {
    const provider = CommunicationFactory.createProvider(ConnectionType.CABLE);

    // Registrar listeners
    provider.onData((data) => {
      console.log("Dados recebidos (Cabo):", data);
    });

    provider.onError((error) => {
      console.error("Erro na conexão (Cabo):", error);
    });

    // Conectar
    await provider.connect();
    console.log("Conectado via cabo:", provider.getConnectionType());

    // Enviar alguns comandos
    await provider.sendCommand("PRINT('Hello from Cable')");
    await provider.sendCommand("import board");

    // Desconectar
    await provider.disconnect();
  } catch (error) {
    console.error("Erro:", error);
  }
}

/**
 * Exemplo 2: Conexão via Bluetooth Low Energy
 */
export async function exemploConexaoBLE(device: BleDevice) {
  try {
    const provider = CommunicationFactory.createProvider(
      ConnectionType.BLUETOOTH_LE,
      { device }
    );

    provider.onData((data) => {
      console.log("Dados recebidos (BLE):", data);
    });

    provider.onError((error) => {
      console.error("Erro na conexão (BLE):", error);
    });

    await provider.connect();
    console.log("Conectado via BLE:", provider.getConnectionType());

    // Enviar comando
    await provider.sendCommand("LED.on()");

    // Verificar status
    if (provider.isConnected()) {
      console.log("Ainda conectado!");
    }

    await provider.disconnect();
  } catch (error) {
    console.error("Erro:", error);
  }
}

/**
 * Exemplo 3: Conexão via Bluetooth Clássico
 */
export async function exemploConexaoBluetoothClassico(address: string) {
  try {
    const provider = CommunicationFactory.createProvider(
      ConnectionType.BLUETOOTH_CLASSIC,
      { address }
    );

    provider.onData((data) => {
      console.log("Dados recebidos (Bluetooth Clássico):", data);
    });

    provider.onError((error) => {
      console.error("Erro na conexão (Bluetooth Clássico):", error);
    });

    await provider.connect();
    console.log("Conectado via Bluetooth Clássico:", provider.getConnectionType());

    await provider.sendCommand("SETUP");

    await provider.disconnect();
  } catch (error) {
    console.error("Erro:", error);
  }
}

/**
 * Exemplo 4: Conexão via WiFi
 */
export async function exemploConexaoWifi() {
  try {
    const provider = CommunicationFactory.createProvider(
      ConnectionType.WIFI,
      { ip: "192.168.1.100", port: 8080 }
    );

    provider.onData((data) => {
      console.log("Dados recebidos (WiFi):", data);
    });

    provider.onError((error) => {
      console.error("Erro na conexão (WiFi):", error);
    });

    await provider.connect();
    console.log("Conectado via WiFi:", provider.getConnectionType());

    // Enviar série de comandos
    const comandos = ["INIT", "CONFIG", "START"];
    for (const cmd of comandos) {
      await provider.sendCommand(cmd);
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    await provider.disconnect();
  } catch (error) {
    console.error("Erro:", error);
  }
}

/**
 * Exemplo 5: Usando factory com string (útil para configurações dinâmicas)
 */
export async function exemploConexaoDinamica(
  connectionTypeString: string,
  config?: any
) {
  try {
    const provider = CommunicationFactory.createProviderByString(
      connectionTypeString,
      config
    );

    provider.onData((data) => {
      console.log("Dados recebidos:", data);
    });

    provider.onError((error) => {
      console.error("Erro:", error);
    });

    await provider.connect();
    console.log(`Conectado via ${provider.getConnectionType()}`);

    await provider.sendCommand("STATUS");

    await provider.disconnect();
  } catch (error) {
    console.error("Erro:", error);
  }
}

/**
 * Exemplo 6: Factory Pattern com gerenciamento de múltiplas conexões
 */
export async function exemploMultiplasConexoes() {
  const providers = [
    CommunicationFactory.createProvider(ConnectionType.CABLE),
    // BLE - precisaria do device aqui
    CommunicationFactory.createProvider(ConnectionType.WIFI, {
      ip: "192.168.1.100",
    }),
  ];

  // Conectar todos
  for (const provider of providers) {
    try {
      provider.onData((data) => {
        console.log(`[${provider.getConnectionType()}]`, data);
      });

      await provider.connect();
      console.log(`Conectado: ${provider.getConnectionType()}`);
    } catch (error) {
      console.error(
        `Erro ao conectar ${provider.getConnectionType()}:`,
        error
      );
    }
  }

  // Desconectar todos
  for (const provider of providers) {
    if (provider.isConnected()) {
      await provider.disconnect();
      console.log(`Desconectado: ${provider.getConnectionType()}`);
    }
  }
}

/**
 * Exemplo 7: Error handling robusto
 */
export async function exemploComTratamentoDeErros() {
  let provider = null;

  try {
    provider = CommunicationFactory.createProvider(ConnectionType.BLUETOOTH_LE, {
      device: null, // Esto causará um erro de validação
    });
  } catch (error) {
    console.error("Erro na criação do provider:", error);
    return;
  }

  try {
    provider.onError((error) => {
      console.error("Erro durante operação:", error);
      // Implementar lógica de retry ou fallback
    });

    await provider.connect();
    // ... operações
  } catch (error) {
    console.error("Erro na conexão:", error);
    // Implementar estratégia de fallback
  } finally {
    if (provider?.isConnected()) {
      await provider.disconnect();
    }
  }
}
