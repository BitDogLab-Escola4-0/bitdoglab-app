export { interpreterLedRGB }

function interpreterLedRGB(instructions: string): string[] {
    const res: string[] = [];

    const rgbMatch: string[] = instructions.match(/\d+/g) ?? [];
    
    // Verifica se existem 3 valores, caso contrário, retorna vazio para evitar erros
    if (rgbMatch.length < 3) return res;

    // 2. Extrai os valores originais (0-255)
    const rOriginal: number = parseInt(rgbMatch[0] ?? '0', 10);
    const gOriginal: number = parseInt(rgbMatch[1] ?? '0', 10);
    const bOriginal: number = parseInt(rgbMatch[2] ?? '0', 10);
    
    // 3. Mapeia os valores de [0, 255] para [0, 100] e aplica o bit shift (<< 8).
    const corR: number = Math.round(rOriginal * (100 / 255)) << 8;
    const corG: number = Math.round(gOriginal * (100 / 255)) << 8;
    const corB: number = Math.round(bOriginal * (100 / 255)) << 8;

    // 4. Gera os comandos.
    res.push(`pwmR.duty_u16(${corR})`);
    res.push(`pwmG.duty_u16(${corG})`);
    res.push(`pwmB.duty_u16(${corB})`);
    
    return res;
}