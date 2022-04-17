import { syncedStore, getYjsValue } from "@syncedstore/core"
import { svelteSyncedStore } from "@syncedstore/svelte"
import { WebrtcProvider } from "y-webrtc"
import { IndexeddbPersistence } from "y-indexeddb"

// Create your SyncedStore store
export const store = syncedStore({ todos: [], data: {}, fragment: "xml" })
export const svelteStore = svelteSyncedStore(store)

// Create a document that syncs automatically using Y-WebRTC
const doc = getYjsValue(store)

// export const disconnect = () => webrtcProvider.disconnect()
// export const connect = () => webrtcProvider.connect()

export const connectRoom = (roomName: string = "default") => {
  const webrtcProvider = new WebrtcProvider(`streamie-text-sync-${roomName}`, doc as any)
  new IndexeddbPersistence(`streamie-text-sync-${roomName}`, doc as any)

  return webrtcProvider
}
