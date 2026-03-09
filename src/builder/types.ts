export interface ModuleConfig {
  neopixel?: Array<{
    pos: string;
    cor: string;
  }>;

  ledrgb?: string;

  // Adicione outros módulos aqui conforme necessário
  // motor?: Array<{ ... }>;
  // sensor?: Array<{ ... }>;
}

export interface IMicroPythonBuilder {
  reset(): void;
  build(): void;
  getResult(): string;
}