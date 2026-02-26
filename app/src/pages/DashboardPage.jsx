import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button, LoadingSpinner, Input } from '../components/ui'
import { EntryList } from '../components/entries'
import { getEntries } from '../services/api'

export default function DashboardPage() {
  const [entries, setEntries] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    async function fetchEntries() {
      try {
        const data = await getEntries({ startDate, endDate })
        setEntries(data.entries || [])
      } catch (err) {
        setError('Failed to load entries. Please try again.')
        console.error('Error fetching entries:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEntries()
  }, [startDate, endDate])

  // Filter entries by date range (client-side backup filter)
  const filteredEntries = entries.filter((entry) => {
    const entryDate = new Date(entry.date)
    if (startDate && entryDate < new Date(startDate)) return false
    if (endDate && entryDate > new Date(endDate)) return false
    return true
  })

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

      {/* Date Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            type="date"
            label="From"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="flex-1"
          />
          <Input
            type="date"
            label="To"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="flex-1"
          />
          {(startDate || endDate) && (
            <div className="flex items-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setStartDate('')
                  setEndDate('')
                }}
              >
                Clear Filters
              </Button>
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
      <EntryList entries={filteredEntries} />

      {/* Results count */}
      {filteredEntries.length > 0 && (
        <p className="mt-4 text-sm text-gray-500 text-center">
          Showing {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'}
        </p>
      )}
    </div>
  )
}
