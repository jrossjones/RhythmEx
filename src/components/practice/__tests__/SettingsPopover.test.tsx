import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SettingsPopover } from '../SettingsPopover'
import type { PracticeSettings } from '@/types'

const defaultSettings: PracticeSettings = {
  metronomeOn: true,
  tapSoundOn: true,
  strictMode: false,
}

describe('SettingsPopover', () => {
  it('renders gear button', () => {
    render(
      <SettingsPopover settings={defaultSettings} onSettingsChange={vi.fn()} disabled={false} />
    )
    expect(screen.getByTestId('settings-gear')).toBeInTheDocument()
  })

  it('popover is hidden by default', () => {
    render(
      <SettingsPopover settings={defaultSettings} onSettingsChange={vi.fn()} disabled={false} />
    )
    expect(screen.queryByTestId('settings-popover')).not.toBeInTheDocument()
  })

  it('click gear opens popover with 3 toggles', () => {
    render(
      <SettingsPopover settings={defaultSettings} onSettingsChange={vi.fn()} disabled={false} />
    )

    fireEvent.click(screen.getByTestId('settings-gear'))

    expect(screen.getByTestId('settings-popover')).toBeInTheDocument()
    expect(screen.getByText('Metronome')).toBeInTheDocument()
    expect(screen.getByText('Tap Sounds')).toBeInTheDocument()
    expect(screen.getByText('Strict Mode')).toBeInTheDocument()
  })

  it('toggling metronome calls onSettingsChange', () => {
    const onChange = vi.fn()
    render(
      <SettingsPopover settings={defaultSettings} onSettingsChange={onChange} disabled={false} />
    )

    fireEvent.click(screen.getByTestId('settings-gear'))

    const switches = screen.getAllByRole('switch')
    // First switch is metronome (currently on)
    fireEvent.click(switches[0])
    expect(onChange).toHaveBeenCalledWith({
      ...defaultSettings,
      metronomeOn: false,
    })
  })

  it('toggling tap sounds calls onSettingsChange', () => {
    const onChange = vi.fn()
    render(
      <SettingsPopover settings={defaultSettings} onSettingsChange={onChange} disabled={false} />
    )

    fireEvent.click(screen.getByTestId('settings-gear'))

    const switches = screen.getAllByRole('switch')
    // Second switch is tap sounds
    fireEvent.click(switches[1])
    expect(onChange).toHaveBeenCalledWith({
      ...defaultSettings,
      tapSoundOn: false,
    })
  })

  it('toggling strict mode calls onSettingsChange', () => {
    const onChange = vi.fn()
    render(
      <SettingsPopover settings={defaultSettings} onSettingsChange={onChange} disabled={false} />
    )

    fireEvent.click(screen.getByTestId('settings-gear'))

    const switches = screen.getAllByRole('switch')
    // Third switch is strict mode (currently off)
    fireEvent.click(switches[2])
    expect(onChange).toHaveBeenCalledWith({
      ...defaultSettings,
      strictMode: true,
    })
  })

  it('toggles are disabled when disabled prop is true', () => {
    render(
      <SettingsPopover settings={defaultSettings} onSettingsChange={vi.fn()} disabled={true} />
    )

    fireEvent.click(screen.getByTestId('settings-gear'))

    const switches = screen.getAllByRole('switch')
    switches.forEach((toggle) => {
      expect(toggle).toBeDisabled()
    })
  })

  it('outside click closes popover', () => {
    render(
      <SettingsPopover settings={defaultSettings} onSettingsChange={vi.fn()} disabled={false} />
    )

    // Open
    fireEvent.click(screen.getByTestId('settings-gear'))
    expect(screen.getByTestId('settings-popover')).toBeInTheDocument()

    // Click outside
    fireEvent.mouseDown(document.body)
    expect(screen.queryByTestId('settings-popover')).not.toBeInTheDocument()
  })
})
