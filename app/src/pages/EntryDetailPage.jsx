import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Button, LoadingSpinner, Modal } from '../components/ui'
import { EntryDetail } from '../components/entries'
import { PageImageViewer } from '../components/pages'
import { getEntry, deleteEntry, updateEntry } from '../services/api'

export default function EntryDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [entry, setEntry] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editDate, setEditDate] = useState('')
  const [editTranscription, setEditTranscription] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    async function fetchEntry() {
      try {
        const data = await getEntry(id)
        setEntry(data.entry || data)
      } catch (err) {
        setError('Failed to load entry')
        console.error('Error fetching entry:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEntry()
  }, [id])

  const handleOpenEdit = () => {
    setEditDate(entry.date ? entry.date.split('T')[0] : '')
    setEditTranscription(entry.transcription || '')
    setSaveError('')
    setShowEditModal(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveError('')

    try {
      const data = await updateEntry(id, { date: editDate, transcription: editTranscription })
      setEntry(data.entry || data)
      setShowEditModal(false)
    } catch (err) {
      setSaveError(err.message || 'Failed to save changes. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      await deleteEntry(id)
      navigate('/')
    } catch (err) {
      setError('Failed to delete entry. Please try again.')
      setShowDeleteModal(false)
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error && !entry) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg inline-block mb-4">
          {error}
        </div>
        <div>
          <Link to="/" className="text-blue-600 hover:underline">
            Return to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  if (!entry) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-gray-900">Entry not found</h3>
        <p className="mt-2 text-gray-500">
          The entry you're looking for doesn't exist or has been deleted.
        </p>
        <Link
          to="/"
          className="mt-4 inline-block text-blue-600 hover:underline"
        >
          Return to Dashboard
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* Header with back button and actions */}
      <div className="flex justify-between items-center mb-6">
        <Link
          to="/"
          className="text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Dashboard
        </Link>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleOpenEdit}
          >
            <svg
              className="w-4 h-4 mr-1"
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
            Edit Entry
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setShowDeleteModal(true)}
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Delete Entry
          </Button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      {/* Two-column layout on larger screens */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Entry details */}
        <EntryDetail entry={entry} />

        {/* Page image - lazy loaded */}
        <div>
          <h3 className="font-medium text-gray-700 mb-3">Journal Page</h3>
          <PageImageViewer pageId={entry.page_id} />
        </div>
      </div>

      {/* Edit entry modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => !isSaving && setShowEditModal(false)}
        title="Edit Entry"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label
              htmlFor="edit-date"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Date
            </label>
            <input
              id="edit-date"
              type="date"
              value={editDate}
              onChange={(e) => setEditDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="edit-transcription"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Transcription
            </label>
            <textarea
              id="edit-transcription"
              value={editTranscription}
              onChange={(e) => setEditTranscription(e.target.value)}
              rows={10}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
            />
          </div>
          {saveError && (
            <div className="bg-red-50 text-red-600 p-3 rounded text-sm">
              {saveError}
            </div>
          )}
          <div className="flex gap-3">
            <Button
              variant="primary"
              onClick={handleSave}
              isLoading={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowEditModal(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Entry"
      >
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete this entry? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <Button
            variant="danger"
            onClick={handleDelete}
            isLoading={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
          <Button
            variant="secondary"
            onClick={() => setShowDeleteModal(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
        </div>
      </Modal>
    </div>
  )
}
