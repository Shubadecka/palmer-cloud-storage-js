import { useState, useRef } from 'react'

export default function PageUpload({ onFileSelect, selectedFile }) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      onFileSelect(file)
    }
  }

  const handleFileInput = (e) => {
    const file = e.target.files[0]
    if (file) {
      onFileSelect(file)
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
        transition-colors
        ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : selectedFile
            ? 'border-green-400 bg-green-50'
            : 'border-gray-300 hover:border-gray-400 bg-gray-50'
        }
      `}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
      />

      <svg
        className={`mx-auto h-12 w-12 ${
          selectedFile ? 'text-green-500' : 'text-gray-400'
        }`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        {selectedFile ? (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        ) : (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        )}
      </svg>

      {selectedFile ? (
        <div className="mt-4">
          <p className="text-green-700 font-medium">{selectedFile.name}</p>
          <p className="text-sm text-gray-500 mt-1">
            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
          </p>
          <p className="text-sm text-gray-400 mt-2">Click or drag to replace</p>
        </div>
      ) : (
        <div className="mt-4">
          <p className="text-gray-600 font-medium">
            Drag and drop an image here
          </p>
          <p className="text-sm text-gray-500 mt-1">or click to select a file</p>
          <p className="text-xs text-gray-400 mt-2">
            Supports: JPG, PNG, GIF, WebP
          </p>
        </div>
      )}
    </div>
  )
}
