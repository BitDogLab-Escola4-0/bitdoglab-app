from genericAPI.genericAPI import GenericAPI

# 1. Instancia a API (
bitdoglab = GenericAPI("bitdoglab_v07")

instruction = "0:255,0,0;5:0,255,0"

# Acender o LED central da matriz em Verde (RGB 0-255)
bitdoglab.set_neopixel(instruction)