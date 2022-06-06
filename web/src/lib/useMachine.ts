import { readable } from "svelte/store"
import { interpret } from "xstate"

export function useMachine(machine: any, options: any = {}) {
  const service = interpret(machine, options)

  const store = readable(service.initialState, (set) => {
    service.onTransition((state) => {
      set(state)
    })

    service.start()

    return () => {
      service.stop()
    }
  })

  return {
    state: store,
    send: service.send,
  }
}
