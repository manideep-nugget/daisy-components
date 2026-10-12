import { useState, type ReactNode } from 'react'
import { Button } from '@fluentui/react-components'
import { ArrowCounterclockwiseRegular } from '@fluentui/react-icons'

type PreviewCardProps = {
  id: string
  title: string
  notes: string
  render: () => ReactNode
  kind: 'pattern' | 'foundation'
  source?: 'fluent' | 'composition'
}

export function PreviewCard({ id, title, notes, render, kind, source }: PreviewCardProps) {
  const [reset, setReset] = useState(0)
  return (
    <article className={`preview-card preview-card-${kind}`} aria-labelledby={`component-${id}`}>
      <div className="preview-card-heading"><div className="preview-card-title"><h3 id={`component-${id}`}>{title}</h3><span className="preview-card-type">{kind === 'pattern' ? 'Pattern' : source === 'fluent' ? 'Fluent component' : 'Local composition'}</span></div><Button appearance="subtle" size="small" icon={<ArrowCounterclockwiseRegular />} aria-label={`Reset example: ${title}`} onClick={() => setReset(value => value + 1)}>Reset example</Button></div>
      <div className="preview-stage"><div className="preview-demo" key={reset}>{render()}</div></div>
      <div className="preview-caption">
        <p>{notes}</p>
      </div>
    </article>
  )
}
