# Step 4: UI Components

Build reusable UI components that will be used throughout the app.

## Concepts

- **Component Props**: Pass configuration to components
- **Children Prop**: Pass content to be rendered inside a component
- **Conditional Classes**: Apply different Tailwind classes based on props
- **Forwarding Refs**: Allow parent components to access DOM elements

## Tasks

### 4.1 Create Button Component

Create `src/components/ui/Button.jsx`:

A versatile button with different variants and sizes.

**Props to support:**
- `variant`: 'primary' | 'secondary' | 'danger' (default: 'primary')
- `size`: 'sm' | 'md' | 'lg' (default: 'md')
- `disabled`: boolean
- `isLoading`: boolean (shows spinner and disables)
- `type`: 'button' | 'submit' (default: 'button')
- `onClick`: click handler
- `children`: button content

**Example usage:**
```jsx
<Button variant="primary" size="md" onClick={handleClick}>
  Save
</Button>

<Button variant="danger" isLoading={isDeleting}>
  Delete
</Button>
```

**Tailwind classes to consider:**
- Base: `rounded font-medium transition-colors focus:outline-none focus:ring-2`
- Primary: `bg-blue-600 text-white hover:bg-blue-700`
- Secondary: `bg-gray-200 text-gray-800 hover:bg-gray-300`
- Danger: `bg-red-600 text-white hover:bg-red-700`
- Disabled: `opacity-50 cursor-not-allowed`
- Sizes: `px-3 py-1.5 text-sm` / `px-4 py-2 text-base` / `px-6 py-3 text-lg`

### 4.2 Create Input Component

Create `src/components/ui/Input.jsx`:

A styled input field with label and error state.

**Props to support:**
- `label`: string (optional)
- `type`: 'text' | 'email' | 'password' | 'date' (default: 'text')
- `placeholder`: string
- `value`: string
- `onChange`: change handler
- `error`: string (error message to display)
- `required`: boolean
- `id`: string (for label association)

**Example usage:**
```jsx
<Input
  label="Email"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={errors.email}
  required
/>
```

**Structure:**
```jsx
<div>
  {label && <label>...</label>}
  <input ... />
  {error && <p className="text-red-500 text-sm">...</p>}
</div>
```

**Tailwind classes to consider:**
- Label: `block text-sm font-medium text-gray-700 mb-1`
- Input: `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`
- Error border: `border-red-500`
- Normal border: `border-gray-300`

### 4.3 Create LoadingSpinner Component

Create `src/components/ui/LoadingSpinner.jsx`:

A simple loading indicator.

**Props to support:**
- `size`: 'sm' | 'md' | 'lg' (default: 'md')

**Example usage:**
```jsx
<LoadingSpinner size="lg" />
```

**Implementation hint:**
Use Tailwind's `animate-spin` class on a circular element. You can use a simple div with border styling or an SVG spinner.

```jsx
// Simple CSS spinner approach
<div className="animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
```

Size classes: `h-4 w-4` / `h-8 w-8` / `h-12 w-12`

### 4.4 Create Modal Component

Create `src/components/ui/Modal.jsx`:

A dialog overlay for confirmations or forms.

**Props to support:**
- `isOpen`: boolean (controls visibility)
- `onClose`: function (called when backdrop clicked or close button pressed)
- `title`: string
- `children`: modal content

**Example usage:**
```jsx
<Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Confirm Delete">
  <p>Are you sure you want to delete this entry?</p>
  <div className="flex gap-2 mt-4">
    <Button variant="danger" onClick={handleDelete}>Delete</Button>
    <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
  </div>
</Modal>
```

**Structure:**
```jsx
// Only render if isOpen is true
{isOpen && (
  <div className="fixed inset-0 z-50">
    {/* Backdrop */}
    <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
    
    {/* Modal content */}
    <div className="fixed inset-0 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  </div>
)}
```

### 4.5 Create an Index File for Easy Imports

Create `src/components/ui/index.js`:

```jsx
export { default as Button } from './Button'
export { default as Input } from './Input'
export { default as LoadingSpinner } from './LoadingSpinner'
export { default as Modal } from './Modal'
```

This allows importing like:
```jsx
import { Button, Input, Modal } from '../components/ui'
```

### 4.6 Test Your Components

Create a temporary test page or modify App.jsx to render your components and verify they work:

```jsx
function App() {
  const [modalOpen, setModalOpen] = useState(false)
  
  return (
    <div className="p-8 space-y-4">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="danger" isLoading>Loading...</Button>
      
      <Input label="Test Input" placeholder="Type here..." />
      <Input label="With Error" error="This field is required" />
      
      <LoadingSpinner size="lg" />
      
      <Button onClick={() => setModalOpen(true)}>Open Modal</Button>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Test Modal">
        <p>Modal content here</p>
      </Modal>
    </div>
  )
}
```

## Checkpoint

At this point you should have:
- [ ] Button component with variants, sizes, and loading state
- [ ] Input component with label and error display
- [ ] LoadingSpinner component with sizes
- [ ] Modal component with backdrop and close functionality
- [ ] Index file for easy imports
- [ ] All components visually tested

## Next Step

Continue to [05_layout_components.md](./05_layout_components.md) to create the layout structure.
