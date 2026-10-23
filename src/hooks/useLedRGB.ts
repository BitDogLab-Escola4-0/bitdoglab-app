import { useState } from "react";
//import { LedRGBController } from "../builder/constroctbuiders/ledRGBControler";
import type { RGB } from "@/types/rgb";
import { toMicropython } from "@/builder/MicroPythonDirector";

/**
 * Custom hook to manage LED state and control
 * 
 * @returns All necessary state and handlers for the component
 */
export const useLedRGB = (
	sendCommand: (command: string) => Promise<void>
) => {
	//const ledRGBController = useRef<LedRGBController | null>(null);
	//const hasInitialized = useRef(false);

	// RGB color values for the currently selected LED
	const [rgb, setRgb] = useState<RGB>({ r: 0, g: 0, b: 0 });

	// Calcular a cor atual baseada nos valores RGB
	const currentColor = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;

	// Inicie o ledRGB pela primeira vez
	//useEffect(() => {
	//	if (hasInitialized.current) return;
	//	hasInitialized.current = true;

	//	//ledRGBController.current = new LedRGBController(sendCommand);
	//	toMicropython(sendCommand);
	//}, [sendCommand]);

	/**
	 * Reset the color to black (off state)
	 */
	const handleClearL = () => {
		setRgb({ r: 0, g: 0, b: 0 });
	};

	/**
	 * Atualiza o valor de um componente RGB específico (r, g ou b)
	 * 
	 * @param component - Componente a ser atualizado ('r', 'g' ou 'b')
	 * @param value - Novo valor para o componente
	 */
	const updateRgbComponent = (component: keyof RGB, value: number) => {
		setRgb(prev => ({
			...prev,
			[component]: value
		}));
	};

	// Função para exportar a configuração atual
	const handleSendL = () => {
		const json = JSON.stringify({ ledRGB: currentColor }, null, 3);
		console.log(json);
		return json;
	};

	// Função para atualizar a placa
	const handleSend = async () => {
		try {
			const json = handleSendL();
			const result = await toMicropython(json, sendCommand);
			console.log(result);
		} catch (error) {
			console.error("Erro ao configurar Led:", error);
		}

	};

	return {
		rgb,
		valueR: rgb.r,
		valueG: rgb.g,
		valueB: rgb.b,
		setValueR: (value: number) => updateRgbComponent('r', value),
		setValueG: (value: number) => updateRgbComponent('g', value),
		setValueB: (value: number) => updateRgbComponent('b', value),
		currentColor,
		handleClearL,
		handleSendL,
		handleSend
	};
};
