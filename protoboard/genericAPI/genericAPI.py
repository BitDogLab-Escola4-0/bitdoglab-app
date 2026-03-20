import machine
import neopixel
import time
from machine import Pin, PWM
from config_pins import VERSIONS

class GenericAPI:
    def __init__(self, version_key="bitdoglab_v07"):
        if version_key not in VERSIONS:
            raise ValueError(f"Versao {version_key} nao cadastrada.")
        
        self.config = VERSIONS[version_key]
        self._init_components()

    def _init_components(self):
        """Inicializa todos os periféricos com base no dicionário de pinos."""
        
        # --- LED RGB ---
        rgb = self.config["led_rgb"]
        self.led_r = PWM(Pin(rgb["r"]))
        self.led_g = PWM(Pin(rgb["g"]))
        self.led_b = PWM(Pin(rgb["b"]))
        # Frequência padrão para evitar cintilação
        for led in [self.led_r, self.led_g, self.led_b]:
            led.freq(1000)
            led.duty_u16(0)

        # --- BUZZER ---
        self.buzzer = PWM(Pin(self.config["buzzer"]["pin"]))
        self.buzzer.duty_u16(0)

        # --- MATRIZ NEOPIXEL ---
        m = self.config["matrix"]
        self.matrix = neopixel.NeoPixel(Pin(m["pin"]), m["num_leds"])
        self.matrix_size = m["num_leds"]

    # --- CONTROLES DO LED RGB ---
    def set_rgb(self, r, g, b):
        self.led_r.duty_u16(r * 255)
        self.led_g.duty_u16(g * 255)
        self.led_b.duty_u16(b * 255)

    # --- CONTROLES DO BUZZER ---
    def play_buzzer(self, freq, duration_ms=200):
        """Toca uma frequência específica."""
        if freq > 0:
            self.buzzer.freq(freq)
            self.buzzer.duty_u16(32768) # 50% de volume
            time.sleep_ms(duration_ms)
            self.buzzer.duty_u16(0)

    # --- CONTROLES DA MATRIZ NEOPIXEL ---
    def set_neopixel(self, index, color, update=True):
        """Define a cor de um LED específico (0-24) na matriz."""
        if 0 <= index < self.matrix_size:
            self.matrix[index] = color # color deve ser (R, G, B) de 0-255
            if update:
                self.matrix.write()

    def clear_matrix(self):
        """Apaga todos os LEDs da matriz."""
        for i in range(self.matrix_size):
            self.matrix[i] = (0, 0, 0)
        self.matrix.write()

