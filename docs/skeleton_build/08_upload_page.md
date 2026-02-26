# Step 8: Upload Page

Build the page for uploading new journal page images.

## Concepts

- **File Input**: HTML file input for selecting images
- **Drag and Drop**: Native HTML5 drag and drop API
- **File Preview**: Using URL.createObjectURL() for local previews
- **FormData**: Sending files to an API
- **Progress Indication**: Showing upload progress

## Tasks

### 8.1 Create PageUpload Component

Create `src/components/pages/PageUpload.jsx`:

A drag-and-drop zone that accepts image files.

**Props:**
- `onFileSelect` - callback when a file is selected
- `selectedFile` - the currently selected file (for preview)

**Features:**
- Click to open file picker
- Drag and drop a file
- Visual feedback on drag over
- File type validation (images only)

**Example structure:**
```jsx
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
        ${isDragging 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-300 hover:border-gray-400'
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
      
      {selectedFile ? (
        <div>
          <p className="text-gray-600 mb-2">Selected: {selectedFile.name}</p>
          <p className="text-sm text-gray-400">Click or drag to replace</p>
        </div>
      ) : (
        <div>
          <p className="text-gray-600 mb-2">
            Drag and drop an image here, or click to select
          </p>
          <p className="text-sm text-gray-400">
            Supports: JPG, PNG, GIF
          </p>
        </div>
      )}
    </div>
  )
}
```

### 8.2 Create Image Preview Component

Create `src/components/pages/ImagePreview.jsx`:

Shows a preview of the selected image before upload.

**Props:**
- `file` - the File object to preview
- `onRemove` - callback to clear the selection

```jsx
import { useState, useEffect } from 'react'
import { Button } from '../ui'

export default function ImagePreview({ file, onRemove }) {
  const [previewUrl, setPreviewUrl] = useState('')
  
  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      
      // Clean up the URL when component unmounts
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
          className="max-w-full max-h-96 rounded-lg shadow"
        />
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600"
        >
          ×
        </button>
      </div>
    </div>
  )
}
```

### 8.3 Build UploadPage

Update `src/pages/UploadPage.jsx`:

**State to manage:**
- `selectedFile` - the selected File object
- `date` - the journal page date
- `notes` - optional notes
- `isUploading` - boolean
- `error` - string

**Form flow:**
1. User selects/drops an image
2. User enters the journal page date
3. User clicks "Upload"
4. Create FormData with file and metadata
5. POST to `/api/pages`
6. On success, navigate to dashboard
7. On error, show error message

**Example structure:**
```jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Input } from '../components/ui'
import PageUpload from '../components/pages/PageUpload'
import ImagePreview from '../components/pages/ImagePreview'
// import { uploadPage } from '../services/api' // uncomment when API ready

export default function UploadPage() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [date, setDate] = useState('')
  const [notes, setNotes] = useState('')
  const [isUploading, setIsUploading] = useState(false)
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
      setError('Please enter the journal page date')
      return
    }
    
    setIsUploading(true)
    
    try {
      // Create FormData for file upload
      const formData = new FormData()
      formData.append('image', selectedFile)
      formData.append('date', date)
      if (notes) {
        formData.append('notes', notes)
      }
      
      // await uploadPage(formData) // uncomment when API ready
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      navigate('/')
    } catch (err) {
      setError(err.message || 'Upload failed')
    } finally {
      setIsUploading(false)
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
        <div className="bg-red-50 text-red-600 p-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Journal Page Image
          </label>
          <PageUpload
            onFileSelect={setSelectedFile}
            selectedFile={selectedFile}
          />
          <ImagePreview file={selectedFile} onRemove={handleRemoveFile} />
        </div>
        
        <Input
          label="Journal Page Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        
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
        
        <div className="flex gap-4">
          <Button type="submit" isLoading={isUploading}>
            {isUploading ? 'Uploading...' : 'Upload Page'}
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
```

### 8.4 Create Index File

Create `src/components/pages/index.js`:

```jsx
export { default as PageUpload } from './PageUpload'
export { default as ImagePreview } from './ImagePreview'
```

### 8.5 Optional: Add Upload Progress

For large files, you might want to show upload progress. This requires using XMLHttpRequest or a library like Axios that supports progress events.

**Example with XMLHttpRequest:**
```jsx
const uploadWithProgress = (formData, onProgress) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100)
        onProgress(percent)
      }
    })
    
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.response))
      } else {
        reject(new Error('Upload failed'))
      }
    })
    
    xhr.addEventListener('error', () => reject(new Error('Upload failed')))
    
    xhr.open('POST', '/api/pages')
    xhr.send(formData)
  })
}
```

**Progress UI:**
```jsx
{isUploading && uploadProgress < 100 && (
  <div className="mt-4">
    <div className="bg-gray-200 rounded-full h-2">
      <div
        className="bg-blue-600 h-2 rounded-full transition-all"
        style={{ width: `${uploadProgress}%` }}
      />
    </div>
    <p className="text-sm text-gray-500 mt-1">{uploadProgress}% uploaded</p>
  </div>
)}
```

## Checkpoint

At this point you should have:
- [ ] PageUpload component with drag-and-drop
- [ ] ImagePreview component showing selected file
- [ ] UploadPage with form for date and notes
- [ ] File type validation (images only)
- [ ] Loading state during upload
- [ ] Navigation back to dashboard after success

## Next Step

Continue to [09_entry_detail_page.md](./09_entry_detail_page.md) to build the entry detail view.
