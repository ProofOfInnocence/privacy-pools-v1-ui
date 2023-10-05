import { NotificationOptions } from 'vue-notification'
import { VModal } from 'vue-js-modal/types'
import { RpcProvider, ProviderInstance, WorkerProvider, IDB } from '@/services'
import { sessionStorage } from '@/plugins/session-storage'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    provider: ProviderInstance
  }
}

declare global {
  interface Window {
    id: string
    ethereum: RpcProvider
    snarkjs: {
      groth16: {
        fullProve: CallableFunction
      }
    }
  }
}

declare module '@tornado/circomlib' {
  interface Circom {
    poseidon: CallableFunction
  }
}

declare module 'vue/types/vue' {
  interface Vue {
    $eventsWorker: WorkerProvider
    $indexedDB: IDB
    $modal: VModal
    $set: <T>(object: object, key: string | number, value: T) => T
    $notification: (params: NotificationOptions) => void
  }
}

declare module '@nuxt/types' {
  interface NuxtAppOptions {
    $preventMultitabs: () => void
    $indexedDB: IDB
    $modal: VModal
    $set: <T>(object: object, key: string | number, value: T) => T
    $notification: (params: NotificationOptions) => void
  }

  interface Context {
    $preventMultitabs: () => void
    $indexedDB: IDB
    $modal: VModal
    $set: <T>(object: object, key: string | number, value: T) => T
    $notification: (params: NotificationOptions) => void
  }
}

declare module 'vuex/types/index' {
  interface Store {
    $preventMultitabs: () => void
    $indexedDB: IDB
    $modal: VModal
    $set: <T>(object: object, key: string | number, value: T) => T
    $notification: (params: NotificationOptions) => void
  }
}
