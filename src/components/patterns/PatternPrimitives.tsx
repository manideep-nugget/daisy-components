import { useState } from 'react'
import { Avatar, Dropdown, Field, Option, Tag, TagPicker, TagPickerControl, TagPickerGroup, TagPickerInput, TagPickerList, TagPickerOption, useId } from '@fluentui/react-components'
import { usePreviewOverlay } from '../usePreviewPageActivity'
import './Patterns.css'

export type PatternOption = { value: string; label: string }
export function PatternSelect({ label, value, options, onChange, disabled }: {
  label?: string; value: string; options: PatternOption[]; onChange: (value: string) => void; disabled?: boolean
}) {
  const [open, setOpen] = usePreviewOverlay()
  const id = useId('pattern-select')
  const control = <Dropdown id={id} aria-label={label ?? 'Choose an option'} listbox={{ className: 'pattern-options' }} disabled={disabled} open={open} onOpenChange={(_, data) => setOpen(data.open)} value={options.find(option => option.value === value)?.label ?? 'Choose an option'} selectedOptions={value ? [value] : []} onOptionSelect={(_, data) => { if (typeof data.optionValue === 'string') onChange(data.optionValue); setOpen(false) }}>
    {options.map(option => <Option key={option.value} value={option.value}>{option.label}</Option>)}
  </Dropdown>
  return label ? <Field label={label}>{control}</Field> : control
}

export type PickerPerson = { id: string; name: string; email: string }
export function PeoplePicker({ people, selected, onChange, label = 'People', excluded = [] }: {
  people: PickerPerson[]; selected: string[]; onChange: (ids: string[]) => void; label?: string; excluded?: string[]
}) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = usePreviewOverlay()
  const id = useId('people-picker')
  const options = people.filter(person => !excluded.includes(person.id) && !selected.includes(person.id) && `${person.name} ${person.email}`.toLowerCase().includes(query.toLowerCase()))
  return <Field label={label}>
    <TagPicker selectedOptions={selected} open={open} onOpenChange={(_, data) => setOpen(data.open)} onOptionSelect={(_, data) => { onChange(data.selectedOptions); setQuery('') }}>
      <TagPickerControl><TagPickerGroup aria-label={`${label} selected`}>
        {selected.map(id => { const person = people.find(person => person.id === id); return <Tag key={id} value={id} dismissible dismissIcon={{ 'aria-label': `Remove ${person?.name ?? id}` }} media={<Avatar name={person?.name} size={20} />}>{person?.name ?? id}</Tag> })}
      </TagPickerGroup><TagPickerInput id={id} aria-label={`Search ${label.toLowerCase()}`} value={query} placeholder="Search name or email" onChange={event => setQuery(event.target.value)} /></TagPickerControl>
      <TagPickerList className="pattern-options">{options.length ? options.map(person => <TagPickerOption key={person.id} value={person.id} text={person.name} media={<Avatar name={person.name} size={28} />} secondaryContent={person.email}>{person.name}</TagPickerOption>) : <div role="option" aria-disabled="true" className="pattern-empty">No people match</div>}</TagPickerList>
    </TagPicker>
  </Field>
}
