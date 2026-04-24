# 🏗️ Diagrama do Factory Method Pattern - Comunicação

## Estrutura de Classes

```
                    ┌─────────────────────────┐
                    │ IConnectionProvider     │
                    │   (Interface)           │
                    └────────────┬────────────┘
                                 │
                 ┌───────────────┼───────────────┐
                 │               │               │
        ┌────────▼──────────┐ ┌──▼───────────┐ ┌▼──────────────┐
        │  CableProvider    │ │ BleProvider  │ │WifiProvider  │
        │   +connect()      │ │+connect()    │ │+connect()    │
        │   +disconnect()   │ │+disconnect() │ │+disconnect() │
        │   +sendCommand()  │ │+sendCommand()│ │+sendCommand()│
        └───────────────────┘ └──────────────┘ └──────────────┘
                 ▲                 ▲                 ▲
                 │                 │                 │
        ┌────────┴─────┬──────────┴────────┬────────┴─────────────┐
        │              │                   │                      │
        │      ┌───────▼──────────┐       │     ┌───────────────▼┐
        │      │CommunicationFactory       │     │ClassicBluetooth│
        │      │     (Factory)       │     │     │Provider         │
        │      │                     │     │     │+connect()      │
        │      │createProvider()     │     │     │+disconnect()   │
        │      │createProviderByStr()│     │     │+sendCommand()  │
        │      └─────────────────────┘     │     └─────────────────┘
        │                                  │
        └──────────────────┬───────────────┘


```

## Fluxo de Criação

```
┌─────────────────────────────────────────────────────────────┐
│  1. Client Code                                              │
│     const provider = CommunicationFactory.createProvider()  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  2. CommunicationFactory.createProvider()                   │
│     - Valida tipo de conexão                                │
│     - Valida configurações obrigatórias                     │
└────────────────────┬────────────────────────────────────────┘
                     │
         ┌───────────┼───────────┬────────────────┐
         │           │           │                │
         ▼           ▼           ▼                ▼
    ┌────────┐  ┌────────┐  ┌────────┐      ┌────────┐
    │ CABLE  │  │  BLE   │  │ WIFI   │      │CLASSIC │
    └────┬───┘  └───┬────┘  └───┬────┘      └────┬───┘
         │          │           │               │
         ▼          ▼           ▼               ▼
    ┌────────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────┐
    │   new      │ │   new    │ │   new    │ │     new        │
    │CableProvider│ │BleProvider│ │WifiProvider│ │ClassicBluetooth│
    │            │ │          │ │          │ │Provider        │
    └────────────┘ └──────────┘ └──────────┘ └────────────────┘
         │          │           │               │
         └──────────┴───────────┴───────────────┘
                    │
                    ▼
         ┌────────────────────────┐
         │  IConnectionProvider   │
         │     (retornado)        │
         └────────────────────────┘
```

## Sequência de Operações

```
Client Code
    │
    ├─ 1. createProvider(type, config)
    │      │
    │      ├─ Validar tipo
    │      ├─ Validar config
    │      └─ Retornar instância específica
    │
    ├─ 2. provider.onData(callback)
    │      └─ Registrar listener
    │
    ├─ 3. provider.onError(callback)
    │      └─ Registrar listener de erro
    │
    ├─ 4. await provider.connect()
    │      ├─ Estabelecer conexão
    │      ├─ Iniciar leitura
    │      └─ Retornar quando conectado
    │
    ├─ 5. await provider.sendCommand("COMANDO")
    │      ├─ Validar conexão
    │      ├─ Serializar comando
    │      └─ Enviar para dispositivo
    │
    ├─ 6. provider.isConnected()
    │      └─ Retornar estado
    │
    └─ 7. await provider.disconnect()
           └─ Encerrar conexão
```

## Mapa de Configurações por Tipo

```
┌──────────────────────────────────────────────────────────┐
│ ConnectionType.CABLE                                     │
├──────────────────────────────────────────────────────────┤
│ Config: (vazio)                                          │
│ const provider = createProvider(CABLE);                  │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ ConnectionType.BLUETOOTH_LE                              │
├──────────────────────────────────────────────────────────┤
│ Config: { device: BleDevice }                            │
│ const provider = createProvider(BLUETOOTH_LE,            │
│   { device: selectedDevice }                             │
│ );                                                       │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ ConnectionType.BLUETOOTH_CLASSIC                         │
├──────────────────────────────────────────────────────────┤
│ Config: { address: string }                              │
│ const provider = createProvider(BLUETOOTH_CLASSIC,       │
│   { address: "AA:BB:CC:DD:EE:FF" }                       │
│ );                                                       │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ ConnectionType.WIFI                                      │
├──────────────────────────────────────────────────────────┤
│ Config: { ip?: string, port?: number }                   │
│ const provider = createProvider(WIFI,                    │
│   { ip: "192.168.1.1", port: 8080 }                      │
│ );                                                       │
└──────────────────────────────────────────────────────────┘
```

## Benefícios da Arquitetura

```
        ┌──────────────────────────────────────┐
        │    FACTORY METHOD PATTERN            │
        └──────────────────────────────────────┘
                      ▼
         ┌─────────────────────────────┐
         │ Desacoplamento              │
         │ • Cliente não conhece        │
         │   implementações concretas   │
         │ • Depende apenas de          │
         │   IConnectionProvider        │
         └─────────────────────────────┘
                      ▼
         ┌─────────────────────────────┐
         │ Extensibilidade             │
         │ • Novo tipo? Novo provider   │
         │ • Novo case no switch        │
         │ • Cliente não muda           │
         └─────────────────────────────┘
                      ▼
         ┌─────────────────────────────┐
         │ Manutenibilidade            │
         │ • Mudanças centralizadas     │
         │ • Factory == source of truth │
         │ • Validações em um lugar     │
         └─────────────────────────────┘
                      ▼
         ┌─────────────────────────────┐
         │ Testabilidade               │
         │ • Mock providers facilmente  │
         │ • Testes isolados           │
         │ • Sem dependências reais     │
         └─────────────────────────────┘
```

## Exemplo de Uso Completo

```
┌─ Arquivo: src/pages/Connection.tsx
│
├─ Import CommunicationFactory
│
├─ Estado: selectedConnectionType, selectedDevice
│
├─ Handler: handleConnect()
│  │
│  └─ const provider = CommunicationFactory.createProvider(
│       selectedConnectionType,
│       { device: selectedDevice }
│     )
│
│     provider.onData((data) => {
│       setReceivedData(data)
│     })
│
│     await provider.connect()
│     setConnectedProvider(provider)
│
├─ Handler: handleSendCommand()
│  │
│  └─ await connectedProvider.sendCommand(command)
│
└─ Handler: handleDisconnect()
   │
   └─ await connectedProvider.disconnect()
```

## Integração com ConnectionContext

```
ConnectionContext.tsx
    │
    ├─ enum ConnectionType { CABLE, BLE, WIFI, ... }
    │
    ├─ Interface ConnectionContextType
    │  │  ├─ connectionType: ConnectionType
    │  │  ├─ isConnected: boolean
    │  │  ├─ methods: connect(), disconnect(), sendCommand()
    │  │
    │  └─ TODO: Usar CommunicationFactory internamente
    │
    └─ Provider Context
       │
       ├─ useConnectionContext()
       │  │
       │  └─ Retorna métodos e estado de conexão
       │
       └─ Componentes
          ├─ Connection.tsx
          ├─ Buttons/
          ├─ Display/
          └─ ... outros

```

## Padrão de Tratamento de Erros

```
┌─────────────────────────────────────┐
│ createProvider()                     │
├─────────────────────────────────────┤
│ ├─ Valida ConnectionType             │
│ │  └─ throw Error se inválido         │
│ │                                    │
│ ├─ Valida config obrigatória         │
│ │  ├─ BLE: device obrigatório        │
│ │  ├─ Bluetooth: address obrigatório  │
│ │  └─ throw Error se faltante        │
│ │                                    │
│ └─ Retorna provider validado         │
│                                      │
└──────────────────┬───────────────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │ provider.connect()   │
        ├──────────────────────┤
        │ ├─ Try estabelecer   │
        │ │  conexão           │
        │ │                    │
        │ ├─ Catch erro        │
        │ │  └─ Chamar         │
        │ │    onError()       │
        │ │                    │
        │ └─ Throw ou          │
        │    retornar promise  │
        │                      │
        └──────────────────────┘
```
