import { applyProps, ThreeElements } from "@react-three/fiber"
import sum from "hash-sum"
import { forwardRef } from "react"
import * as THREE from "three"

const keycache = {}
const objcache = new WeakMap()

export const memo: {
  [k in keyof ThreeElements]: React.FC<React.PropsWithRef<ThreeElements[k]>>
} = new Proxy(
  {} as unknown as {
    [k in keyof ThreeElements]: React.PropsWithRef<ThreeElements[k]>
  },
  {
    get: (obj: any, prop: string) => {
      if (obj[prop]) {
        return obj[prop]
      }

      obj[prop] = function ({ name, args = [], _source, ...props }: any, ref) {
        let type = THREE[prop.charAt(0).toUpperCase() + prop.slice(1)]
        let object
        const typeName = prop
        const key = name ? name : sum({ type: typeName, args, ...props })
        console.log(key, name, prop, args, props, typeName)
        const cachedkey = keycache[key]
        if (cachedkey) object = objcache.get(cachedkey)
        else
          objcache.set(
            (keycache[key] = {}),
            (object = applyProps(new type(...args), { name, ...props }))
          )
        return <primitive key={key} object={object} ref={ref} />
      }

      obj[prop] = forwardRef(obj[prop])
      obj[prop].displayName = prop

      return obj[prop]
    }
  }
)
