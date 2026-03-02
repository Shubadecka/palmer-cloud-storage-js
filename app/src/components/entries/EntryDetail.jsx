import { format, parseISO } from 'date-fns'

export default function EntryDetail({ entry }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {format(parseISO(entry.date), 'EEEE, MMMM d, yyyy')}
          </h3>
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
        {entry.transcription ? (
          <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
            {entry.transcription}
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
