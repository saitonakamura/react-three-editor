import "@editable-jsx/rapier"
import { VRButton, XR } from "@react-three/xr"
import { Canvas } from "@react-three/fiber"
import ReactDOM from "react-dom/client"
import Experience from "./Experience"
import "./style.css"
import { XRControls } from "./XRControls"
const root = ReactDOM.createRoot(document.querySelector("#root"))

export function Window({ children }: { children: React.ReactNode }) {
  return <div className="Window">{children}</div>
}

root.render(
  <>
    {/* <VRButton /> */}
    <Canvas
      ref={(node) => {
        console.log("hereee")
        // store.canvas = node
      }}
      camera={{
        fov: 45,
        near: 0.1,
        far: 200,
        position: [2.5, 4, 6]
      }}
    >
      <XR>
        <XRControls
          map={[
            {
              name: "forward",
              keys: ["xr-standard-thumbstick_yAxis_negative"]
            },
            {
              name: "backward",
              keys: ["xr-standard-thumbstick_yAxis_positive"]
            },
            {
              name: "leftward",
              keys: ["xr-standard-thumbstick_xAxis_negative"]
            },
            {
              name: "rightward",
              keys: ["xr-standard-thumbstick_xAxis_positive"]
            },
            {
              name: "jump",
              keys: ["a-button"]
            }
          ]}
        >
          <Experience />
        </XRControls>
      </XR>
    </Canvas>
    {/* <Window>
      <div className="App">
        <Canvas
          ref={(node) => {
            console.log("hereee")
            store.canvas = node
          }}
          camera={{
            fov: 45,
            near: 0.1,
            far: 200,
            position: [2.5, 4, 6]
          }}
        >
          <Game />
        </Canvas>
      </div>
    </Window>
    <ImageList /> */}
  </>
)
