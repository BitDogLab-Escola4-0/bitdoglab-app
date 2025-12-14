import { BuzzersController } from "./buzzersController";

export async function playbackBuzzerSequence(
  controller: BuzzersController,
  sequence: any[]
) {
  // Fator de compensação para ajustar os tempos
  const COMPENSATION_FACTOR = 0.5; // Reduz os tempos para compensar latências (ajustar conforme necessário)
  // Tempo mínimo para garantir que os comandos sejam executados
  const MIN_DELAY = 30; 

  for (const event of sequence) {
    if (event.delay !== undefined && event.delay > 0) {
      // Aplica o fator de compensação, mas mantém um tempo mínimo
      const adjustedDelay = Math.max(
        MIN_DELAY,
        Math.floor(event.delay * COMPENSATION_FACTOR)
      );
      
      console.log('Delay original:', event.delay, 'Delay ajustado:', adjustedDelay);
      await new Promise(res => setTimeout(res, adjustedDelay));
    }

    if (event.isPressed) {
      const startTime = Date.now();
      await controller.startBuzzer(event.frequency);
      const endTime = Date.now();
      console.log('Tempo real para iniciar nota:', endTime - startTime, 'ms');
    } else {
      const startTime = Date.now();
      await controller.stopBuzzer(0);
      const endTime = Date.now();
      console.log('Tempo real para parar nota:', endTime - startTime, 'ms');
    }
  }
  
  // Garantir que o buzzer está parado no final
  console.log("🎼 Reprodução finalizada - garantindo que buzzer está parado");
  await controller.stopBuzzer(0);
}