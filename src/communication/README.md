# 📡 Communication Factory Pattern

Este diretório implementa o **Factory Method Pattern** para gerenciar diferentes tipos de conexão com dispositivos.

## 🎯 Estrutura

```
communication/
├── factories/
│   └── CommunicationFactory.ts      # Factory Method principal
├── interfaces/
│   └── IConnectionProvider.ts       # Interface base para providers
└── providers/
    ├── CableProvider.ts             # Provedor para conexão via cabo
    ├── BleProvider.ts               # Provedor para Bluetooth Low Energy
    ├── ClassicBluetoothProvider.ts  # Provedor para Bluetooth Clássico
    └── WifiProvider.ts              # Provedor para conexão WiFi
```

## 📖 Como Usar

### 1. Importar o Factory

```typescript
import { CommunicationFactory, ConnectionType } from "@/communication/factories/CommunicationFactory";
```

### 2. Criar um Provider

#### Conexão via Cabo
```typescript
const provider = CommunicationFactory.createProvider(ConnectionType.CABLE);
```

#### Conexão via Bluetooth Low Energy (BLE)
```typescript
const provider = CommunicationFactory.createProvider(
  ConnectionType.BLUETOOTH_LE,
  { device: bleDevice }
);
```

#### Conexão via Bluetooth Clássico
```typescript
const provider = CommunicationFactory.createProvider(
  ConnectionType.BLUETOOTH_CLASSIC,
  { address: "AA:BB:CC:DD:EE:FF" }
);
```

#### Conexão via WiFi
```typescript
const provider = CommunicationFactory.createProvider(
  ConnectionType.WIFI,
  { ip: "192.168.1.100", port: 8080 }
);
```

### 3. Usar o Provider

```typescript
// Setup de listeners
provider.onData((data) => {
  console.log("Dados recebidos:", data);
});

provider.onError((error) => {
  console.error("Erro:", error);
});

// Conectar
await provider.connect();

// Enviar comando
await provider.sendCommand("LED_ON");

// Desconectar
await provider.disconnect();
```

## 🔧 Implementar um Novo Provider

Para adicionar um novo tipo de conexão:

1. **Criar a classe do provider** em `providers/NomeProvider.ts`:

```typescript
import type { IConnectionProvider } from "../interfaces/IConnectionProvider";

export class NomeProvider implements IConnectionProvider {
  private isConnectedFlag: boolean = false;
  private onDataCallback: ((data: string) => void) | null = null;
  private onErrorCallback: ((error: Error) => void) | null = null;

  async connect(): Promise<void> {
    // Implementar conexão
    this.isConnectedFlag = true;
  }

  async disconnect(): Promise<void> {
    // Implementar desconexão
    this.isConnectedFlag = false;
  }

  async sendCommand(command: string): Promise<void> {
    // Implementar envio de comando
  }

  isConnected(): boolean {
    return this.isConnectedFlag;
  }

  getConnectionType(): string {
    return "TIPO_CONEXAO";
  }

  onData(callback: (data: string) => void): void {
    this.onDataCallback = callback;
  }

  onError(callback: (error: Error) => void): void {
    this.onErrorCallback = callback;
  }
}
```

2. **Adicionar o tipo ao enum** em `factories/CommunicationFactory.ts`:

```typescript
export enum ConnectionType {
  // ... tipos existentes
  NOVO_TIPO = "novo_tipo",
}
```

3. **Adicionar o case no Factory** em `factories/CommunicationFactory.ts`:

```typescript
case ConnectionType.NOVO_TIPO:
  return new NomeProvider(config);
```

## 🎨 Benefícios do Factory Method

✅ **Desacoplamento** - O cliente não precisa conhecer as classes concretas  
✅ **Extensibilidade** - Fácil adicionar novos tipos de conexão  
✅ **Manutenibilidade** - Mudanças centralizadas no factory  
✅ **Consistência** - Todos os providers seguem a mesma interface  
✅ **Testabilidade** - Fácil mockar providers para testes  

## 📝 Exemplo Completo

```typescript
import { CommunicationFactory, ConnectionType } from "@/communication/factories/CommunicationFactory";

async function conectarDispositivo() {
  try {
    // Criar provider
    const provider = CommunicationFactory.createProvider(
      ConnectionType.BLUETOOTH_LE,
      { device: selectedBleDevice }
    );

    // Setup listeners
    provider.onData((data) => {
      console.log("Recebido:", data);
    });

    provider.onError((error) => {
      console.error("Erro de conexão:", error);
    });

    // Conectar
    await provider.connect();
    console.log("Conectado:", provider.getConnectionType());

    // Enviar comando
    await provider.sendCommand("SETUP_LED");

    // Quando terminar
    await provider.disconnect();
  } catch (error) {
    console.error("Falha na conexão:", error);
  }
}
```

## 🔗 Integração com ConnectionContext

Para integrar com o `ConnectionContext.tsx`, você pode usar o factory:

```typescript
const provider = CommunicationFactory.createProvider(
  connectionType,
  config
);

provider.onData((data) => {
  // Atualizar estado da aplicação
});

provider.onError((error) => {
  // Tratar erro
});
```

## ⚠️ Notas Importantes

- Cada provider implementa a interface `IConnectionProvider`
- Os métodos `connect()` e `disconnect()` são assincronos
- Use `onData()` e `onError()` para registrar listeners antes de conectar
- Sempre chame `disconnect()` quando terminar de usar o provider
- O factory valida as configurações obrigatórias para cada tipo
