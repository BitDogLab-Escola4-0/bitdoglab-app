# 🔌 Integração com ConnectionContext

Este documento guia a integração do **Factory Method Pattern** com o `ConnectionContext.tsx` existente.

## 📋 Visão Geral

O `ConnectionContext` pode ser refatorado para usar o `CommunicationFactory`, trazendo:

- ✅ Melhor organização de código
- ✅ Redução de duplicação
- ✅ Facilidade de adicionar novos tipos de conexão
- ✅ Melhor testabilidade

## 🔄 Estratégia de Refatoração

### Fase 1: Preparação (Sem quebras)

1. Manter `ConnectionContext` funcionando normalmente
2. Adicionar `CommunicationFactory` como alternativa interna
3. Migrar hooks um por um

### Fase 2: Migração (Gradual)

```typescript
// Antes
export const useBluetoothLE = () => {
  const [devices, setDevices] = useState<BleDevice[]>([]);
  // ... implementação
  return { devices, connectBle: ... }
};

// Depois
export const useBluetoothLE = () => {
  const [devices, setDevices] = useState<BleDevice[]>([]);
  const [provider, setProvider] = useState<BleProvider | null>(null);
  
  const connectBle = async (device: BleDevice) => {
    const bleProvider = CommunicationFactory.createProvider(
      ConnectionType.BLUETOOTH_LE,
      { device }
    );
    await bleProvider.connect();
    setProvider(bleProvider);
  };
  
  return { devices, connectBle, provider }
};
```

### Fase 3: Centralização

Consolidar tudo em `ConnectionContext` usando o factory

## 📝 Exemplo de Integração

### Passo 1: Atualizar ConnectionContext.tsx

```typescript
import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import { 
  CommunicationFactory, 
  ConnectionType,
  type IConnectionProvider 
} from "@/communication";
import type { BleDevice } from '@capacitor-community/bluetooth-le';

interface ConnectionContextType {
  isConnected: boolean;
  connectionType: ConnectionType;
  provider: IConnectionProvider | null;
  
  // Novo: usar provider diretamente
  connect: (type: ConnectionType, config?: any) => Promise<void>;
  disconnect: () => Promise<void>;
  sendCommand: (command: string) => Promise<void>;
  
  // Antigo: manter para compatibilidade
  connectCable: () => Promise<void>;
  connectBluetoothLE: (device: BleDevice) => Promise<void>;
  connectWifi: (ip?: string, port?: number) => Promise<void>;
}

const ConnectionContext = createContext<ConnectionContextType | undefined>(undefined);

export const ConnectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionType, setConnectionType] = useState<ConnectionType>(ConnectionType.NONE);
  const [provider, setProvider] = useState<IConnectionProvider | null>(null);

  // Novo método unificado
  const connect = useCallback(async (type: ConnectionType, config?: any) => {
    try {
      // Desconectar anterior se houver
      if (provider?.isConnected()) {
        await provider.disconnect();
      }

      // Criar novo provider via factory
      const newProvider = CommunicationFactory.createProvider(type, config);
      
      // Registrar listeners
      newProvider.onData((data) => {
        console.log(`[${type}]`, data);
      });

      newProvider.onError((error) => {
        console.error(`[${type}] Erro:`, error);
      });

      // Conectar
      await newProvider.connect();
      
      setProvider(newProvider);
      setConnectionType(type);
      setIsConnected(true);
    } catch (error) {
      console.error("Erro ao conectar:", error);
      throw error;
    }
  }, [provider]);

  // Métodos de compatibilidade (legacy)
  const connectCable = useCallback(() => {
    return connect(ConnectionType.CABLE);
  }, [connect]);

  const connectBluetoothLE = useCallback((device: BleDevice) => {
    return connect(ConnectionType.BLUETOOTH_LE, { device });
  }, [connect]);

  const connectWifi = useCallback((ip?: string, port?: number) => {
    return connect(ConnectionType.WIFI, { ip, port });
  }, [connect]);

  const disconnect = useCallback(async () => {
    if (provider?.isConnected()) {
      await provider.disconnect();
      setProvider(null);
      setIsConnected(false);
      setConnectionType(ConnectionType.NONE);
    }
  }, [provider]);

  const sendCommand = useCallback(async (command: string) => {
    if (provider && provider.isConnected()) {
      await provider.sendCommand(command);
    } else {
      throw new Error("Não conectado");
    }
  }, [provider]);

  const value: ConnectionContextType = {
    isConnected,
    connectionType,
    provider,
    connect,
    disconnect,
    sendCommand,
    connectCable,
    connectBluetoothLE,
    connectWifi,
  };

  return (
    <ConnectionContext.Provider value={value}>
      {children}
    </ConnectionContext.Provider>
  );
};

export const useConnection = () => {
  const context = useContext(ConnectionContext);
  if (!context) {
    throw new Error("useConnection deve ser usado dentro de ConnectionProvider");
  }
  return context;
};
```

### Passo 2: Usar em Componentes

```typescript
// Antes
import { useBluetoothLE } from "@/hooks/useBluetoothLE";

function Connection() {
  const { connectBluetoothLE, devices } = useBluetoothLE();
  
  const handleConnect = async (device: BleDevice) => {
    await connectBluetoothLE(device);
  };
  
  return <button onClick={() => handleConnect(device)}>Conectar</button>;
}

// Depois
import { useConnection } from "@/connection/ConnectionContext";
import { ConnectionType } from "@/communication";

function Connection() {
  const { connect, isConnected } = useConnection();
  const { bleDevices } = useBluetoothLE();
  
  const handleConnect = async (device: BleDevice) => {
    await connect(ConnectionType.BLUETOOTH_LE, { device });
  };
  
  return (
    <button onClick={() => handleConnect(device)} disabled={isConnected}>
      Conectar
    </button>
  );
}
```

### Passo 3: Enviar Comandos

```typescript
import { useConnection } from "@/connection/ConnectionContext";

function LEDControl() {
  const { sendCommand, isConnected } = useConnection();
  
  const handleLEDOn = async () => {
    if (isConnected) {
      await sendCommand("LED.on()");
    }
  };
  
  return (
    <button onClick={handleLEDOn} disabled={!isConnected}>
      Ligar LED
    </button>
  );
}
```

## 🗺️ Mapa de Migração

```
┌─────────────────────────────────────────────────────┐
│ Fase 1: Coexistência                                │
├─────────────────────────────────────────────────────┤
│ • ConnectionContext continua funcionando             │
│ • CommunicationFactory adicionado em paralelo        │
│ • Novos componentes podem usar factory               │
│ ✓ Sem breaking changes                              │
└─────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────┐
│ Fase 2: Migração Gradual                            │
├─────────────────────────────────────────────────────┤
│ • Hooks começam a usar factory internamente          │
│ • ConnectionContext usa factory em connect()         │
│ • Tests atualizados                                  │
│ ✓ API pública mantida compatível                    │
└─────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────┐
│ Fase 3: Consolidação                                │
├─────────────────────────────────────────────────────┤
│ • ConnectionContext totalmente baseado em factory    │
│ • Hooks removem lógica duplicada                     │
│ • Testes simplificados                              │
│ ✓ Código limpo e centralizado                       │
└─────────────────────────────────────────────────────┘
```

## ✨ Benefícios da Integração

| Aspecto | Antes | Depois |
|---------|-------|--------|
| **Linhas de Código** | ~~500~~ | 300 |
| **Duplicação** | Alta | Mínima |
| **Novos Tipos** | +100 linhas | +30 linhas |
| **Testabilidade** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Manutenção** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

## 🚀 Próximos Passos

1. ✅ Factory criado
2. ⬜ Integrar com ConnectionContext
3. ⬜ Migrar hooks
4. ⬜ Atualizar testes
5. ⬜ Remover código duplicado
6. ⬜ Documentar migração

## 📞 Suporte

Dúvidas ou problemas durante a migração?
- Verifique [README.md](./README.md)
- Consulte [ARCHITECTURE.md](./ARCHITECTURE.md)
- Veja [EXAMPLES.ts](./EXAMPLES.ts)
