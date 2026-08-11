/**
 * Testes para o Communication Factory Pattern
 * Exemplos de como testar providers e o factory
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { CommunicationFactory, ConnectionType } from "../factories/CommunicationFactory";
import { CableProvider } from "../providers/CableProvider";
import { BleProvider } from "../providers/BleProvider";
import { WifiProvider } from "../providers/WifiProvider";
import { ClassicBluetoothProvider } from "../providers/ClassicBluetoothProvider";

describe("CommunicationFactory", () => {
  describe("createProvider", () => {
    it("deve criar um CableProvider para ConnectionType.CABLE", () => {
      const provider = CommunicationFactory.createProvider(
        ConnectionType.CABLE
      );
      expect(provider).toBeInstanceOf(CableProvider);
      expect(provider.getConnectionType()).toBe("CABLE");
    });

    it("deve criar um WifiProvider para ConnectionType.WIFI", () => {
      const provider = CommunicationFactory.createProvider(
        ConnectionType.WIFI,
        { ip: "192.168.1.1", port: 8080 }
      );
      expect(provider).toBeInstanceOf(WifiProvider);
      expect(provider.getConnectionType()).toBe("WIFI");
    });

    it("deve criar um BleProvider para ConnectionType.BLUETOOTH_LE com device", () => {
      const mockDevice = { deviceId: "test-device" };
      const provider = CommunicationFactory.createProvider(
        ConnectionType.BLUETOOTH_LE,
        { device: mockDevice }
      );
      expect(provider).toBeInstanceOf(BleProvider);
      expect(provider.getConnectionType()).toBe("BLUETOOTH_LE");
    });

    it("deve lançar erro se device BLE não for fornecido", () => {
      expect(() => {
        CommunicationFactory.createProvider(ConnectionType.BLUETOOTH_LE);
      }).toThrow("Dispositivo BLE não fornecido na configuração");
    });

    it("deve criar um ClassicBluetoothProvider com address", () => {
      const provider = CommunicationFactory.createProvider(
        ConnectionType.BLUETOOTH_CLASSIC,
        { address: "AA:BB:CC:DD:EE:FF" }
      );
      expect(provider).toBeInstanceOf(ClassicBluetoothProvider);
      expect(provider.getConnectionType()).toBe("BLUETOOTH_CLASSIC");
    });

    it("deve lançar erro se address Bluetooth não for fornecida", () => {
      expect(() => {
        CommunicationFactory.createProvider(
          ConnectionType.BLUETOOTH_CLASSIC
        );
      }).toThrow(
        "Endereço do dispositivo Bluetooth não fornecido na configuração"
      );
    });

    it("deve lançar erro para tipo de conexão não suportado", () => {
      expect(() => {
        CommunicationFactory.createProvider("TIPO_INVALIDO" as any);
      }).toThrow("Tipo de conexão não suportado");
    });
  });

  describe("createProviderByString", () => {
    it("deve criar provider por string", () => {
      const provider =
        CommunicationFactory.createProviderByString("cable");
      expect(provider).toBeInstanceOf(CableProvider);
    });

    it("deve criar provider por string com config", () => {
      const provider = CommunicationFactory.createProviderByString("wifi", {
        ip: "10.0.0.1",
        port: 9000,
      });
      expect(provider).toBeInstanceOf(WifiProvider);
    });
  });
});

describe("CableProvider", () => {
  let provider: CableProvider;

  beforeEach(() => {
    provider = new CableProvider();
  });

  afterEach(async () => {
    if (provider.isConnected()) {
      await provider.disconnect();
    }
  });

  it("deve ter estado desconectado inicialmente", () => {
    expect(provider.isConnected()).toBe(false);
  });

  it("deve retornar tipo de conexão correto", () => {
    expect(provider.getConnectionType()).toBe("CABLE");
  });

  it("deve registrar callback onData", () => {
    const callback = vi.fn();
    provider.onData(callback);
    // Verificar que callback foi registrado
    expect(callback).toBeDefined();
  });

  it("deve registrar callback onError", () => {
    const callback = vi.fn();
    provider.onError(callback);
    expect(callback).toBeDefined();
  });
});

describe("WifiProvider", () => {
  let provider: WifiProvider;

  beforeEach(() => {
    provider = new WifiProvider("192.168.1.100", 8080);
  });

  afterEach(async () => {
    if (provider.isConnected()) {
      await provider.disconnect();
    }
  });

  it("deve ter estado desconectado inicialmente", () => {
    expect(provider.isConnected()).toBe(false);
  });

  it("deve retornar tipo de conexão correto", () => {
    expect(provider.getConnectionType()).toBe("WIFI");
  });

  it("deve usar valores padrão para IP e porta", () => {
    const defaultProvider = new WifiProvider();
    expect(defaultProvider).toBeDefined();
  });
});

describe("BleProvider", () => {
  let provider: BleProvider;
  const mockDevice = { deviceId: "test-device" };

  beforeEach(() => {
    provider = new BleProvider(mockDevice as any);
  });

  afterEach(async () => {
    if (provider.isConnected()) {
      await provider.disconnect();
    }
  });

  it("deve ter estado desconectado inicialmente", () => {
    expect(provider.isConnected()).toBe(false);
  });

  it("deve retornar tipo de conexão correto", () => {
    expect(provider.getConnectionType()).toBe("BLUETOOTH_LE");
  });
});

describe("ClassicBluetoothProvider", () => {
  let provider: ClassicBluetoothProvider;

  beforeEach(() => {
    provider = new ClassicBluetoothProvider("AA:BB:CC:DD:EE:FF");
  });

  afterEach(async () => {
    if (provider.isConnected()) {
      await provider.disconnect();
    }
  });

  it("deve ter estado desconectado inicialmente", () => {
    expect(provider.isConnected()).toBe(false);
  });

  it("deve retornar tipo de conexão correto", () => {
    expect(provider.getConnectionType()).toBe("BLUETOOTH_CLASSIC");
  });
});

/**
 * Teste de integração - verificar que todos os providers
 * implementam a interface corretamente
 */
describe("IConnectionProvider Interface Compliance", () => {
  const providers = [
    {
      name: "CableProvider",
      provider: CommunicationFactory.createProvider(ConnectionType.CABLE),
    },
    {
      name: "WifiProvider",
      provider: CommunicationFactory.createProvider(ConnectionType.WIFI),
    },
  ];

  providers.forEach(({ name, provider }) => {
    describe(name, () => {
      it(`deve implementar todos os métodos da interface`, () => {
        expect(typeof provider.connect).toBe("function");
        expect(typeof provider.disconnect).toBe("function");
        expect(typeof provider.sendCommand).toBe("function");
        expect(typeof provider.isConnected).toBe("function");
        expect(typeof provider.getConnectionType).toBe("function");
        expect(typeof provider.onData).toBe("function");
        expect(typeof provider.onError).toBe("function");
      });

      it(`deve retornar boolean para isConnected()`, () => {
        const result = provider.isConnected();
        expect(typeof result).toBe("boolean");
      });

      it(`deve retornar string para getConnectionType()`, () => {
        const result = provider.getConnectionType();
        expect(typeof result).toBe("string");
      });
    });
  });
});
