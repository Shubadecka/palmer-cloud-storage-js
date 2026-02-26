# Step 9: Entry Detail Page

Build the page that displays a single entry with its transcription and lazy-loaded page image.

## Concepts

- **URL Parameters**: Extracting the entry ID from the URL using `useParams()`
- **Lazy Loading**: Only fetching the page image when needed
- **Conditional Fetching**: Making a second API call based on data from the first
- **Delete Confirmation**: Using a modal before destructive actions

## Tasks

### 9.1 Create PageImageViewer Component

Create `src/components/pages/PageImageViewer.jsx`:

A component that fetches and displays a page image by ID.

**Props:**
- `pageId` - the ID of the page to fetch

**State:**
- `imageUrl` - the image URL after fetching
- `isLoading` - boolean
- `error` - string

**Behavior:**
- On mount (and when pageId changes), fetch the page from `/api/pages/:id`
- Show loading spinner while fetching
- Display the image when loaded
- Show error if fetch fails

```jsx
import { useState, useEffect } from 'react'
import { LoadingSpinner } from '../ui'
// import { getPage } from '../../services/api' // uncomment when API ready

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
        // const page = await getPage(pageId) // uncomment when API ready
        // setImageUrl(page.imageUrl)
        
        // Temporary: Use a placeholder image
        await new Promise(resolve => setTimeout(resolve, 800))
        setImageUrl('https://via.placeholder.com/800x1000?text=Journal+Page')
      } catch (err) {
        setError('Failed to load page image')
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
      <div className="bg-red-50 text-red-600 p-4 rounded-lg">
        {error}
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
```

### 9.2 Create EntryDetail Component

Create `src/components/entries/EntryDetail.jsx`:

Displays the full entry information including transcription.

**Props:**
- `entry` - the entry object

```jsx
import { format } from 'date-fns'

export default function EntryDetail({ entry }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {format(new Date(entry.date), 'EEEE, MMMM d, yyyy')}
          </h3>
          <p className="text-sm text-gray-500">
            Entry ID: {entry.id}
          </p>
        </div>
        <span className={`text-xs px-2 py-1 rounded ${
          entry.status === 'transcribed'
            ? 'bg-green-100 text-green-700'
            : 'bg-yellow-100 text-yellow-700'
        }`}>
          {entry.status === 'transcribed' ? 'Transcribed' : 'Pending'}
        </span>
      </div>
      
      <div className="border-t pt-4">
        <h4 className="font-medium text-gray-700 mb-2">Transcription</h4>
        {entry.transcription ? (
          <p className="text-gray-600 whitespace-pre-wrap">
            {entry.transcription}
          </p>
        ) : (
          <p className="text-gray-400 italic">
            No transcription available yet. Check back later.
          </p>
        )}
      </div>
    </div>
  )
}
```

### 9.3 Build EntryDetailPage

Update `src/pages/EntryDetailPage.jsx`:

**State:**
- `entry` - the entry object from API
- `isLoading` - boolean
- `error` - string
- `showDeleteModal` - boolean

**Flow:**
1. Extract `id` from URL using `useParams()`
2. Fetch entry from `/api/entries/:id` on mount
3. Display entry details and page image (lazy loaded)
4. Provide delete functionality with confirmation

```jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Button, LoadingSpinner, Modal } from '../components/ui'
import EntryDetail from '../components/entries/EntryDetail'
import PageImageViewer from '../components/pages/PageImageViewer'
// import { getEntry, deleteEntry } from '../services/api' // uncomment when API ready

export default function EntryDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [entry, setEntry] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  
  useEffect(() => {
    async function fetchEntry() {
      try {
        // const data = await getEntry(id) // uncomment when API ready
        
        // Temporary mock data
        const data = {
          id: parseInt(id),
          date: '2024-01-15',
          transcription: 'Today I went to the park and saw many beautiful flowers blooming in the garden. The weather was perfect - sunny with a light breeze. I sat on a bench and watched the children playing. It reminded me of my own childhood summers.\n\nLater, I stopped by the cafe and had my favorite latte while reading a book. A perfect day.',
          status: 'transcribed',
          page_id: 101
        }
        
        setEntry(data)
      } catch (err) {
        setError('Failed to load entry')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchEntry()
  }, [id])
  
  const handleDelete = async () => {
    setIsDeleting(true)
    
    try {
      // await deleteEntry(id) // uncomment when API ready
      await new Promise(resolve => setTimeout(resolve, 500))
      navigate('/')
    } catch (err) {
      setError('Failed to delete entry')
      setShowDeleteModal(false)
    } finally {
      setIsDeleting(false)
    }
  }
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded">
        {error}
        <Link to="/" className="block mt-2 text-blue-600 hover:underline">
          Return to Dashboard
        </Link>
      </div>
    )
  }
  
  if (!entry) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Entry not found</p>
        <Link to="/" className="text-blue-600 hover:underline">
          Return to Dashboard
        </Link>
      </div>
    )
  }
  
  return (
    <div>
      {/* Header with back button and actions */}
      <div className="flex justify-between items-center mb-6">
        <Link
          to="/"
          className="text-blue-600 hover:underline flex items-center gap-1"
        >
          ← Back to Dashboard
        </Link>
        <Button
          variant="danger"
          size="sm"
          onClick={() => setShowDeleteModal(true)}
        >
          Delete Entry
        </Button>
      </div>
      
      {/* Two-column layout on larger screens */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Entry details */}
        <EntryDetail entry={entry} />
        
        {/* Page image - lazy loaded */}
        <div>
          <h3 className="font-medium text-gray-700 mb-2">Journal Page</h3>
          <PageImageViewer pageId={entry.page_id} />
        </div>
      </div>
      
      {/* Delete confirmation modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Entry"
      >
        <p className="text-gray-600 mb-4">
          Are you sure you want to delete this entry? This action cannot be undone.
        </p>
        <div className="flex gap-2">
          <Button
            variant="danger"
            onClick={handleDelete}
            isLoading={isDeleting}
          >
            Delete
          </Button>
          <Button
            variant="secondary"
            onClick={() => setShowDeleteModal(false)}
          >
            Cancel
          </Button>
        </div>
      </Modal>
    </div>
  )
}
```

### 9.4 Update Component Exports

Add PageImageViewer to `src/components/pages/index.js`:

```jsx
export { default as PageUpload } from './PageUpload'
export { default as ImagePreview } from './ImagePreview'
export { default as PageImageViewer } from './PageImageViewer'
```

Add EntryDetail to `src/components/entries/index.js`:

```jsx
export { default as EntryCard } from './EntryCard'
export { default as EntryList } from './EntryList'
export { default as EntryDetail } from './EntryDetail'
```

### 9.5 Test the Entry Detail Flow

1. From the Dashboard, click on an entry card
2. Should navigate to `/entry/:id`
3. Entry details should load immediately
4. Page image should load separately (lazy loaded)
5. Click "Delete Entry" → modal should appear
6. Click "Cancel" → modal closes
7. Click "Delete" → should redirect to dashboard
8. Click "Back to Dashboard" → should navigate back

## Checkpoint

At this point you should have:
- [ ] PageImageViewer component that fetches images on demand
- [ ] EntryDetail component showing full transcription
- [ ] EntryDetailPage with two-column layout
- [ ] Delete functionality with confirmation modal
- [ ] Back navigation to dashboard
- [ ] Loading and error states

## Next Step

Continue to [10_api_service.md](./10_api_service.md) to create the API service layer.
