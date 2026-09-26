import { useState } from 'react'
import { Button } from '@/components/ui/Button'

interface ParentGateProps {
  /** The two addends — picked by the caller in an event handler, keeping render pure. */
  question: [number, number]
  onPass: () => void
  onCancel: () => void
}

/** A sum a young child is unlikely to solve, guarding grown-up-only actions. */
export function ParentGate({ question: [a, b], onPass, onCancel }: ParentGateProps) {
  const [answer, setAnswer] = useState('')
  const [wrong, setWrong] = useState(false)

  const submit = () => {
    if (Number(answer) === a + b) onPass()
    else setWrong(true)
  }

  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl bg-white p-6 text-center">
      <p className="text-lg font-bold text-gray-800">
        What is {a} + {b}?
      </p>
      <label className="flex flex-col gap-1 text-sm text-gray-500">
        Answer
        <input
          type="number"
          inputMode="numeric"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="w-24 rounded-lg border border-gray-300 px-3 py-2 text-center text-lg text-gray-800"
        />
      </label>
      {wrong && <p className="text-sm text-red-500">Not quite — ask a grown-up!</p>}
      <div className="flex gap-3">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={submit}>OK</Button>
      </div>
    </div>
  )
}
