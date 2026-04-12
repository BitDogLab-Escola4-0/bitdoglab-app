export function builderNeopixel(instructions: { pos: string, cor: string }[]): string[] {
    // Enviar comandos do Neopixel
    let res: string = "";

    instructions.forEach(dict => {
		const rgbMatch: string[] = dict.cor.match(/\d+/g) as string[];
		const rgb: string = rgbMatch.join(', ');
		const pos: number = mapNumbers(parseInt(dict.pos));
		console.log(`Position: ${pos}, RGB: ${rgb}`);
		res += `${pos}:${rgb};`;
	});

    const micropythonCommands = [
        "from genericAPI.genericAPI import GenericAPI\n",
        'bitdoglab = GenericAPI("bitdoglab_v07")\n',
        `bitdoglab.set_neopixel(${res})\n`,
    ];
    console.log(micropythonCommands);
    return micropythonCommands
}

function mapNumbers(num: number): number {
	const swapMap: Record<number, number> = {
		0: 4, 4: 0,
		1: 3, 3: 1,
		10: 14, 14: 10,
		11: 13, 13: 11,
		20: 24, 24: 20,
		21: 23, 23: 21
	};

	return swapMap[num] ?? num;
}