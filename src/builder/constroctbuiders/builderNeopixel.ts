export function builderNeopixel(instructions: { pos: string, cor: string }[]): string[] {
    // Enviar comandos do Neopixel
    const res: string[] = [];

    instructions.forEach(dict => {
		const rgbMatch: string[] = dict.cor.match(/\d+/g) as string[];
		const rgb: string = rgbMatch.join(', ');
		const pos: number = mapNumbers(parseInt(dict.pos));
		res.push(`np[` + pos + `] = (${rgb})`);
	});

    const micropythonCommands = [
        "from Functions import init_matrix, controller_neopixel, clear_matrix",
        "from board_pinsV7 import Pin_Matriz",
        "np = init_matrix(Pin_Matriz)",
        "clear_matrix(np)",
        `controller_neopixel(np, ${res})`,
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