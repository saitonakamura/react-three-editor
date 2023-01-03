export {
  editable,
  Editable,
  EditableElement,
  EditorContext,
  setEditable,
  useEditor
} from "@editable-jsx/core"
export {
  applyProps,
  createEvents,
  createPortal,
  createRoot,
  extend,
  useLoader,
  useThree
} from "@react-three/fiber"
export { button, buttonGroup, folder, levaStore as defaultPanel } from "leva"
export { CameraGizmos } from "./controls/CameraGizmos"
export { PerformanceControls } from "./controls/PerformanceControls"
export { SceneControls } from "./controls/SceneControls"
export { SelectedElementControls } from "./controls/SelectedElementControls"
export { editor } from "./editor"
export { EditorCanvas as Canvas, EditorUI } from "./ThreeFiberEditor"
export {
  Stages,
  useEditorFrame,
  useEditorUpdate,
  useFrame,
  useUpdate
} from "./useFrame"
export {
  Screenshot,
  ScreenshotCanvas,
  useScreenshotStore
} from "./useScreenshotStore"

export function extendControls(t: any, controls: Record<string, {}>) {
  t.controls = controls
}
