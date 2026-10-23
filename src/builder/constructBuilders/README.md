# 📁 Pasta `/utils`

Esta pasta contém os arquivos responsáveis por **controlar os componentes físicos** da placa (como o Neopixel), fazendo a **ponte entre a interface (frontend) e o backend**, que envia comandos em **MicroPython** para o hardware.

## 📌 Estrutura

Para cada componente da placa, deve existir um arquivo `<Componente>Controller.ts`. Esses arquivos seguem um padrão comum e são responsáveis por:

1. **Receber os dados da interface** (por exemplo, configurações de cor dos LEDs).
2. **Transformar esses dados em JSON**, em um formato esperado pelo backend.
3. **Converter esse JSON em comandos MicroPython**, utilizando um utilitário como `toMicropython.ts`.
4. **Enviar os comandos para a placa**, através de uma função de comunicação (ex: `sendCommand`).

## 🔁 Expansão

Para adicionar um novo componente:

1. Crie um arquivo `/<componente>Controller.ts` nesta pasta.
2. Implemente um método `setup<Componente>()` com os comandos iniciais em MicroPython.
3. Implemente um método `send<Componente>Configurations(...)` que transforma o estado da interface em JSON e depois em comandos MicroPython.
4. Utilize a função `sendCommand` injetada para enviar os comandos à placa.

GenericController.ts
```ts
import { toMicropython } from "../json/toMicropython";

export interface GenericData {
  // Defina aqui os campos necessários
  [key: string]: any;
}

export class GenericController {
  private sendCommand: (command: string) => Promise<void>;

  constructor(sendCommand: (command: string) => Promise<void>) {
    this.sendCommand = sendCommand;
  }

  /**
   * Método para enviar comandos iniciais de setup/configuração.
   * Deve ser sobrescrito ou modificado conforme a necessidade.
   */
  async setupGeneric() {
    const setupCommands: string[] = [
      "\x03\r\n",
      // comandos de setup em micropython aqui
    ];

    for (const cmd of setupCommands) {
      await this.sendCommand(cmd);
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  /**
   * Método para processar dados da interface, converter para JSON e enviar comandos para o dispositivo.
   * @param dataElements - elementos DOM ou dados da interface que serão processados
   */
  async sendConfigurations(dataElements: NodeListOf<Element>) {
    const dados: GenericData[] = [];

    //Logica para gerar o json aqui

    const json = JSON.stringify({ deviceData: dados }, null, 3);

    try {
      // Setup inicial
      await this.setupNeopixel();

      // Enviar comandos dos LEDs
      const micropythonCommands = toMicropython(json);
      for (const command of micropythonCommands) {
        await this.sendCommand(command);
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      console.log("Comandos enviados com sucesso!");
    } catch (error) {
      console.error("Erro ao enviar comandos:", error);
      throw error;
    }
  }
}
```