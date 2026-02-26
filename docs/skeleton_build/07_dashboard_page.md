# Step 7: Dashboard Page

Build the main dashboard that displays all journal entries sorted by date.

## Concepts

- **Data Fetching**: Loading data from API on component mount
- **List Rendering**: Mapping arrays to components
- **Date Formatting**: Using date-fns to display dates
- **Empty States**: What to show when there's no data
- **Pagination/Filtering**: Optional enhancements

## Tasks

### 7.1 Create EntryCard Component

Create `src/components/entries/EntryCard.jsx`:

A card displaying a single entry's summary. Clicking it navigates to the detail page.

**Props:**
- `entry` - object with id, date, transcription, status

**What to display:**
- Entry date (formatted nicely)
- Transcription preview (truncated to ~100 characters)
- Status badge (e.g., "Pending" or "Transcribed")

**Example structure:**
```jsx
import { Link } from 'react-router-dom'
import { format } from 'date-fns'

export default function EntryCard({ entry }) {
  // Truncate transcription for preview
  const preview = entry.transcription
    ? entry.transcription.substring(0, 100) + (entry.transcription.length > 100 ? '...' : '')
    : 'No transcription yet'
  
  return (
    <Link
      to={`/entry/${entry.id}`}
      className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4"
    >
      <div className="flex justify-between items-start mb-2">
        <time className="text-sm font-medium text-gray-900">
          {format(new Date(entry.date), 'MMMM d, yyyy')}
        </time>
        <span className={`text-xs px-2 py-1 rounded ${
          entry.status === 'transcribed'
            ? 'bg-green-100 text-green-700'
            : 'bg-yellow-100 text-yellow-700'
        }`}>
          {entry.status === 'transcribed' ? 'Transcribed' : 'Pending'}
        </span>
      </div>
      <p className="text-gray-600 text-sm">{preview}</p>
    </Link>
  )
}
```

### 7.2 Create EntryList Component

Create `src/components/entries/EntryList.jsx`:

A component that renders a list of EntryCards, sorted by date.

**Props:**
- `entries` - array of entry objects

**Sorting:**
Sort entries by date in descending order (newest first):

```jsx
import EntryCard from './EntryCard'

export default function EntryList({ entries }) {
  // Sort by date, newest first
  const sortedEntries = [...entries].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  )
  
  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No journal entries yet.</p>
        <p className="mt-2">Upload your first journal page to get started!</p>
      </div>
    )
  }
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {sortedEntries.map(entry => (
        <EntryCard key={entry.id} entry={entry} />
      ))}
    </div>
  )
}
```

### 7.3 Build DashboardPage

Update `src/pages/DashboardPage.jsx`:

**State to manage:**
- `entries` - array of entries from API
- `isLoading` - boolean
- `error` - string

**Data fetching flow:**
1. On mount, fetch entries from `/api/entries`
2. Show loading spinner while fetching
3. On success, store entries in state
4. On error, display error message

**Example structure:**
```jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button, LoadingSpinner } from '../components/ui'
import EntryList from '../components/entries/EntryList'
// import { getEntries } from '../services/api' // uncomment when API ready

export default function DashboardPage() {
  const [entries, setEntries] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  
  useEffect(() => {
    async function fetchEntries() {
      try {
        // const data = await getEntries() // uncomment when API ready
        
        // Temporary mock data
        const data = [
          { id: 1, date: '2024-01-15', transcription: 'Today I went to the park and saw many beautiful flowers...', status: 'transcribed' },
          { id: 2, date: '2024-01-14', transcription: 'Had a great meeting with the team...', status: 'transcribed' },
          { id: 3, date: '2024-01-13', transcription: null, status: 'pending' },
        ]
        
        setEntries(data)
      } catch (err) {
        setError('Failed to load entries')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchEntries()
  }, [])
  
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
      </div>
    )
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Journal Entries</h2>
        <Link to="/upload">
          <Button>Upload New Page</Button>
        </Link>
      </div>
      
      <EntryList entries={entries} />
    </div>
  )
}
```

### 7.4 Optional: Add Date Filtering

Add the ability to filter entries by date range:

**Additional state:**
- `startDate` - filter start date
- `endDate` - filter end date

**Filter UI:**
```jsx
<div className="flex gap-4 mb-6">
  <Input
    type="date"
    label="From"
    value={startDate}
    onChange={(e) => setStartDate(e.target.value)}
  />
  <Input
    type="date"
    label="To"
    value={endDate}
    onChange={(e) => setEndDate(e.target.value)}
  />
</div>
```

**Filter logic:**
```jsx
const filteredEntries = entries.filter(entry => {
  const entryDate = new Date(entry.date)
  if (startDate && entryDate < new Date(startDate)) return false
  if (endDate && entryDate > new Date(endDate)) return false
  return true
})
```

### 7.5 Create Index File

Create `src/components/entries/index.js`:

```jsx
export { default as EntryCard } from './EntryCard'
export { default as EntryList } from './EntryList'
```

## Checkpoint

At this point you should have:
- [ ] EntryCard component showing date, preview, and status
- [ ] EntryList component rendering sorted entries
- [ ] DashboardPage fetching and displaying entries
- [ ] Empty state when no entries exist
- [ ] Loading and error states
- [ ] "Upload New Page" button linking to upload page

## Data Model Reference

Each entry object should have:
```js
{
  id: number,
  date: string,          // ISO date string, e.g., '2024-01-15'
  transcription: string | null,
  status: 'pending' | 'transcribed',
  page_id: number        // Reference to the page image
}
```

## Next Step

Continue to [08_upload_page.md](./08_upload_page.md) to build the image upload functionality.
