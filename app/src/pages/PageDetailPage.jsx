import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { LoadingSpinner } from '../components/ui'
import { getPage, getEntries, updatePage, updateEntry } from '../services/api'

function EditIcon({ onClick, title }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="ml-2 text-gray-400 hover:text-blue-600 transition-colors"
      title={title}
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    </button>
  )
}

function InlineField({ label, value, isEditing, editValue, onEditStart, onEditChange, onSave, onCancel, isSaving, type = 'text', multiline = false }) {
  if (isEditing) {
    return (
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
        {multiline ? (
          <textarea
            value={editValue}
            onChange={(e) => onEditChange(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 text-sm border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
          />
        ) : (
          <input
            type={type}
            value={editValue}
            onChange={(e) => onEditChange(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )}
        <div className="flex gap-2 mt-1.5">
          <button
            onClick={onSave}
            disabled={isSaving}
            className="text-xs px-2.5 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={onCancel}
            disabled={isSaving}
            className="text-xs px-2.5 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center">
        <label className="text-xs font-medium text-gray-500">{label}</label>
        <EditIcon onClick={onEditStart} title={`Edit ${label.toLowerCase()}`} />
      </div>
      <p className={`text-sm mt-0.5 ${value ? 'text-gray-800' : 'text-gray-400 italic'}`}>
        {value || `No ${label.toLowerCase()}`}
      </p>
    </div>
  )
}

function EntryBlock({ entry, onUpdate }) {
  const [editingField, setEditingField] = useState(null)
  const [editDate, setEditDate] = useState('')
  const [editText, setEditText] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const displayText = entry.improved_transcription || entry.raw_ocr_transcription || ''

  const startEdit = (field) => {
    setSaveError('')
    if (field === 'date') {
      setEditDate(entry.date ? entry.date.split('T')[0] : '')
      setEditingField('date')
    } else {
      setEditText(displayText)
      setEditingField('text')
    }
  }

  const cancel = () => setEditingField(null)

  const save = async () => {
    setIsSaving(true)
    setSaveError('')
    try {
      const payload = editingField === 'date'
        ? { date: editDate }
        : { improved_transcription: editText }
      const data = await updateEntry(entry.id, payload)
      onUpdate(data.entry || data)
      setEditingField(null)
    } catch (err) {
      setSaveError(err.message || 'Failed to save')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="border rounded-lg p-4 bg-white">
      <InlineField
        label="Entry Date"
        value={entry.date}
        isEditing={editingField === 'date'}
        editValue={editDate}
        onEditStart={() => startEdit('date')}
        onEditChange={setEditDate}
        onSave={save}
        onCancel={cancel}
        isSaving={isSaving}
        type="date"
      />

      <div className="mt-3">
        {editingField === 'text' ? (
          <div>
            <div className="flex items-center mb-1">
              <label className="text-xs font-medium text-gray-500">Transcription</label>
            </div>
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 text-sm border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
            />
            <div className="flex gap-2 mt-1.5">
              <button
                onClick={save}
                disabled={isSaving}
                className="text-xs px-2.5 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={cancel}
                disabled={isSaving}
                className="text-xs px-2.5 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center">
              <label className="text-xs font-medium text-gray-500">Transcription</label>
              <EditIcon onClick={() => startEdit('text')} title="Edit transcription" />
            </div>
            <p className={`text-sm mt-0.5 whitespace-pre-wrap ${displayText ? 'text-gray-800' : 'text-gray-400 italic'}`}>
              {displayText || 'No transcription'}
            </p>
          </div>
        )}
      </div>

      {saveError && (
        <p className="text-xs text-red-600 mt-2">{saveError}</p>
      )}
    </div>
  )
}

export default function PageDetailPage() {
  const { id } = useParams()
  const [page, setPage] = useState(null)
  const [entries, setEntries] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const [editingField, setEditingField] = useState(null)
  const [editStartDate, setEditStartDate] = useState('')
  const [editNotes, setEditNotes] = useState('')
  const [isSavingPage, setIsSavingPage] = useState(false)
  const [pageSaveError, setPageSaveError] = useState('')

  const loadData = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const [pageData, entriesData] = await Promise.all([
        getPage(id),
        getEntries({ pageId: id, limit: 100 }),
      ])
      setPage(pageData.page || pageData)
      setEntries(entriesData.entries || [])
    } catch (err) {
      setError(err.message || 'Failed to load page')
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => { loadData() }, [loadData])

  const startPageEdit = (field) => {
    setPageSaveError('')
    if (field === 'startDate') {
      setEditStartDate(page?.page_start_date || '')
      setEditingField('startDate')
    } else {
      setEditNotes(page?.notes || '')
      setEditingField('notes')
    }
  }

  const cancelPageEdit = () => setEditingField(null)

  const savePageField = async () => {
    setIsSavingPage(true)
    setPageSaveError('')
    try {
      const payload = editingField === 'startDate'
        ? { page_start_date: editStartDate || null }
        : { notes: editNotes || null }
      const data = await updatePage(id, payload)
      setPage(data.page || data)
      setEditingField(null)
    } catch (err) {
      setPageSaveError(err.message || 'Failed to save')
    } finally {
      setIsSavingPage(false)
    }
  }

  const handleEntryUpdate = (updatedEntry) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === updatedEntry.id ? updatedEntry : e))
    )
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !page) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg inline-block mb-4">
          {error || 'Page not found'}
        </div>
        <div>
          <Link to="/" className="text-blue-600 hover:underline">Back to Pages</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Link to="/" className="text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium mb-6">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Pages
      </Link>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: entries */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Entries ({entries.length})
          </h2>
          {entries.length === 0 ? (
            <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-lg">
              <p>No entries yet.</p>
              <p className="text-sm mt-1">This page needs to be transcribed first.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {entries.map((entry) => (
                <EntryBlock
                  key={entry.id}
                  entry={entry}
                  onUpdate={handleEntryUpdate}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right: page image + metadata */}
        <div>
          <div className="sticky top-6">
            <div className="bg-gray-100 rounded-lg overflow-hidden mb-4">
              <img
                src={page.imageUrl}
                alt="Journal page"
                className="w-full object-contain max-h-[70vh]"
              />
            </div>

            <div className="bg-white rounded-lg border p-4 space-y-4">
              <InlineField
                label="Start Date"
                value={page.page_start_date}
                isEditing={editingField === 'startDate'}
                editValue={editStartDate}
                onEditStart={() => startPageEdit('startDate')}
                onEditChange={setEditStartDate}
                onSave={savePageField}
                onCancel={cancelPageEdit}
                isSaving={isSavingPage}
                type="date"
              />

              <InlineField
                label="Notes"
                value={page.notes}
                isEditing={editingField === 'notes'}
                editValue={editNotes}
                onEditStart={() => startPageEdit('notes')}
                onEditChange={setEditNotes}
                onSave={savePageField}
                onCancel={cancelPageEdit}
                isSaving={isSavingPage}
                multiline
              />

              {pageSaveError && (
                <p className="text-xs text-red-600">{pageSaveError}</p>
              )}

              <div className="text-xs text-gray-400 pt-2 border-t space-y-0.5">
                <p>Uploaded: {page.date}</p>
                <p>Status: {page.status}</p>
                {page.page_end_date && <p>End date: {page.page_end_date}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
