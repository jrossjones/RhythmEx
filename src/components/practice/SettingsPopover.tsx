import { useState, useEffect, useRef } from 'react'
import type { PracticeSettings } from '@/types'

interface SettingsPopoverProps {
  settings: PracticeSettings
  onSettingsChange: (settings: PracticeSettings) => void
  disabled: boolean
}

interface ToggleProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled: boolean
}

function Toggle({ label, checked, onChange, disabled }: ToggleProps) {
  return (
    <label className="flex items-center justify-between gap-3 py-1">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${
          disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
        } ${checked ? 'bg-indigo-500' : 'bg-gray-300'}`}
      >
        <span
          className={`inline-block h-5 w-5 translate-y-0.5 rounded-full bg-white shadow transition-transform duration-200 ${
            checked ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>
    </label>
  )
}

export function SettingsPopover({ settings, onSettingsChange, disabled }: SettingsPopoverProps) {
  const [isOpen, setIsOpen] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return

    const handleClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [isOpen])

  return (
    <div className="relative" ref={popoverRef}>
      <button
        type="button"
        data-testid="settings-gear"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
        aria-label="Settings"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {isOpen && (
        <div
          data-testid="settings-popover"
          className="absolute right-0 top-full z-10 mt-2 w-56 rounded-xl bg-white p-4 shadow-lg ring-1 ring-gray-200"
        >
          <h3 className="mb-3 text-sm font-bold text-gray-800">Settings</h3>
          <div className="flex flex-col gap-2">
            <Toggle
              label="Metronome"
              checked={settings.metronomeOn}
              onChange={(val) => onSettingsChange({ ...settings, metronomeOn: val })}
              disabled={disabled}
            />
            <Toggle
              label="Tap Sounds"
              checked={settings.tapSoundOn}
              onChange={(val) => onSettingsChange({ ...settings, tapSoundOn: val })}
              disabled={disabled}
            />
            <Toggle
              label="Strict Mode"
              checked={settings.strictMode}
              onChange={(val) => onSettingsChange({ ...settings, strictMode: val })}
              disabled={disabled}
            />
          </div>
        </div>
      )}
    </div>
  )
}
