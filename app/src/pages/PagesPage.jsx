import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button, LoadingSpinner, Modal } from '../components/ui'
import { getPages, updatePage, processPage, deletePage } from '../services/api'

const selectClass =
  'border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white'

function StatusBadge({ status }) {
  const styles =
    status === 'transcribed'
      ? 'bg-green-100 text-green-700'
      : 'bg-yellow-100 text-yellow-700'
  const label = status === 'transcribed' ? 'Transcribed' : 'Pending'
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${styles}`}>
      {label}
    </span>
  )
}

function WrittenDateRange({ startDate, endDate }) {
  if (!startDate && !endDate) return <span className="text-gray-400 text-sm">No written date</span>
  if (startDate === endDate || !endDate) {
    return <span className="text-sm text-gray-600">{startDate}</span>
  }
  return (
    <span className="text-sm text-gray-600">
      {startDate} &ndash; {endDate}
    </span>
  )
}

function PageCard({ page, onEdit, onTranscribe, onDelete, isProcessing }) {
  const isTranscribed = page.status === 'transcribed'

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden flex flex-col">
      <div className="bg-gray-100 aspect-[3/4] overflow-hidden flex items-center justify-center">
        <img
          src={page.imageUrl}
          alt="Journal page"
          className="object-contain w-full h-full"
        />
      </div>
      <div className="p-3 flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <WrittenDateRange startDate={page.page_start_date} endDate={page.page_end_date} />
          <StatusBadge status={page.status} />
        </div>
        {page.notes && (
          <p className="text-xs text-gray-500 line-clamp-2">{page.notes}</p>
        )}
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-gray-400">Uploaded {page.date}</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(page)}
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-0.5"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
            <button
              onClick={() => onDelete(page)}
              className="text-xs text-red-600 hover:text-red-800 flex items-center gap-0.5"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </div>
        </div>
        <button
          onClick={() => onTranscribe(page)}
          disabled={isProcessing}
          className={`mt-0.5 w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded text-xs font-medium transition-colors ${
            isTranscribed
              ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-200'
              : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isProcessing ? (
            <>
              <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Processing…
            </>
          ) : isTranscribed ? (
            <>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Re-transcribe
            </>
          ) : (
            <>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Transcribe
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default function PagesPage() {
  const [pages, setPages] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [sortBy, setSortBy] = useState('date_written')
  const [sortOrder, setSortOrder] = useState('desc')
  const [filterField, setFilterField] = useState('date_written')
  const [editingPage, setEditingPage] = useState(null)
  const [editStartDate, setEditStartDate] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [processingPageId, setProcessingPageId] = useState(null)
  const [confirmReprocessPage, setConfirmReprocessPage] = useState(null)
  const [processError, setProcessError] = useState('')
  const [confirmDeletePage, setConfirmDeletePage] = useState(null)
  const [isDeletingPage, setIsDeletingPage] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    async function fetchPages() {
      setIsLoading(true)
      setError('')
      try {
        const data = await getPages({
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          sortBy,
          filterField,
        })
        setPages(data.pages ?? [])
      } catch (err) {
        setError(err.message || 'Failed to load pages')
      } finally {
        setIsLoading(false)
      }
    }
    fetchPages()
  }, [startDate, endDate, sortBy, filterField])

  const handleTranscribeClick = (page) => {
    setProcessError('')
    if (page.status === 'transcribed') {
      setConfirmReprocessPage(page)
    } else {
      runProcessPage(page.id)
    }
  }

  const runProcessPage = async (pageId) => {
    setProcessingPageId(pageId)
    setConfirmReprocessPage(null)
    setProcessError('')

    try {
      const data = await processPage(pageId)
      const updated = data.page || data
      setPages((prev) => prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)))
    } catch (err) {
      setProcessError(err.message || 'Failed to process page. Please try again.')
    } finally {
      setProcessingPageId(null)
    }
  }

  const handleOpenEdit = (page) => {
    setEditingPage(page)
    setEditStartDate(page.page_start_date || '')
    setSaveError('')
  }

  const handleSavePage = async () => {
    setIsSaving(true)
    setSaveError('')

    try {
      const data = await updatePage(editingPage.id, {
        page_start_date: editStartDate || null,
      })
      const updated = data.page || data
      setPages((prev) => prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)))
      setEditingPage(null)
    } catch (err) {
      setSaveError(err.message || 'Failed to save changes. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeletePage = async () => {
    setIsDeletingPage(true)
    setDeleteError('')

    try {
      await deletePage(confirmDeletePage.id)
      setPages((prev) => prev.filter((p) => p.id !== confirmDeletePage.id))
      setConfirmDeletePage(null)
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete page. Please try again.')
    } finally {
      setIsDeletingPage(false)
    }
  }

  const filterLabel = filterField === 'date_uploaded' ? 'Upload date' : 'Written date'
  const hasFilters = startDate || endDate

  const sortedPages = [...pages].sort((a, b) => {
    const dateA = new Date(sortBy === 'date_uploaded' ? a.date : (a.page_start_date || ''))
    const dateB = new Date(sortBy === 'date_uploaded' ? b.date : (b.page_start_date || ''))
    if (!a.page_start_date && sortBy !== 'date_uploaded') return 1
    if (!b.page_start_date && sortBy !== 'date_uploaded') return -1
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA
  })

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Pages</h1>
        <Link to="/upload">
          <Button size="sm">
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Upload New Page
          </Button>
        </Link>
      </div>

      {/* Sort & Filter Controls */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Sort by</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={selectClass}
            >
              <option value="date_written">Date Written</option>
              <option value="date_uploaded">Date Uploaded</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Order</label>
            <button
              onClick={() => setSortOrder((o) => (o === 'desc' ? 'asc' : 'desc'))}
              className={`${selectClass} flex items-center gap-1.5 cursor-pointer`}
            >
              {sortOrder === 'desc' ? (
                <>
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  Newest first
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                  Oldest first
                </>
              )}
            </button>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Filter by</label>
            <select
              value={filterField}
              onChange={(e) => {
                setFilterField(e.target.value)
                setStartDate('')
                setEndDate('')
              }}
              className={selectClass}
            >
              <option value="date_written">Date Written</option>
              <option value="date_uploaded">Date Uploaded</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">{filterLabel} from</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={selectClass}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">{filterLabel} to</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={selectClass}
            />
          </div>
          {hasFilters && (
            <button
              onClick={() => { setStartDate(''); setEndDate('') }}
              className="text-sm text-blue-600 hover:underline pb-1.5"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : pages.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <svg
            className="mx-auto h-12 w-12 text-gray-300 mb-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          {startDate || endDate
            ? `No pages found for the selected ${filterLabel.toLowerCase()} range.`
            : 'No pages uploaded yet.'}
        </div>
      ) : (
        <>
          {processError && (
            <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{processError}</div>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {sortedPages.map((page) => (
              <PageCard
                key={page.id}
                page={page}
                onEdit={handleOpenEdit}
                onTranscribe={handleTranscribeClick}
                onDelete={(p) => { setDeleteError(''); setConfirmDeletePage(p) }}
                isProcessing={processingPageId === page.id}
              />
            ))}
          </div>
        </>
      )}

      <Modal
        isOpen={!!confirmReprocessPage}
        onClose={() => setConfirmReprocessPage(null)}
        title="Re-transcribe Page"
      >
        <div className="space-y-4">
          <div className="flex gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <svg className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-sm text-yellow-800">
              This page has already been transcribed. Re-transcribing will likely create <strong>duplicate entries</strong>. You will need to manually delete any duplicates afterwards.
            </p>
          </div>
          <p className="text-sm text-gray-600">Are you sure you want to continue?</p>
          <div className="flex gap-3">
            <Button
              variant="primary"
              onClick={() => runProcessPage(confirmReprocessPage.id)}
            >
              Yes, re-transcribe
            </Button>
            <Button variant="secondary" onClick={() => setConfirmReprocessPage(null)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={!!editingPage}
        onClose={() => !isSaving && setEditingPage(null)}
        title="Edit Page"
      >
        <div className="space-y-4">
          <div>
            <label
              htmlFor="edit-page-start-date"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Start date
            </label>
            <p className="text-xs text-gray-500 mb-2">
              The date of the first entry on this page. This is not necessarily the date of every entry — a page may span multiple days.
            </p>
            <input
              id="edit-page-start-date"
              type="date"
              value={editStartDate}
              onChange={(e) => setEditStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {saveError && (
            <div className="bg-red-50 text-red-600 p-3 rounded text-sm">
              {saveError}
            </div>
          )}
          <div className="flex gap-3">
            <Button variant="primary" onClick={handleSavePage} isLoading={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => setEditingPage(null)}
              disabled={isSaving}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={!!confirmDeletePage}
        onClose={() => !isDeletingPage && setConfirmDeletePage(null)}
        title="Delete Page"
      >
        <div className="space-y-4">
          <div className="flex gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <svg className="w-5 h-5 text-red-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-sm text-red-800">
              This will permanently delete the page image and <strong>all associated entries</strong>. This action cannot be undone.
            </p>
          </div>
          {deleteError && (
            <div className="bg-red-50 text-red-600 p-3 rounded text-sm">{deleteError}</div>
          )}
          <div className="flex gap-3">
            <Button
              variant="danger"
              onClick={handleDeletePage}
              isLoading={isDeletingPage}
            >
              {isDeletingPage ? 'Deleting...' : 'Delete'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => setConfirmDeletePage(null)}
              disabled={isDeletingPage}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
