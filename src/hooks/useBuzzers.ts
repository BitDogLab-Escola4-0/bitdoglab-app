import { useEffect, useRef, useState } from "react";
import { ScreenOrientation } from "@capacitor/screen-orientation";
import { BuzzersController } from "../builder/constroctbuiders/buzzersController";
import type { Note } from "../types/notes";
import { noteToFrequency } from "../types/notes";

/**
 * Custom hook to manage Piano Buzzer state and recording
 * @param sendCommand - Function to send commands to the device
 * @param isRecording - Whether the app is currently recording a performance
 */
export const useBuzzers = (
  sendCommand: (command: string) => Promise<void>,
  isRecording: boolean
) => {
  const buzzersController = useRef<BuzzersController | null>(null);
  const hasInitialized = useRef(false);
  const [octave, setOctave] = useState(4);
  const [isPlaying, setIsPlaying] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  const currentNoteRef = useRef<Note | null>(null); // Controla qual nota está tocando

  // Gravação
  const recordingBuffer = useRef<any[]>([]);
  const recordingStartTime = useRef<number | null>(null);
  const lastEventTime = useRef<number | null>(null);

  // Inicializa o controller uma vez só
  useEffect(() => {
  if (hasInitialized.current) return;
  hasInitialized.current = true;
  
  const initBuzzer = async () => {
    buzzersController.current = new BuzzersController(sendCommand);
    // Faz o setup imediatamente e garante que o buzzer esteja parado
    try {
      await buzzersController.current.setupBuzzer();
      // Envia comando de stop para garantir que o buzzer esteja parado
      await buzzersController.current.stopBuzzer(0);
    } catch (error) {
      console.error("Erro na inicialização do buzzer:", error);
    }
  };
  
  initBuzzer();
}, [sendCommand]);

  // Bloqueia landscape
  useEffect(() => {
    ScreenOrientation.lock({ orientation: "landscape" });
    return () => {
      ScreenOrientation.lock({ orientation: "portrait" });
    };
  }, []);

  // Quando inicia a gravação, zera buffer e timestamps
  useEffect(() => {
    if (isRecording) {
      recordingBuffer.current = [];
      recordingStartTime.current = Date.now();
      lastEventTime.current = recordingStartTime.current;
    }
  }, [isRecording]);

  /**
   * Manipula o evento de pressionar uma tecla (onMouseDown/onTouchStart)
   * IMPORTANTE: Só executa se a nota não estiver já sendo tocada
   * @param note - Nota musical pressionada
   */
  const handleNotePress = async (note: Note) => {
    // Evita comandos duplicados se a mesma nota já estiver tocando
    if (currentNoteRef.current === note && isPlaying) {
      console.log("⚠️ Nota já está sendo tocada:", note);
      return;
    }

    // Se há uma nota tocando, para ela primeiro
    if (isPlaying && currentNoteRef.current) {
      await handleNoteRelease();
      // Pequeno delay para garantir que o comando anterior foi processado
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const selectedOctave = octave;
    const frequency = noteToFrequency(note, selectedOctave);
    startTimeRef.current = Date.now();
    currentNoteRef.current = note;
    setIsPlaying(true);

    console.log(`🎹 Pressionando tecla: ${note} (oitava ${selectedOctave}) - ${frequency}Hz`);

    // Lógica de gravação
    if (isRecording && recordingStartTime.current && lastEventTime.current) {
      const now = Date.now();
      const delay = now - lastEventTime.current;
      recordingBuffer.current.push({
        frequency: Math.round(frequency),
        delay,
        isPressed: true,
        note: note,
        octave: selectedOctave
      });
      lastEventTime.current = now;
    }

    try {
      await buzzersController.current?.startBuzzer(frequency);
    } catch (error) {
      console.error("Erro ao iniciar nota:", error);
      setIsPlaying(false);
      currentNoteRef.current = null;
    }
  };

  /**
   * Manipula o evento de soltar uma tecla (onMouseUp/onTouchEnd)
   * IMPORTANTE: Só executa se há uma nota tocando
   */
  const handleNoteRelease = async () => {
    if (!isPlaying || !currentNoteRef.current || !startTimeRef.current) {
      console.log("⚠️ Nenhuma nota para parar");
      return;
    }

    const duration = Date.now() - startTimeRef.current;

    const minDuration = Math.max(duration, 50);
    setIsPlaying(false);
    startTimeRef.current = null;

    // Lógica de gravação
    if (isRecording && lastEventTime.current) {
      const now = Date.now();
      recordingBuffer.current.push({
        isPressed: false,

        duration: duration,
        delay: now - lastEventTime.current
      });
      lastEventTime.current = now;
    }

    // Reset dos estados antes de enviar comando
    setIsPlaying(false);
    currentNoteRef.current = null;
    startTimeRef.current = null;

    try {
      await buzzersController.current?.stopBuzzer(minDuration);
    } catch (error) {
      console.error("Erro ao parar nota:", error);
    }
  };

  // Método para parar qualquer som que esteja tocando (útil para emergências)
  const forceStopBuzzer = async () => {
    if (isPlaying) {
      console.log("🛑 Forçando parada do buzzer");
      setIsPlaying(false);
      currentNoteRef.current = null;
      startTimeRef.current = null;
      
      try {
        await buzzersController.current?.stopBuzzer(0);
      } catch (error) {
        console.error("Erro ao forçar parada:", error);
      }
    }
  };

  // Expondo o buffer de gravação para uso futuro
  const getRecordingBuffer = () => recordingBuffer.current;

  return {
    octave,
    setOctave,
    isPlaying,
    currentNote: currentNoteRef.current,
    handleNotePress,
    handleNoteRelease,
    forceStopBuzzer, // Método adicional para emergências
    getRecordingBuffer,
    buzzersController: buzzersController.current 
  };
};