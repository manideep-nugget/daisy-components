import { createContext, useContext, useState } from 'react'

export type PageActivity = { active: boolean; revision: number | string }
export const PreviewPageContext = createContext<PageActivity>({ active: true, revision: 0 })

export function usePreviewPageActivity() {
  return useContext(PreviewPageContext)
}

// Page and catalogue revisions expire overlays without resetting preview data.
export function usePreviewOverlay() {
  const { active, revision } = usePreviewPageActivity()
  const [state, setState] = useState({ open: false, revision })
  return [active && state.revision === revision && state.open, (open: boolean) => setState({ open, revision })] as const
}
