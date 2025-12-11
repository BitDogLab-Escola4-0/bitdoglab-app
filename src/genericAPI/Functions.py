import machine                
from machine import PWM, Pin  
from machine import SoftI2C, ADC
import neopixel               
import time
import math
import random                 
from ssd1306 import SSD1306_I2C 

# ======================================================================
#   LED Cátodo Comum
# ======================================================================

def controller_ledRGB(pinR, pinG, pinB, colorR, colorG, colorB):
    pwmR = PWM(pinR)
    pwmG = PWM(pinG)
    pwmB = PWM(pinB)

    pwmR.freq(1000)
    pwmG.freq(1000)
    pwmB.freq(1000)

    pwmR.duty_u16(colorR)
    pwmG.duty_u16(colorG)
    pwmB.duty_u16(colorB)

# ======================================================================
#   Buzzer A
# ======================================================================

def controller_buzzer(pinBuzzer, freq, intensity):
    pwm = PWM(pinBuzzer)
    pwm.freq(freq)
    pwm.duty_u16(intensity)
    return pwm    

# ======================================================================
#   Matriz de LEDs Neopixel 5x5
# ======================================================================

def init_matrix(pin, num_leds=25):
    np = neopixel.NeoPixel(Pin(pin), num_leds)
    return np

def map_numbers(num=25):
    swap_map = {
        0: 4, 4: 0,
        1: 3, 3: 1,
        10: 14, 14: 10,
        11: 13, 13: 11,
        20: 24, 24: 20,
        21: 23, 23: 21
    }
    return swap_map.get(num, num)

def controller_neopixel(np, string):
    instructions = string.split(';')
    for instruction in instructions:
        if not instruction:
            continue
        try:
            pos_str, cor_str = instruction.split(':')
            pos = int(pos_str)
            mapped_pos = map_numbers(pos)
            r, g, b = map(int, cor_str.split(','))
            np[mapped_pos] = (r, g, b)
        except Exception as e:
            print(f"Erro ao processar instrução '{instruction}': {e}")
    np.write()

def clear_matrix(np):
    np.fill((0, 0, 0))
    np.write()

# ======================================================================
#   I2C e OLED
# ======================================================================

def init_oled(sda_pin=14, scl_pin=15):
    i2c = SoftI2C(sda=Pin(sda_pin), scl=Pin(scl_pin), freq=400000)
    oled = SSD1306_I2C(128, 64, i2c)
    oled.fill(0)
    oled.text("OLED Pronto!", 0, 0)
    oled.show()
    return oled

# ======================================================================
#   Botões
# ======================================================================

def init_buttons(pinA, pinB, pinC):
    btnA = Pin(pinA, Pin.IN, Pin.PULL_UP)
    btnB = Pin(pinB, Pin.IN, Pin.PULL_UP)
    btnC = Pin(pinC, Pin.IN, Pin.PULL_UP)
    return btnA, btnB, btnC

def button_pressed(btn, debounce_time=150):
    if btn.value() == 0:  # pressionado
        time.sleep_ms(debounce_time)
        return btn.value() == 0
    return False

# ======================================================================
#   Joystick
# ======================================================================
def init_joystick(pinX, pinY, pinSW):
    joyX = ADC(Pin(pinX))
    joyY = ADC(Pin(pinY))
    joySW = Pin(pinSW, Pin.IN, Pin.PULL_UP)
    return joyX, joyY, joySW


def read_joystick(joyX, joyY, joySW):
    return joyX.read_u16(), joyY.read_u16(), (joySW.value() == 0)

def read_joystick_direction(joyX, joyY, threshold=6000):
    x = joyX.read_u16()
    y = joyY.read_u16()

    center = 32768  # valor teórico, com margem

    if x < center - threshold:
        return "LEFT"
    elif x > center + threshold:
        return "RIGHT"
    elif y < center - threshold:
        return "UP"
    elif y > center + threshold:
        return "DOWN"
    else:
        return "CENTER"

# ======================================================================
#   Microfone
# ======================================================================

def init_mic(pinMic):
    return ADC(Pin(pinMic))

def read_mic(ADC_mic):
    return ADC_mic.read_u16()
