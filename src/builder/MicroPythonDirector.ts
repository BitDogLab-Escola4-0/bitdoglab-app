import { builderNeopixel } from './constroctbuiders/builderNeopixel';
import { builderLedRGB } from './constroctbuiders/builderLedRGB';
import { interpreterBuzzer } from "./product/interpreters/buzzer";
export { toMicropython };

type SendCommandFn = (command: string) => Promise<void>;

function constructer(app: string, instructions: unknown): string[] {
	switch (app) {
		case 'neopixel':
			return builderNeopixel(instructions as { pos: string, cor: string }[]);
		case 'ledRGB':
			return builderLedRGB(instructions as string);
		case 'buzzer':
			return interpreterBuzzer(instructions as { isPressed: boolean, frequency?: number, duration?: number });
		default: // isso será retirado após todos os apps serem feitos
			return ["em construcao..."]
	}
}

function parse(json: string): [string, unknown] {
	const parsed: { string: unknown } = JSON.parse(json);
	const app: string = Object.keys(parsed)[0] as string;
	const instructions: unknown = Object.values(parsed)[0];
	return [app, instructions];
}

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

async function sendToBoard(commands: string[], sendCommand: SendCommandFn) {
  for (const cmd of commands) {
    await sendCommand(cmd);
    await delay(50);
  }
}

function toMicropython(json: string, sendCommand: (command: string) => Promise<void>){
  const params: [string, unknown] = parse(json);
  const commands = constructer(params[0], params[1]);
  sendToBoard(commands, sendCommand);
  return 'sucesso';
}