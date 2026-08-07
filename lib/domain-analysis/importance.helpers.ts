import type {
  SignalImportanceLevel,
  SignalImportanceMetadata,
} from './importance.types'

export const createSignalImportanceMetadata = (
  active: boolean,
  activeImportance: SignalImportanceLevel
): SignalImportanceMetadata =>
  Object.freeze({
    active,
    importance: active ? activeImportance : 'NEUTRAL',
  })
