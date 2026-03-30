import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Input } from '../components/ui'
import { PageUpload, ImagePreview } from '../components/pages'
import { uploadPage, processPage } from '../services/api'

export default function UploadPage() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [pageStartDate, setPageStartDate] = useState('')
  const [notes, setNotes] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState('')
  const [error, setError] = useState('')

  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!selectedFile) {
      setError('Please select an image')
      return
    }

    if (!date) {
      setError('Please enter the uploaded date')
      return
    }

    setIsUploading(true)
    setUploadStatus('Uploading...')

    try {
      const formData = new FormData()
      formData.append('image', selectedFile)
      formData.append('date', date)
      if (pageStartDate) {
        formData.append('pageStartDate', pageStartDate)
      }
      if (notes) {
        formData.append('notes', notes)
      }

      const data = await uploadPage(formData)
      const pageId = data.page?.id || data.id

      setUploadStatus('Transcribing...')
      await processPage(pageId)

      navigate('/')
    } catch (err) {
      setError(err.message || 'Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
      setUploadStatus('')
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Upload Journal Page
      </h2>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Journal Page Image <span className="text-red-500">*</span>
          </label>
          <PageUpload
            onFileSelect={setSelectedFile}
            selectedFile={selectedFile}
          />
          <ImagePreview file={selectedFile} onRemove={handleRemoveFile} />
        </div>

        {/* Date Inputs */}
        <Input
          label="Uploaded Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />

        <Input
          label="Page Start Date (optional)"
          type="date"
          value={pageStartDate}
          onChange={(e) => setPageStartDate(e.target.value)}
        />

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Any additional notes about this page..."
          />
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4">
          <Button type="submit" isLoading={isUploading}>
            {isUploading ? uploadStatus : 'Upload Page'}
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
