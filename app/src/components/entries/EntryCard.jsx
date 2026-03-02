import { Link } from 'react-router-dom'
import { format, parseISO } from 'date-fns'

export default function EntryCard({ entry }) {
  // Truncate transcription for preview
  const preview = entry.transcription
    ? entry.transcription.substring(0, 120) + (entry.transcription.length > 120 ? '...' : '')
    : 'No transcription yet'

  return (
    <Link
      to={`/entry/${entry.id}`}
      className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4 border border-gray-100"
    >
      <div className="flex justify-between items-start mb-3">
        <time className="text-sm font-semibold text-gray-900">
          {format(parseISO(entry.date), 'MMMM d, yyyy')}
        </time>
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
      <p className="text-gray-600 text-sm leading-relaxed">{preview}</p>
    </Link>
  )
}
