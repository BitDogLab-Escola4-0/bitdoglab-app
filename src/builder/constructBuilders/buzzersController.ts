import { toMicropython } from "../MicroPythonDirector";
import type { BuzzersData } from "./builderBuzzer";

export type { BuzzersData } from "./builderBuzzer";

export class BuzzersController {
  private isSetupDone = false;

  constructor(
    private sendCommand: (command: string) => Promise<void>,
  ) {}

  async setupBuzzer() {
    if (this.isSetupDone) return;

    const commands = [
      "from genericAPI.genericAPI import GenericAPI",
      'bitdoglab = globals().get("bitdoglab") or GenericAPI("bitdoglab_v07")',
      "bitdoglab.buzzer.duty_u16(0)",
    ];

    for (const command of commands) {
      await this.sendCommand(command);
      await new Promise<void>((resolve) => setTimeout(resolve, 100));
    }

    this.isSetupDone = true;
  }

  private async send(data: BuzzersData) {
    await this.setupBuzzer();

    await toMicropython(
      JSON.stringify({ buzzer: data }),
      this.sendCommand,
    );
  }

  async startBuzzer(frequency: number) {
    await this.send({ isPressed: true, frequency });
  }

  async stopBuzzer(duration: number) {
    await this.send({ isPressed: false, duration });
  }

  resetSetup() {
    this.isSetupDone = false;
  }
}