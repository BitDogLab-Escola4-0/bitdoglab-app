import { useState } from "react";

export default function RGBLearn() {
  const [valueR, setValueR] = useState(0);
  const [valueG, setValueG] = useState(0);
  const [valueB, setValueB] = useState(0);

  const redColor = `rgb(${valueR}, 0, 0)`;
  const greenColor = `rgb(0, ${valueG}, 0)`;
  const blueColor = `rgb(0, 0, ${valueB})`;
  const combinedColor = `rgb(${valueR}, ${valueG}, ${valueB})`;

  return (
    <div className="h-screen flex flex-col bg-background p-6 h-screen flex flex-col items-center justify-center gap-3.5">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mt-5">Como as cores funcionam?</h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-6 overflow-y-auto mx-3">
        <p className="text-center text-lg text-gray-700 max-w-md">
          Todas as cores que você vê na tela são feitas misturando três cores: 
          <span className="font-bold text-red-600"> Vermelho</span>,
          <span className="font-bold text-green-600"> Verde</span> e
          <span className="font-bold text-blue-600"> Azul</span>!
        </p>

        <p className="text-center text-md text-gray-600 max-w-md">
          Experimente mover os controles abaixo e veja a mágica acontecer:
        </p>

        {/* Sliders RGB */}
        <div className="w-full max-w-md space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Vermelho (R): {valueR}</label>
            <input
              type="range"
              min="0"
              max="255"
              value={valueR}
              onChange={(e) => setValueR(Number(e.target.value))}
              className="w-full h-3 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, black, rgb(255, 0, 0))`
              }}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Verde (G): {valueG}</label>
            <input
              type="range"
              min="0"
              max="255"
              value={valueG}
              onChange={(e) => setValueG(Number(e.target.value))}
              className="w-full h-3 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, black, rgb(0, 255, 0))`
              }}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Azul (B): {valueB}</label>
            <input
              type="range"
              min="0"
              max="255"
              value={valueB}
              onChange={(e) => setValueB(Number(e.target.value))}
              className="w-full h-3 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, black, rgb(0, 0, 255))`
              }}
            />
          </div>
        </div>

        {/* Visual Demo */}
        <div className="flex flex-row gap-3 items-center flex-wrap justify-center">
          <div 
            className="w-16 h-16 rounded-full border-2 border-gray-300"
            style={{ backgroundColor: redColor }}
          />
          <span className="text-2xl font-bold">+</span>
          <div 
            className="w-16 h-16 rounded-full border-2 border-gray-300"
            style={{ backgroundColor: greenColor }}
          />
          <span className="text-2xl font-bold">+</span>
          <div 
            className="w-16 h-16 rounded-full border-2 border-gray-300"
            style={{ backgroundColor: blueColor }}
          />
          <span className="text-2xl font-bold">=</span>
          <div 
            className="w-20 h-20 rounded-full border-4 border-blue-500 shadow-lg"
            style={{ backgroundColor: combinedColor }}
          />
        </div>

        <div className="bg-blue-100 p-4 rounded-lg max-w-md">
          <p className="text-center text-sm text-blue-900">
            💡 <strong>Dica:</strong> Tente fazer amarelo (R+G), roxo (R+B) ou ciano (G+B)!
          </p>
        </div>
      </div>

      <div className="mt-6">
        <button 
          onClick={() => window.location.href = '/connection'}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors px-3"
        >
          Entendi! Vamos começar
        </button>
      </div>
    </div>
  );
}