# 🎯 Boas Práticas - Communication Factory Pattern

## ✅ DO's (Fazer)

### 1. Sempre usar o Factory para criar providers

```typescript
// ✅ BOM
const provider = CommunicationFactory.createProvider(
  ConnectionType.CABLE
);

// ❌ RUIM
const provider = new CableProvider();
```

**Por quê?** O factory valida configurações e centraliza a lógica de criação.

### 2. Registrar listeners antes de conectar

```typescript
// ✅ BOM
const provider = CommunicationFactory.createProvider(ConnectionType.BLE, { device });
provider.onData((data) => console.log(data));
provider.onError((error) => console.error(error));
await provider.connect();

// ❌ RUIM
const provider = CommunicationFactory.createProvider(ConnectionType.BLE, { device });
await provider.connect();
provider.onData((data) => console.log(data)); // Pode perder dados iniciais
```

### 3. Usar try-catch em operações de conexão

```typescript
// ✅ BOM
try {
  const provider = CommunicationFactory.createProvider(ConnectionType.WIFI, config);
  await provider.connect();
} catch (error) {
  console.error("Falha ao conectar:", error);
  // Implementar retry ou fallback
}

// ❌ RUIM
const provider = CommunicationFactory.createProvider(ConnectionType.WIFI, config);
await provider.connect(); // Sem tratamento de erro
```

### 4. Sempre desconectar ao terminar

```typescript
// ✅ BOM
const provider = CommunicationFactory.createProvider(ConnectionType.CABLE);
try {
  await provider.connect();
  await provider.sendCommand("SETUP");
} finally {
  await provider.disconnect(); // Sempre executado
}

// ❌ RUIM
const provider = CommunicationFactory.createProvider(ConnectionType.CABLE);
await provider.connect();
await provider.sendCommand("SETUP");
// Pode vazar recurso se houver erro
```

### 5. Verificar isConnected() antes de enviar

```typescript
// ✅ BOM
if (provider.isConnected()) {
  await provider.sendCommand("LED_ON");
} else {
  console.warn("Não conectado");
}

// ❌ RUIM
await provider.sendCommand("LED_ON"); // Pode falhar
```

### 6. Usar tipos corretos nas configs

```typescript
// ✅ BOM - Config tipada
interface WifiConfig {
  ip?: string;
  port?: number;
}

const config: WifiConfig = { ip: "192.168.1.1", port: 8080 };
const provider = CommunicationFactory.createProvider(
  ConnectionType.WIFI,
  config
);

// ❌ RUIM - Sem tipo
const config: any = { ip: "192.168.1.1" };
const provider = CommunicationFactory.createProvider(ConnectionType.WIFI, config);
```

### 7. Nomear providers significativamente

```typescript
// ✅ BOM
const bleProvider = CommunicationFactory.createProvider(
  ConnectionType.BLUETOOTH_LE,
  { device: selectedDevice }
);

const wifiProvider = CommunicationFactory.createProvider(
  ConnectionType.WIFI,
  { ip: deviceIp }
);

// ❌ RUIM
const p1 = CommunicationFactory.createProvider(...);
const p2 = CommunicationFactory.createProvider(...);
```

### 8. Usar constantes para tipos de conexão

```typescript
// ✅ BOM
import { ConnectionType } from "@/communication";

await connect(ConnectionType.BLUETOOTH_LE, config);

// ❌ RUIM
await connect("bluetooth_le", config); // String mágica
```

## ❌ DON'Ts (Não Fazer)

### 1. Não misturar providers

```typescript
// ❌ RUIM - Confuso e propenso a erros
const provider1 = new BleProvider(device1);
const provider2 = CommunicationFactory.createProvider(ConnectionType.CABLE);
```

### 2. Não ignorar erros

```typescript
// ❌ RUIM
try {
  await provider.connect();
} catch (error) {
  // Silenciosamente ignorado
}

// ✅ BOM
try {
  await provider.connect();
} catch (error) {
  console.error("Erro na conexão:", error);
  // Implementar tratamento apropriado
}
```

### 3. Não fazer operações síncronas de forma assincronamente

```typescript
// ❌ RUIM - Não aguardar promises
provider.connect(); // Esqueceu o await
await provider.sendCommand("SETUP");

// ✅ BOM
await provider.connect();
await provider.sendCommand("SETUP");
```

### 4. Não manter múltiplas conexões sem necessidade

```typescript
// ❌ RUIM - Desperdício de recursos
const provider1 = CommunicationFactory.createProvider(ConnectionType.CABLE);
const provider2 = CommunicationFactory.createProvider(ConnectionType.CABLE);
await provider1.connect();
await provider2.connect();

// ✅ BOM - Reutilizar provider
const provider = CommunicationFactory.createProvider(ConnectionType.CABLE);
await provider.connect();
// Usar provider para múltiplas operações
```

### 5. Não passar configurações incorretas

```typescript
// ❌ RUIM - Config incompleta
const provider = CommunicationFactory.createProvider(
  ConnectionType.BLUETOOTH_LE
  // Faltou: { device }
);

// ✅ BOM - Config completa
const provider = CommunicationFactory.createProvider(
  ConnectionType.BLUETOOTH_LE,
  { device: selectedDevice }
);
```

### 6. Não assumir tipo de conexão em runtime

```typescript
// ❌ RUIM - Type casting perigoso
const provider = CommunicationFactory.createProvider(type, config);
const bleProvider = provider as BleProvider;
bleProvider.specificBleMethod(); // Pode falhar em runtime

// ✅ BOM - Usar interface
const provider = CommunicationFactory.createProvider(type, config);
if (provider.getConnectionType() === "BLUETOOTH_LE") {
  await provider.sendCommand("BLE_SPECIFIC_CMD");
}
```

### 7. Não esquecer de limpar listeners

```typescript
// ❌ RUIM - Memory leak
provider.onData((data) => {
  // Callback registrado mas nunca removido
});

// ✅ BOM - Clean up
provider.onData((data) => {
  // ...
});
// Ao desconectar
await provider.disconnect(); // Remove listeners
```

## 📋 Checklist de Implementação

Ao usar o factory, verificar:

- [ ] Provider criado via `CommunicationFactory`
- [ ] Configuração correta fornecida
- [ ] Listeners registrados antes de conectar
- [ ] `await connect()` antes de usar provider
- [ ] `isConnected()` verificado antes de enviar
- [ ] `try-catch` em torno de operações
- [ ] `finally` ou clean-up para `disconnect()`
- [ ] Tipos corretos em TypeScript
- [ ] Variáveis nomeadas significativamente
- [ ] Sem promises flutuantes (floating promises)

## 🔄 Padrão: Connection Lifecycle

```typescript
async function connectionLifecycle() {
  let provider: IConnectionProvider | null = null;

  try {
    // 1. Criar
    provider = CommunicationFactory.createProvider(
      ConnectionType.WIFI,
      { ip: "192.168.1.1" }
    );

    // 2. Registrar listeners
    provider.onData((data) => handleData(data));
    provider.onError((error) => handleError(error));

    // 3. Conectar
    await provider.connect();
    console.log("Conectado:", provider.getConnectionType());

    // 4. Usar
    if (provider.isConnected()) {
      await provider.sendCommand("STATUS");
      // Mais operações...
    }

  } catch (error) {
    console.error("Erro:", error);
    // Implementar retry, fallback, etc

  } finally {
    // 5. Limpar
    if (provider?.isConnected()) {
      await provider.disconnect();
    }
  }
}
```

## 🚀 Performance Tips

### 1. Reutilizar providers

```typescript
// Bom para performance
const provider = await createAndConnectProvider(config);

// Enviar múltiplos comandos com um provider
for (const cmd of commands) {
  await provider.sendCommand(cmd);
}

await provider.disconnect();
```

### 2. Batch de comandos

```typescript
// Evitar múltiplas desconexões/reconexões
const commands = ["LED_ON", "SETUP", "START"];

for (const cmd of commands) {
  await provider.sendCommand(cmd);
  // Pequeno delay se necessário
  await new Promise(r => setTimeout(r, 50));
}
```

### 3. Listeners eficientes

```typescript
// Usar filter para reduzir processamento
provider.onData((data) => {
  // Apenas processar dados relevantes
  if (data.startsWith("SENSOR:")) {
    processSensorData(data);
  }
});
```

## 📚 Recursos

- [README.md](./README.md) - Uso básico
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Diagramas e estrutura
- [INTEGRATION.md](./INTEGRATION.md) - Integração com ConnectionContext
- [EXAMPLES.ts](./EXAMPLES.ts) - Exemplos práticos
