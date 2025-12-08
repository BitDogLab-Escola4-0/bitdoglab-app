export { interpreterNeopixel }

function interpreterNeopixel(instructions: { pos: string, cor: string }[]): string[] {
    const res: string[] = [];
    
    // Fator de mapeamento para limitar 255 a 100
    const MAPPING_FACTOR: number = 100 / 255; 

    instructions.forEach(dict => {
        const rgbMatch: string[] = dict.cor.match(/\d+/g) ?? []; 

        if (rgbMatch.length < 3) return; // Garante 3 valores (R, G, B)

        // 2. Extrai os valores originais (0-255)
        const rOriginal: number = parseInt(rgbMatch[0] ?? '0', 10);
        const gOriginal: number = parseInt(rgbMatch[1] ?? '0', 10);
        const bOriginal: number = parseInt(rgbMatch[2] ?? '0', 10);

        // 3. Mapeia os valores de [0, 255] para [0, 100].
        const rMapped: number = Math.round(rOriginal * MAPPING_FACTOR);
        const gMapped: number = Math.round(gOriginal * MAPPING_FACTOR);
        const bMapped: number = Math.round(bOriginal * MAPPING_FACTOR);

        // 4. Montar a string RGB com os valores mapeados
        const rgb: string = `${rMapped}, ${gMapped}, ${bMapped}`;
        
        // 5. Mapear a posição do NeoPixel
        const pos: number = mapNumbers(parseInt(dict.pos));
        
        // 6. Adicionar o comando
        res.push(`np[${pos}] = (${rgb})`);
    });

    res.push(`np.write()`);
    return res;
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