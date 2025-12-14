export function builderLedRGB(instructions: string): string[] {
	const rgbMatch: string[] = instructions.match(/\d+/g) as string[];
	const corR: number = parseInt(rgbMatch.at(0) as string) << 8;
	const corG: number = parseInt(rgbMatch.at(1) as string) << 8;
	const corB: number = parseInt(rgbMatch.at(2) as string) << 8;
    // Enviar comandos dos LEDs
    const micropythonCommands = [
        "from Functions import controller_ledRGB",
        "from board_pinsV7 import Pin_LedR, Pin_LedG, Pin_LedB",
        `controller_ledRGB(Pin_LedR, Pin_LedG, Pin_LedB, ${corR}, ${corG}, ${corB})`,
    ];
    console.log(micropythonCommands);
    return micropythonCommands
}