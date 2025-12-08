import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Dialog } from "@capacitor/dialog";

export default function Welcome() {
  const navigate = useNavigate();

  const hasShown = useRef(false);
  useEffect(() => {
    if (!hasShown.current) {
      hasShown.current = true;
      console.log("Mostrando o disclaimer...");
      Dialog.alert({
        title: "Aviso - Versão Antecipada",
        message: `Este aplicativo está em fase de desenvolvimento.
Algumas funcionalidades podem não funcionar corretamente.

Agradecemos sua compreensão!`,
      });
    }
  }, []);

  return (
    <div className="bg-gradient-pink-blue h-screen flex flex-col items-center justify-center gap-6 px-4">
      <h2 className="text-ubuntu font-bold text-lg px-4 py-2 text-center text-white">
        Olá! Seja bem vindo ao
      </h2>

      <h1 className="text-ubuntu text-5xl font-bold text-center">
        <span className="text-blue-500">Bit</span>
        <span className="text-pink-500">Dog</span>
        <span className="text-black">Lab</span>
      </h1>

      <h2 className="text-ubuntu font-medium text-lg px-4 py-2 text-center text-white">
        Venha traçar uma jornada de aprendizado e de criatividade
      </h2>

      <Button onClick={() => navigate("/oficina-rgb")} className="mt-4">
        Começar
      </Button>
    </div>
  );
}
