export interface BuzzersData {
  isPressed: boolean;
  frequency?: number;
  duration?: number;
}

export function builderBuzzer(data: BuzzersData): string[] {
  if (!data.isPressed) {
    return ["bitdoglab.buzzer.duty_u16(0)"];
  }

  const frequency = data.frequency;

  if (
    frequency === undefined ||
    !Number.isFinite(frequency) ||
    frequency <= 0
  ) {
    throw new Error("Buzzer frequency must be a positive number");
  }

  return [
    `bitdoglab.buzzer.freq(${Math.max(1, Math.round(frequency))})`,
    "bitdoglab.buzzer.duty_u16(700)",
  ];
}