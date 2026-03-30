import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button, LoadingSpinner, Input } from '../components/ui'
import { EntryList } from '../components/entries'
import { getEntries } from '../services/api'

const selectClass =
  'border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white'

export default function DashboardPage() {
  const [entries, setEntries] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [sortBy, setSortBy] = useState('date_written')
  const [sortOrder, setSortOrder] = useState('desc')
  const [filterField, setFilterField] = useState('date_written')

  useEffect(() => {
    async function fetchEntries() {
      setIsLoading(true)
      setError('')
      try {
        const data = await getEntries({ startDate, endDate, sortBy, filterField })
        setEntries(data.entries || [])
      } catch (err) {
        setError('Failed to load entries. Please try again.')
        console.error('Error fetching entries:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEntries()
  }, [startDate, endDate, sortBy, filterField])

  const filterLabel = filterField === 'date_uploaded' ? 'Upload date' : 'Written date'
  const hasFilters = startDate || endDate

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Journal Entries</h2>
        <Link to="/upload">
          <Button>
            <svg
              className="w-5 h-5 mr-2"
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
      <div className="bg-white rounded-lg shadow p-4 mb-4">
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
            <div className="flex items-end">
              <button
                onClick={() => {
                  setStartDate('')
                  setEndDate('')
                }}
                className="text-sm text-blue-600 hover:underline pb-2"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Entry List */}
      <EntryList entries={entries} sortBy={sortBy} sortOrder={sortOrder} />

      {/* Results count */}
      {entries.length > 0 && (
        <p className="mt-4 text-sm text-gray-500 text-center">
          Showing {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
        </p>
      )}
    </div>
  )
}
