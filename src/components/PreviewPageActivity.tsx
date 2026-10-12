import type { ReactNode } from 'react'
import { Tooltip, type TooltipProps } from '@fluentui/react-components'
import { PreviewPageContext, usePreviewOverlay, type PageActivity } from './usePreviewPageActivity'

export function PreviewPageActivity({ active, revision, children }: PageActivity & { children: ReactNode }) {
  return <PreviewPageContext.Provider value={{ active, revision }}>{children}</PreviewPageContext.Provider>
}

export function PreviewTooltip(props: TooltipProps) {
  const [visible, setVisible] = usePreviewOverlay()
  return <Tooltip {...props} visible={visible} onVisibleChange={(event, data) => {
    setVisible(data.visible)
    props.onVisibleChange?.(event, data)
  }} />
}
