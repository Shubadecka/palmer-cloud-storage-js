import EntryCard from './EntryCard'

export default function EntryList({ entries, sortBy = 'date_written', sortOrder = 'desc' }) {
  const sortedEntries = [...entries].sort((a, b) => {
    const dateA = sortBy === 'date_uploaded' ? new Date(a.createdAt) : new Date(a.date)
    const dateB = sortBy === 'date_uploaded' ? new Date(b.createdAt) : new Date(b.date)
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA
  })

  if (entries.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
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
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-gray-900">No journal entries yet</h3>
        <p className="mt-2 text-gray-500">
          Upload your first journal page to get started!
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {sortedEntries.map((entry) => (
        <EntryCard key={entry.id} entry={entry} />
      ))}
    </div>
  )
}
