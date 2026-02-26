# Step 5: Layout Components

Create the Header and Navbar components that will wrap authenticated pages.

## Concepts

- **Layout Pattern**: A wrapper component that provides consistent structure
- **Navigation Links**: Using React Router's `Link` and `NavLink` components
- **Conditional Rendering**: Show/hide elements based on auth state

## Tasks

### 5.1 Create Header Component

Create `src/components/layout/Header.jsx`:

A simple header with the app title and user info.

**What to include:**
- App title/logo on the left
- User email and logout button on the right (when logged in)

**Example structure:**
```jsx
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../ui'

export default function Header() {
  const { user, logout } = useAuth()
  
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-900">
          Journal Transcriptions
        </h1>
        
        {user && (
          <div className="flex items-center gap-4">
            <span className="text-gray-600">{user.email}</span>
            <Button variant="secondary" size="sm" onClick={logout}>
              Logout
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}
```

### 5.2 Create Navbar Component

Create `src/components/layout/Navbar.jsx`:

Navigation links for the main sections of the app.

**What to include:**
- Link to Dashboard (/)
- Link to Upload (/upload)
- Active state styling for current page

**Using NavLink:**
React Router's `NavLink` component accepts a function for `className` that receives `{ isActive }`:

```jsx
import { NavLink } from 'react-router-dom'

export default function Navbar() {
  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded-md text-sm font-medium ${
      isActive
        ? 'bg-blue-100 text-blue-700'
        : 'text-gray-600 hover:bg-gray-100'
    }`
  
  return (
    <nav className="bg-gray-50 border-b">
      <div className="max-w-7xl mx-auto px-4 py-2 flex gap-2">
        <NavLink to="/" className={linkClass}>
          Dashboard
        </NavLink>
        <NavLink to="/upload" className={linkClass}>
          Upload Page
        </NavLink>
      </div>
    </nav>
  )
}
```

### 5.3 Create a Layout Wrapper Component

Create `src/components/layout/Layout.jsx`:

This component combines Header and Navbar with a content area.

```jsx
import Header from './Header'
import Navbar from './Navbar'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
```

### 5.4 Create Index File

Create `src/components/layout/index.js`:

```jsx
export { default as Header } from './Header'
export { default as Navbar } from './Navbar'
export { default as Layout } from './Layout'
```

### 5.5 Apply Layout to Protected Routes

You have two options for applying the layout:

**Option A: Wrap each page individually**
```jsx
// In DashboardPage.jsx
import { Layout } from '../components/layout'

export default function DashboardPage() {
  return (
    <Layout>
      <h2>Dashboard</h2>
      {/* page content */}
    </Layout>
  )
}
```

**Option B: Create a layout route (recommended)**

Update `App.jsx` to use a layout route:

```jsx
import { Layout } from './components/layout'

// Create a LayoutRoute component
function LayoutRoute() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes - no layout */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Protected routes - with layout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<LayoutRoute />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/entry/:id" element={<EntryDetailPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
```

This nests protected routes inside both `ProtectedRoute` (for auth) and `LayoutRoute` (for consistent UI).

### 5.6 Test the Layout

With a simulated logged-in user:
1. Navigate to `/` - should see Header, Navbar, and Dashboard content
2. Click "Upload Page" in Navbar - should navigate to `/upload`
3. Check that the current page link is highlighted
4. Click Logout - should redirect to `/login`

## Checkpoint

At this point you should have:
- [ ] Header component with title and logout
- [ ] Navbar component with navigation links
- [ ] Layout wrapper combining both
- [ ] Layout applied to protected routes
- [ ] Navigation working between pages

## Next Step

Continue to [06_auth_pages.md](./06_auth_pages.md) to build the login and register pages.
