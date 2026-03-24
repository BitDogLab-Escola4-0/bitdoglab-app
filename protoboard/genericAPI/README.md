## Exemplo de uso da Generic API na main.py:

```
from genericAPI.genericAPI import GenericAPI

# 1. Instancia a API (
bitdoglab = GenericAPI("bitdoglab_v07")

# Ligar LED RGB em Vermelho (Max u16)
bitdoglab.set_rgb(255, 0, 0)

# Tocar um 'Beep'
bitdoglab.play_buzzer(440, 100) # Nota Lá

# Acender o LED central da matriz em Verde (RGB 0-255)
bitdoglab.set_neopixel(12, (0, 255, 0))

# Limpar tudo
# bitdoglab.clear_matrix()
# bitdoglab.set_rgb(0, 0, 0)
´´´


========================================
    LED RGB único (PWM) — catodo comum
   - Azul  : GPIO12
   - Verm. : GPIO13
   - Verde : GPIO11
Freq. 1 kHz — suficiente para não cintilar perceptível
led_b = PWM(Pin(12))
led_r = PWM(Pin(13))
led_g = PWM(Pin(11))

================================================================
  Botões físicos
- A → GPIO5
- B → GPIO6
- C → GPIO10
Todos com pull-up; pressionados = nível BAIXO (0)
button_a = Pin(5, Pin.IN, Pin.PULL_UP)
button_b = Pin(6, Pin.IN, Pin.PULL_UP)
button_c = Pin(10, Pin.IN, Pin.PULL_UP)

================================================================
Buzzer A (GPIO21 via PWM)


=========================================
    MATRIZ NEOPIXEL 5X5 (WS2812B)
- GPIO7
NUM_LEDS = 25
np = neopixel.NeoPixel(Pin(7), NUM_LEDS)
# Mapeamento “zigue-zague” 5x5 para facilitar (linha x coluna → índice físico)
LED_MATRIX = [
    [24, 23, 22, 21, 20],
    [15, 16, 17, 18, 19],
    [14, 13, 12, 11, 10],
    [5,  6,  7,  8,  9 ],
    [4,  3,  2,  1,  0 ]
]
Cores úteis para a matriz (valores pequenos para não “estourar” corrente)
RED     = (50, 0, 0)
GREEN   = (0, 50, 0)
BLUE    = (0, 0, 50)
YELLOW  = (30, 30, 0)
MAGENTA = (30, 0, 30)
CYAN    = (0, 30, 30)
WHITE   = (25, 25, 25)
BLACK   = (0, 0, 0)

=========================================
    JOYSTICK (entradas analógicas):
- VRx → GPIO26 (ADC0)
- VRy → GPIO27 (ADC1)
adc_vrx = ADC(Pin(26))
adc_vry = ADC(Pin(27))

=========================================
    I2c e OLED
- Versõ es V7: SDA=GPIO2, SCL=GPIO3
- Versões <=V6: SDA=GPIO14, SCL=GPIO1

i2c = SoftI2C(scl=Pin(3), sda=Pin(2))
oled = SSD1306_I2C(128, 64, i2c)

================================================================    
    Microfone (ADC) em GP28 — VU-meter simples
adc_mic = machine.ADC(machine.Pin(28))  # entrada analógica do microfone
OFFSET   = int(1.65 / 3.3 * 65536)      # 1,65 V referidos a 3,3 V → valor ADC

"""

