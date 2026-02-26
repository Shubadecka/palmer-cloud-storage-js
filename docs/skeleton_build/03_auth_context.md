# Step 3: Authentication Context

Create a React Context to manage authentication state globally across the app.

## Concepts

- **React Context**: A way to share state across components without prop drilling
- **Provider Pattern**: A component that wraps your app and provides state to all children
- **Custom Hook**: A reusable function that encapsulates context access

## Tasks

### 3.1 Create the Auth Context

Create `src/context/AuthContext.jsx`:

The context should manage:
- `user` - The current user object (or null if not logged in)
- `isAuthenticated` - Boolean derived from whether user exists
- `isLoading` - Boolean for loading state during auth checks
- `login(email, password)` - Function to log in
- `register(email, password)` - Function to register
- `logout()` - Function to log out

Structure:

```jsx
import { createContext, useState, useEffect } from 'react'

// Create the context
const AuthContext = createContext(null)

// Create the provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // Check if user is already logged in on mount
  useEffect(() => {
    // TODO: Call /api/auth/me to check session
    // For now, just set loading to false
    setIsLoading(false)
  }, [])
  
  const login = async (email, password) => {
    // TODO: Call /api/auth/login
    // On success, setUser(userData)
  }
  
  const register = async (email, password) => {
    // TODO: Call /api/auth/register
  }
  
  const logout = async () => {
    // TODO: Call /api/auth/logout
    setUser(null)
  }
  
  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
  }
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
```

### 3.2 Create the useAuth Hook

Create `src/hooks/useAuth.js`:

This hook provides easy access to the auth context from any component.

```jsx
import { useContext } from 'react'
import AuthContext from '../context/AuthContext'

export function useAuth() {
  const context = useContext(AuthContext)
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
}
```

The error check ensures developers don't accidentally use the hook outside the provider.

### 3.3 Wrap App with AuthProvider

Update `src/App.jsx` to wrap everything with the AuthProvider:

```jsx
import { AuthProvider } from './context/AuthContext'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* ... routes ... */}
      </BrowserRouter>
    </AuthProvider>
  )
}
```

### 3.4 Update ProtectedRoute to Use Auth Context

Now update `src/components/auth/ProtectedRoute.jsx` to use real auth state:

```jsx
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth()
  
  // Show loading state while checking auth
  if (isLoading) {
    return <div>Loading...</div>  // Replace with LoadingSpinner later
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  // Render child routes
  return <Outlet />
}
```

### 3.5 Test the Auth Flow

For testing, you can temporarily modify the AuthProvider to simulate being logged in:

```jsx
// Temporary: Simulate logged in user
const [user, setUser] = useState({ id: 1, email: 'test@example.com' })
```

Or logged out:

```jsx
// Temporary: Simulate logged out
const [user, setUser] = useState(null)
```

Test that:
- When logged out, visiting `/` redirects to `/login`
- When logged in, visiting `/` shows the Dashboard
- When logged in, visiting `/login` should still work (you might want to redirect to `/` later)

## Checkpoint

At this point you should have:
- [ ] AuthContext created with user state and auth functions
- [ ] useAuth hook created
- [ ] App wrapped with AuthProvider
- [ ] ProtectedRoute using real auth state
- [ ] Auth flow working (redirects when not logged in)

## Next Step

Continue to [04_ui_components.md](./04_ui_components.md) to build reusable UI components.
