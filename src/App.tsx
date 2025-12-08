import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ConnectionProvider } from "./connection/ConnectionContext";
import { ConnectionStatus } from "./components/ConnectionStatus";
import { useEffect } from "react";
import { ScreenOrientation } from "@capacitor/screen-orientation";
import { BackButtonHandler } from "./components/BackButtonHandler";

// Importações das páginas
import SplashScreen from "./pages/SplashScreen";
import Welcome from "./pages/Welcome";
import RGBLearn from "./pages/OficinaRGB";
import Connection from "./pages/Connection";
import Components from "./pages/Components";
import NotFound from "./pages/NotFound";

// Componentes

//import Botoes from "./pages/Buttons/Buttons";
//import BotoesInfo from "./pages/Buttons/ButtonsFluxograma";

import Buzzers from "./pages/Buzzers/Buzzers";
import BuzzersInfo from "./pages/Buzzers/BuzzersFluxograma";
import BuzzersInfo0 from "./pages/Buzzers/BuzzersInfo0";
import BuzzersInfo1 from "./pages/Buzzers/BuzzersInfo1";
import BuzzersInfo2 from "./pages/Buzzers/BuzzersInfo2";
import BuzzersInfo3 from "./pages/Buzzers/BuzzersInfo3";
import BuzzersInfo4 from "./pages/Buzzers/BuzzersInfo4";
import BuzzersInfo5 from "./pages/Buzzers/BuzzersInfo5";
import BuzzersInfo6 from "./pages/Buzzers/BuzzersInfo6";
import BuzzersInfo7 from "./pages/Buzzers/BuzzersInfo7";
import BuzzersInfo8 from "./pages/Buzzers/BuzzersInfo8";

//import Microfone from "./pages/Microphone/Microphone";
//import Display from "./pages/Display/Display";
//import Joystick from "./pages/Joystick/Joystick";

import Neopixel from "./pages/Neopixel/Neopixel";
import NeopixelInfo from "./pages/Neopixel/NeopixelFluxograma";
import NeopixelInfo1 from "./pages/Neopixel/NeopixelInfo1";
import NeopixelInfo2 from "./pages/Neopixel/NeopixelInfo2";
import NeopixelInfo3 from "./pages/Neopixel/NeopixelInfo3";
import NeopixelInfo4 from "./pages/Neopixel/NeopixelInfo4";
import RGBInfo from "./pages/Neopixel/RGBInfo";

import LedRGB from "./pages/LedRGB/LedRGB";
import LedRGBInfo from "./pages/LedRGB/LedRGBFluxograma";
import LedRGBInfo1 from "./pages/LedRGB/LedRGBInfo1";
import LedRGBInfo2 from "./pages/LedRGB/LedRGBInfo2";
import LedRGBInfo4 from "./pages/LedRGB/LedRGBInfo4";

import EmConstrucao from "./pages/EmConstrucao";

import Snake from "./pages/Snake";

export function App() {
  useEffect(() => {
    ScreenOrientation.lock({ orientation: "portrait" });
  }, []);

  return (
    <ConnectionProvider>
      <BrowserRouter>
        <BackButtonHandler />
        <ConnectionStatus />
        <Routes>
          <Route path="/" element={<SplashScreen />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/oficina-rgb" element={<RGBLearn />} />
          <Route path="/connection" element={<Connection />} />

          {/* Rota pai apenas para organização (não renderiza conteúdo) */}
          <Route path="/components">
            <Route index element={<Components />} />

            <Route path="snake">
              <Route index element={<Snake />} />
            </Route>
            
            <Route path="botoes">
              <Route index element={<EmConstrucao />} />
              <Route path="info" element={<EmConstrucao />} />
            </Route>

            <Route path="buzzers">
              <Route index element={<Buzzers />} />
              <Route path="info" element={<BuzzersInfo />} />
              <Route path="info0" element={<BuzzersInfo0 />} />
              <Route path="info1" element={<BuzzersInfo1 />} />
              <Route path="info2" element={<BuzzersInfo2 />} />
              <Route path="info3" element={<BuzzersInfo3 />} />
              <Route path="info4" element={<BuzzersInfo4 />} />
              <Route path="info5" element={<BuzzersInfo5 />} />
              <Route path="info6" element={<BuzzersInfo6 />} />
              <Route path="info7" element={<BuzzersInfo7 />} />
              <Route path="info8" element={<BuzzersInfo8 />} />
            </Route>
            
            <Route path="microfone" element={<EmConstrucao />} />
            <Route path="display" element={<EmConstrucao />} />
            <Route path="joystick" element={<EmConstrucao />} />


            <Route path="neopixel">
              <Route index element={<Neopixel />} />
              <Route path="info" element={<NeopixelInfo />} />
              <Route path="info1" element={<NeopixelInfo1 />} />
              <Route path="info2" element={<NeopixelInfo2 />} />
              <Route path="info3" element={<NeopixelInfo3 />} />
              <Route path="info4" element={<NeopixelInfo4 />} />
              <Route path="rgb-info" element={<RGBInfo />} />
            </Route>

            <Route path="ledrgb">
              <Route index element={<LedRGB />} />
              <Route path="info" element={<LedRGBInfo />} />
              <Route path="info1" element={<LedRGBInfo1 />} />
              <Route path="info2" element={<LedRGBInfo2 />} />
              <Route path="info3" element={<NeopixelInfo3 />} />
              <Route path="info4" element={<LedRGBInfo4 />} />
              <Route path="rgb-info" element={<RGBInfo />} />
            </Route>
        </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ConnectionProvider>
  );
}
