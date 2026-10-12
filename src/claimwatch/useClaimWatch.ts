import { createContext, useContext } from 'react'
import type { ActivityEvent, ClaimRecord, DaisyMessage, ExplorerFilters, InfoRequest, IntakeTask, NewClaimInput } from './types'

export type ClaimWatchContextValue = {
  claims: ClaimRecord[]; tasks: IntakeTask[]; requests: InfoRequest[]; events: ActivityEvent[];
  messages: Record<string, DaisyMessage[]>; explorerFilters: ExplorerFilters;
  setExplorerFilters: (patch: Partial<ExplorerFilters>) => void;
  assignTask: (id: string) => void; completeTask: (id: string) => void;
  addNote: (claimId: string, note: string) => void;
  requestInformation: (claimId: string, documents: string[], message: string) => void;
  submitClaim: (input: NewClaimInput) => string; passToReview: (claimId: string) => void;
  sendDaisy: (contextId: string | null, text: string) => void; resetDaisy: (contextId: string | null) => void;
}

export const ClaimWatchContext = createContext<ClaimWatchContextValue | null>(null)

export function useClaimWatch() {
  const context = useContext(ClaimWatchContext)
  if (!context) throw new Error('useClaimWatch must be used within ClaimWatchProvider')
  return context
}
