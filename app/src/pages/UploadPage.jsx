import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Input } from '../components/ui'
import { PageUpload } from '../components/pages'
import { uploadPagesBatch, processPage } from '../services/api'

function FileRow({ item, index, onChange, onRemove }) {
  const [previewUrl, setPreviewUrl] = useState('')

  useEffect(() => {
    const url = URL.createObjectURL(item.file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [item.file])

  return (
    <div className="flex items-start gap-4 bg-white border rounded-lg p-3">
      <img
        src={previewUrl}
        alt="Preview"
        className="w-20 h-20 object-cover rounded flex-shrink-0"
      />
      <div className="flex-1 min-w-0 space-y-1">
        <p className="text-sm font-medium text-gray-700 truncate">
          {item.file.name}
        </p>
        <p className="text-xs text-gray-400">
          {(item.file.size / 1024 / 1024).toFixed(2)} MB
        </p>
        <div>
          <label className="text-xs text-gray-500">Start date (optional)</label>
          <input
            type="date"
            value={item.pageStartDate}
            onChange={(e) => onChange(index, 'pageStartDate', e.target.value)}
            className="mt-0.5 w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <button
        type="button"
        onClick={() => onRemove(index)}
        className="text-red-400 hover:text-red-600 p-1 flex-shrink-0"
        aria-label="Remove"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

export default function UploadPage() {
  const [items, setItems] = useState([])
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')

  const navigate = useNavigate()

  const handleFilesSelect = useCallback((files) => {
    setItems((prev) => [
      ...prev,
      ...files.map((file) => ({ file, pageStartDate: '' })),
    ])
  }, [])

  const handleItemChange = useCallback((index, field, value) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    )
  }, [])

  const handleItemRemove = useCallback((index) => {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (items.length === 0) {
      setError('Please select at least one image')
      return
    }
    if (!date) {
      setError('Please enter the uploaded date')
      return
    }

    setIsUploading(true)

    try {
      const files = items.map((i) => i.file)
      const metadata = items.map((i) => ({
        pageStartDate: i.pageStartDate || undefined,
      }))

      const data = await uploadPagesBatch(files, date, metadata)
      const pageIds = (data.pages ?? []).map((p) => p.id)

      // Queue sequential transcription so we don't overwhelm the OCR service.
      // Runs in the background after navigation.
      if (pageIds.length) {
        ;(async () => {
          for (const pid of pageIds) {
            try {
              await processPage(pid)
            } catch (err) {
              console.error(`Transcribe failed for ${pid}:`, err)
            }
          }
        })()
      }

      navigate('/')
    } catch (err) {
      setError(err.message || 'Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Upload Journal Pages
      </h2>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Journal Page Images <span className="text-red-500">*</span>
          </label>
          <PageUpload
            onFilesSelect={handleFilesSelect}
            fileCount={items.length}
          />
        </div>

        {items.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700">
              Selected Images ({items.length})
            </h3>
            {items.map((item, index) => (
              <FileRow
                key={`${item.file.name}-${index}`}
                item={item}
                index={index}
                onChange={handleItemChange}
                onRemove={handleItemRemove}
              />
            ))}
          </div>
        )}

        <Input
          label="Uploaded Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />

        <div className="flex gap-4 pt-4">
          <Button type="submit" isLoading={isUploading}>
            {isUploading
              ? 'Uploading...'
              : `Upload ${items.length || ''} Page${items.length !== 1 ? 's' : ''}`}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
