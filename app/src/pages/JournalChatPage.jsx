import { useEffect, useMemo, useState } from 'react'
import { Button } from '../components/ui'
import { useAuth } from '../hooks/useAuth'
import { chatWithJournalAgent } from '../services/api'

const INITIAL_MESSAGE = {
  role: 'assistant',
  content: 'Hello! How can I help? You can ask me to summarize trends in your journals or tell you what happened on a specific day.',
}

// Per-user key so switching accounts on the same browser doesn't leak history.
function storageKey(userId) {
  return `journalChat:${userId ?? 'anon'}`
}

function loadSavedState(userId) {
  try {
    const raw = localStorage.getItem(storageKey(userId))
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || !Array.isArray(parsed.messages)) return null
    return parsed
  } catch {
    return null
  }
}

export default function JournalChatPage() {
  const { user } = useAuth()
  const userId = user?.id ?? user?.username ?? null

  const [messages, setMessages] = useState(() => {
    const saved = loadSavedState(userId)
    return saved?.messages?.length ? saved.messages : [INITIAL_MESSAGE]
  })
  const [nextCursor, setNextCursor] = useState(() => loadSavedState(userId)?.nextCursor ?? null)
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState('')

  const canSend = useMemo(() => input.trim().length > 0 && !isSending, [input, isSending])
  const hasConversation = messages.length > 1 || messages[0]?.content !== INITIAL_MESSAGE.content

  useEffect(() => {
    try {
      localStorage.setItem(
        storageKey(userId),
        JSON.stringify({ messages, nextCursor }),
      )
    } catch {
      // Quota exceeded or storage unavailable - ignore; persistence is best-effort.
    }
  }, [messages, nextCursor, userId])

  async function sendMessage(text) {
    const trimmed = text.trim()
    if (!trimmed || isSending) return

    const userMessage = { role: 'user', content: trimmed }
    const nextHistory = [...messages, userMessage]
    setMessages(nextHistory)
    setInput('')
    setError('')
    setIsSending(true)

    try {
      const response = await chatWithJournalAgent(nextHistory)
      const assistantMessage = response?.message
      if (!assistantMessage?.content) {
        throw new Error('Assistant returned an empty response')
      }
      setNextCursor(response?.next_cursor || null)

      setMessages((prev) => [...prev, { role: 'assistant', content: assistantMessage.content }])
    } catch (err) {
      setError(err.message || 'Failed to send message')
      setMessages((prev) => prev.filter((m, idx) => idx !== prev.length - 1 || m.role !== 'user'))
    } finally {
      setIsSending(false)
    }
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (!canSend) return
    sendMessage(input)
  }

  function handleLoadMoreClick() {
    if (!nextCursor) return
    sendMessage(`Load more raw entries using cursor: ${nextCursor}`)
  }

  function handleClearHistory() {
    if (isSending) return
    if (hasConversation && !window.confirm('Clear chat history and start a new conversation?')) {
      return
    }
    setMessages([INITIAL_MESSAGE])
    setNextCursor(null)
    setError('')
    try {
      localStorage.removeItem(storageKey(userId))
    } catch {
      // ignore
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-gray-900">Journal Chat</h1>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleClearHistory}
          disabled={isSending || !hasConversation}
        >
          Clear Chat
        </Button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="h-[60vh] overflow-y-auto p-4 space-y-3">
          {messages.map((message, idx) => (
            <div
              key={`${message.role}-${idx}`}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 text-sm whitespace-pre-wrap ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          {isSending && (
            <div className="text-sm text-gray-500">Assistant is thinking...</div>
          )}
        </div>

        {error && (
          <div className="px-4 pb-2 text-sm text-red-600">{error}</div>
        )}

        <div className="border-t border-gray-200 p-3">
          <div className="flex items-center gap-2 mb-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => sendMessage('Summarize broad trends across my entries this month.')}
              disabled={isSending}
            >
              Summarize Trends
            </Button>
            {nextCursor && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleLoadMoreClick}
                disabled={isSending}
              >
                Load More Raw Entries
              </Button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ask about your journals..."
              disabled={isSending}
            />
            <Button type="submit" variant="primary" disabled={!canSend}>
              Send
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
