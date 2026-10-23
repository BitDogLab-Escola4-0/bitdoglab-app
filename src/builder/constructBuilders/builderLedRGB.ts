export function builderLedRGB(instructions: string): string[] {
	const rgbMatch: string[] = instructions.match(/\d+/g) as string[];
    const corR: number = parseInt(rgbMatch.at(0) as string) << 8;
	const corG: number = parseInt(rgbMatch.at(1) as string) << 8;
	const corB: number = parseInt(rgbMatch.at(2) as string) << 8;
    console.log("Instrução recebida para LEDs RGB:", instructions);
    // Enviar comandos dos LEDs
    const micropythonCommands = [
        "from genericAPI.genericAPI import GenericAPI\n",
        "bitdoglab = GenericAPI('bitdoglab_v07')\n",
        `bitdoglab.set_rgb( ${corR}, ${corG}, ${corB})\n`,
    ];
    console.log(micropythonCommands);
    return micropythonCommands
}