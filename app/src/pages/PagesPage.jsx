import { useState, useEffect } from 'react'
import { LoadingSpinner } from '../components/ui'
import { getPages } from '../services/api'

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

function PageCard({ page }) {
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
        <p className="text-xs text-gray-400">Uploaded {page.date}</p>
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

  useEffect(() => {
    async function fetchPages() {
      setIsLoading(true)
      setError('')
      try {
        const data = await getPages({
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        })
        setPages(data.pages ?? [])
      } catch (err) {
        setError(err.message || 'Failed to load pages')
      } finally {
        setIsLoading(false)
      }
    }
    fetchPages()
  }, [startDate, endDate])

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pages</h1>

        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Written from</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Written to</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {(startDate || endDate) && (
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
            ? 'No pages found for the selected date range.'
            : 'No pages uploaded yet.'}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {pages.map((page) => (
            <PageCard key={page.id} page={page} />
          ))}
        </div>
      )}
    </div>
  )
}
