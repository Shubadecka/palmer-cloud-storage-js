import { useState, useEffect } from 'react'

export default function ImagePreview({ file, onRemove }) {
  const [previewUrl, setPreviewUrl] = useState('')

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)

      // Clean up the URL when component unmounts or file changes
      return () => URL.revokeObjectURL(url)
    }
  }, [file])

  if (!file) return null

  return (
    <div className="mt-4">
      <div className="relative inline-block">
        <img
          src={previewUrl}
          alt="Preview"
          className="max-w-full max-h-96 rounded-lg shadow-lg"
        />
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors shadow-md"
          aria-label="Remove image"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}
