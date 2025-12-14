import type { BuzzersData } from "../../constroctbuiders/buzzersController";

export function interpreterBuzzer(data: BuzzersData): string[] {
  const commands: string[] = [];

  if (data.isPressed && data.frequency) {
    
    commands.push(`buzzer.freq(${data.frequency})`);
    commands.push(`buzzer.duty_u16(700)`);
    commands.push(`buzzerAux.duty_u16(300)`);
    //commands.push(`print('Buzzers ligados - Frequencia: ${data.frequency}Hz')`);
    
  } 
  else if (!data.isPressed) {

    commands.push(`buzzer.duty_u16(0)`);
    commands.push(`buzzerAux.duty_u16(0)`);
    
/*     if (data.duration) {
      commands.push(`print('Buzzer desligado - Duracao: ${data.duration}ms')`);
    } else {
      commands.push(`print('Buzzer desligado')`);
    } */
  }
  
  return commands;
}