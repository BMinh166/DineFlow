import { useId, type KeyboardEvent } from 'react'

export type TabItem = {
  disabled?: boolean
  label: string
  value: string
}

type TabsProps = {
  'aria-label'?: string
  className?: string
  onValueChange: (value: string) => void
  tabs: TabItem[]
  value: string
}

export function Tabs({ 'aria-label': ariaLabel = 'Các thẻ', className = '', onValueChange, tabs, value }: TabsProps) {
  const listId = useId()

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, currentIndex: number) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()

    const enabledTabs = tabs.filter(tab => !tab.disabled)
    if (enabledTabs.length === 0) return

    let nextTab: TabItem
    if (event.key === 'Home') nextTab = enabledTabs[0]
    else if (event.key === 'End') nextTab = enabledTabs[enabledTabs.length - 1]
    else {
      const direction = event.key === 'ArrowRight' ? 1 : -1
      let nextIndex = currentIndex
      do {
        nextIndex = (nextIndex + direction + tabs.length) % tabs.length
      } while (tabs[nextIndex].disabled)
      nextTab = tabs[nextIndex]
    }

    onValueChange(nextTab.value)
    document.getElementById(`${listId}-${nextTab.value}`)?.focus()
  }

  return (
    <div aria-label={ariaLabel} className={`flex gap-1 overflow-x-auto border-b border-border ${className}`} role="tablist">
      {tabs.map((tab, index) => {
        const isActive = tab.value === value
        return (
          <button
            aria-selected={isActive}
            className={`shrink-0 border-b-2 px-3 py-2 text-label transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:text-content-disabled ${isActive ? 'border-brand text-brand' : 'border-transparent text-content-secondary hover:text-content'}`}
            disabled={tab.disabled}
            id={`${listId}-${tab.value}`}
            key={tab.value}
            onClick={() => onValueChange(tab.value)}
            onKeyDown={event => handleKeyDown(event, index)}
            role="tab"
            tabIndex={isActive ? 0 : -1}
            type="button"
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
