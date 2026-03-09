import { useEffect, useState } from "react";
//import { NeopixelController } from "../builder/constroctbuiders/neopixelController";
import type { RGB } from "@/types/rgb";
import { rgbToString, stringToRgb } from "@/types/rgb";
import { toMicropython } from "@/builder/MicroPythonDirector";

/**
 * Custom hook to manage Neopixel LED matrix state and control
 * 
 * @param sendCommand - Function to send commands to the device
 * @param totalLEDs - Total number of LEDs in the matrix
 * @returns All necessary state and handlers for the Neopixel component
 */
export const useNeopixel = (
	sendCommand: (command: string) => Promise<void>,
	totalLEDs: number
) => {
	//const neopixelController = useRef<NeopixelController | null>(null);
	//const hasInitialized = useRef(false);

	// RGB color values for the currently selected LED
	const [rgb, setRgb] = useState<RGB>({ r: 0, g: 0, b: 0 });

	// Track which LED is currently selected
	const [selectedLEDIndex, setSelectedLEDIndex] = useState<number | null>(null);

	// Store all LED colors (initialized to black)
	const [ledColors, setLedColors] = useState<string[]>(
		Array(totalLEDs).fill('rgb(0, 0, 0)')
	);

	// Modal states
	const [saveModalOpen, setSaveModalOpen] = useState(false);
	const [loadManageModalOpen, setLoadManageModalOpen] = useState(false);

	// Initialize the NeopixelController once
	//useEffect(() => {
	//	if (hasInitialized.current) return;
	//	hasInitialized.current = true;

	//	neopixelController.current = new NeopixelController(sendCommand);
	//}, [sendCommand]);

	// Update the selected LED's color when RGB values change
	useEffect(() => {
		if (selectedLEDIndex !== null) {
			const newColor = rgbToString(rgb);
			setLedColors(prev => {
				const newColors = [...prev];
				newColors[selectedLEDIndex] = newColor;
				return newColors;
			});
		}
	}, [rgb, selectedLEDIndex]);

	/**
	 * Update a specific RGB component (r, g, or b)
	 * 
	 * @param component - Component to update ('r', 'g', or 'b')
	 * @param value - New value for the component
	 */
	const updateRgbComponent = (component: keyof RGB, value: number) => {
		setRgb(prev => ({
			...prev,
			[component]: value
		}));
	};

	/**
	 * Handle LED selection and update color sliders based on LED's current color
	 */
	const handleLEDSelected = (index: number) => {
		setSelectedLEDIndex(index);

		// Update RGB values based on the selected LED's current color
		const color = ledColors[index];
		if (color) {
			setRgb(stringToRgb(color));
		}
	};

	/**
	 * Reset all LEDs to black (off state)
	 */
	const handleClear = () => {
		setLedColors(Array(totalLEDs).fill('rgb(0, 0, 0)'));
		setRgb({ r: 0, g: 0, b: 0 });
	};

	/**
	 * Send the current LED configuration to the device
	 */
	const handleSend = async () => {
		try {
			const activeLeds = ledColors
				.map((color, index) => ({
					pos: index.toString(),
					cor: color
				}))
				.filter(led => led.cor !== 'rgb(0, 0, 0)'); // Only include LEDs that are not black

			const json = JSON.stringify({ neopixel: activeLeds }, null, 3);
    		console.log(json);

			toMicropython(json, sendCommand);
		} catch (error) {
			console.error("Erro ao configurar LEDs:", error);
		}
	};

	/**
	 * Open the save modal
	 */
	const handleOpenSaveModal = () => {
		setSaveModalOpen(true);
	};

	/**
	 * Open the load/manage modal
	 */
	const handleOpenLoadManage = () => {
		setLoadManageModalOpen(true);
	};

	/**
	 * Get current data for saving
	 */
	const getCurrentData = () => {
		return {
			ledColors: ledColors,
			totalLEDs: totalLEDs,
			timestamp: new Date().toISOString()
		};
	};

	/**
	 * Load a saved configuration
	 */
	const handleLoadConfiguration = (data: any) => {
		if (data && data.ledColors && Array.isArray(data.ledColors)) {
			// Ensure the loaded data has the correct number of LEDs
			const loadedColors = data.ledColors.slice(0, totalLEDs);
			
			// Fill with black if the loaded configuration has fewer LEDs
			while (loadedColors.length < totalLEDs) {
				loadedColors.push('rgb(0, 0, 0)');
			}
			
			setLedColors(loadedColors);
			
			// Reset selected LED and RGB values
			setSelectedLEDIndex(null);
			setRgb({ r: 0, g: 0, b: 0 });
		}
	};

	return {
		// RGB values (for compatibility)
		rgb,
		valueR: rgb.r,
		valueG: rgb.g,
		valueB: rgb.b,
		setValueR: (value: number) => updateRgbComponent('r', value),
		setValueG: (value: number) => updateRgbComponent('g', value),
		setValueB: (value: number) => updateRgbComponent('b', value),
		
		// LED state
		selectedLEDIndex,
		ledColors,
		
		// LED handlers
		handleLEDSelected,
		handleClear,
		handleSend,
		
		// Modal states
		saveModalOpen,
		setSaveModalOpen,
		loadManageModalOpen,
		setLoadManageModalOpen,
		
		// Modal handlers
		handleOpenSaveModal,
		handleOpenLoadManage,
		getCurrentData,
		handleLoadConfiguration
	};
};