import { useState, useEffect } from 'react'
import { LoadingSpinner } from '../ui'
import { getPage } from '../../services/api'

export default function PageImageViewer({ pageId }) {
  const [imageUrl, setImageUrl] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchPage() {
      if (!pageId) return

      setIsLoading(true)
      setError('')

      try {
        const data = await getPage(pageId)
        setImageUrl(data.page?.imageUrl || data.imageUrl)
      } catch (err) {
        setError('Failed to load page image')
        console.error('Error fetching page:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPage()
  }, [pageId])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 bg-gray-100 rounded-lg">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center">
        <svg
          className="mx-auto h-8 w-8 mb-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        {error}
      </div>
    )
  }

  if (!imageUrl) {
    return (
      <div className="bg-gray-100 text-gray-500 p-8 rounded-lg text-center">
        <svg
          className="mx-auto h-12 w-12 mb-2"
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
        No image available
      </div>
    )
  }

  return (
    <div className="bg-gray-100 rounded-lg p-4">
      <img
        src={imageUrl}
        alt="Journal page"
        className="max-w-full mx-auto rounded shadow-lg"
      />
    </div>
  )
}
