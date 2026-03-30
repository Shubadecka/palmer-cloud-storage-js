import { useState, useEffect } from 'react'
import { format, parseISO } from 'date-fns'

export default function EntryDetail({ entry, onDateSave, isSavingDate }) {
  const [isEditingDate, setIsEditingDate] = useState(false)
  const [dateValue, setDateValue] = useState('')

  // Close the inline editor once the parent confirms the updated date
  useEffect(() => {
    setIsEditingDate(false)
  }, [entry.date])

  const handleEditClick = () => {
    setDateValue(entry.date ? entry.date.split('T')[0] : '')
    setIsEditingDate(true)
  }

  const handleSave = () => {
    if (onDateSave) onDateSave(dateValue)
  }

  const handleCancel = () => {
    setIsEditingDate(false)
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          {isEditingDate ? (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dateValue}
                onChange={(e) => setDateValue(e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSavingDate}
              />
              <button
                onClick={handleSave}
                disabled={isSavingDate || !dateValue}
                className="px-2 py-1 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSavingDate ? 'Saving…' : 'Save'}
              </button>
              <button
                onClick={handleCancel}
                disabled={isSavingDate}
                className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 group">
              <h3 className="text-lg font-semibold text-gray-900">
                {format(parseISO(entry.date), 'EEEE, MMMM d, yyyy')}
              </h3>
              <button
                onClick={handleEditClick}
                title="Edit date"
                className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
            </div>
          )}
          <p className="text-sm text-gray-500 mt-1">
            Entry ID: {entry.id}
          </p>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded-full font-medium ${
            entry.status === 'transcribed'
              ? 'bg-green-100 text-green-700'
              : 'bg-yellow-100 text-yellow-700'
          }`}
        >
          {entry.status === 'transcribed' ? 'Transcribed' : 'Pending'}
        </span>
      </div>

      <div className="border-t pt-4">
        <h4 className="font-medium text-gray-700 mb-2">Transcription</h4>
        {(entry.improved_transcription || entry.raw_ocr_transcription) ? (
          <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
            {entry.improved_transcription || entry.raw_ocr_transcription}
          </p>
        ) : (
          <p className="text-gray-400 italic">
            No transcription available yet. The transcription will appear here once processing is complete.
          </p>
        )}
      </div>
    </div>
  )
}
