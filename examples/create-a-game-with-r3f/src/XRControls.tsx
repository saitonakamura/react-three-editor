import { useFrame } from "@react-three/fiber"
import { useXR, Controllers } from "@react-three/xr"
import * as React from "react"
import { Object3D } from "three"
import create, { StoreApi, UseBoundStore } from "zustand"
import { subscribeWithSelector } from "zustand/middleware"

// These are removed in Zustand v4
type State = object // unknown
type StateSelector<T extends State, U> = (state: T) => U
type EqualityChecker<T> = (state: T, newState: T) => boolean
type StateListener<T> = (state: T, previousState: T) => void

// Zustand v3 marked deprecations in 3.x, but there's no visible upgrade path
type StoreApiWithSubscribeWithSelector<T extends State> = Omit<
  StoreApi<T>,
  "subscribe"
> & {
  subscribe: {
    (listener: StateListener<T>): () => void
    <StateSlice>(
      selector: StateSelector<T, StateSlice>,
      listener: StateListener<StateSlice>,
      options?: {
        equalityFn?: EqualityChecker<StateSlice>
        fireImmediately?: boolean
      }
    ): () => void
  }
}

type XRControlsState<T extends string = string> = { [K in T]: boolean }

export type XRControlsEntry<T extends string = string> = {
  /** Name of the action */
  name: T
  /** The keys that define it, you can use either event.key, or event.code */
  keys: string[]
  /** If the event receives the keyup event, true by default */
  up?: boolean
}

type XRControlsProps = {
  /** A map of named keys */
  map: XRControlsEntry[]
  /** All children will be able to useXRControls */
  children: React.ReactNode
  /** Optional onchange event */
  onChange?: (name: string, pressed: boolean, state: XRControlsState) => void
  /** Optional event source */
  domElement?: HTMLElement
}

type XRControlsApi<T extends string = string> = [
  StoreApiWithSubscribeWithSelector<XRControlsState<T>>["subscribe"],
  StoreApiWithSubscribeWithSelector<XRControlsState<T>>["getState"],
  UseBoundStore<XRControlsState<T>>
]

function getObjectByPredicate(
  root: Object3D,
  predicate: (obj: Object3D) => boolean
): Object3D | undefined {
  // debugger
  if (predicate(root)) return root

  for (let i = 0, l = root.children.length; i < l; i++) {
    const child = root.children[i]
    const object = getObjectByPredicate(child, predicate)

    if (object !== undefined) {
      return object
    }
  }

  return undefined
}

const context = /*@__PURE__*/ React.createContext<XRControlsApi>(null!)

export function XRControls({ map, children, onChange }: XRControlsProps) {
  const key = map.map((item) => item.name + item.keys).join("-")
  const useControls = React.useMemo(() => {
    return create<XRControlsState>(
      subscribeWithSelector(() =>
        map.reduce((prev, cur) => ({ ...prev, [cur.name]: false }), {})
      )
    )
  }, [key])
  const api: XRControlsApi = React.useMemo(
    () => [useControls.subscribe, useControls.getState, useControls],
    [key]
  )
  const controllers = useXR((x) => x.controllers)
  const set = useControls.setState

  React.useEffect(() => {
    setTimeout(() => {
      controllers.map((c) => {
        const motionController = (
          getObjectByPredicate(c.grip, (o) => "xrControllerModel" in o) as any
        )?.xrControllerModel.motionController
        console.log("AAA", { motionController, grip: c.grip })
      })
    }, 3000)
  }, [controllers])

  useFrame(() => {
    const config = map.map(({ name, keys, up }) => ({
      keys,
      up,
      fn: (value) => {
        // Set zustand state
        set({ [name]: value })
        // Inform callback
        if (onChange) onChange(name, value, api[1]())
      }
    }))
    const keyMap = config.reduce((out, { keys, fn, up = true }) => {
      keys.forEach((key) => (out[key] = { fn, pressed: false, up }))
      return out
    }, {})

    const downHandler = ({ key, code }: XREvent) => {
      const obj = keyMap[key] || keyMap[code]
      if (!obj) return
      const { fn, pressed, up } = obj
      obj.pressed = true
      if (up || !pressed) fn(true)
    }

    const upHandler = ({ key, code }: XREvent) => {
      const obj = keyMap[key] || keyMap[code]
      if (!obj) return
      const { fn, up } = obj
      obj.pressed = false
      if (up) fn(false)
    }

    controllers.map((c) => {
      const motionController = (
        getObjectByPredicate(c.grip, (o) => "xrControllerModel" in o) as any
      )?.xrControllerModel.motionController

      if (motionController) {
        const data = motionController.data
        data.map((componentData) => {
          if (componentData.id === "xr-standard-thumbstick") {
            if (componentData.xAxis > 0.2) {
              downHandler({ key: "xr-standard-thumbstick_xAxis_positive" })
            } else {
              upHandler({ key: "xr-standard-thumbstick_xAxis_positive" })
            }

            if (componentData.xAxis < -0.2) {
              downHandler({ key: "xr-standard-thumbstick_xAxis_negative" })
            } else {
              upHandler({ key: "xr-standard-thumbstick_xAxis_negative" })
            }

            if (componentData.yAxis > 0.2) {
              downHandler({ key: "xr-standard-thumbstick_yAxis_positive" })
            } else {
              upHandler({ key: "xr-standard-thumbstick_yAxis_positive" })
            }

            if (componentData.yAxis < -0.2) {
              downHandler({ key: "xr-standard-thumbstick_yAxis_negative" })
            } else {
              upHandler({ key: "xr-standard-thumbstick_yAxis_negative" })
            }
          } else {
            if (componentData.state === "pressed") {
              downHandler({ key: componentData.id })
            } else {
              upHandler({ key: componentData.id })
            }
          }
        })
      }
    })
  })

  return (
    <context.Provider value={api}>
      <Controllers />
      {children}
    </context.Provider>
  )
}

type Selector<T extends string = string> = (
  state: XRControlsState<T>
) => boolean

export function useXRControls<T extends string = string>(): [
  StoreApiWithSubscribeWithSelector<XRControlsState<T>>["subscribe"],
  StoreApiWithSubscribeWithSelector<XRControlsState<T>>["getState"]
]
export function useXRControls<T extends string = string>(
  sel: Selector<T>
): ReturnType<Selector<T>>
export function useXRControls<T extends string = string>(
  sel?: Selector<T>
):
  | ReturnType<Selector<T>>
  | [
      StoreApiWithSubscribeWithSelector<XRControlsState<T>>["subscribe"],
      StoreApiWithSubscribeWithSelector<XRControlsState<T>>["getState"]
    ] {
  const [sub, get, store] = React.useContext<XRControlsApi<T>>(context)
  if (sel) return store(sel)
  else return [sub, get]
}
