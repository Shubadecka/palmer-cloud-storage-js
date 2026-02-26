# Step 6: Auth Pages

Build the Login and Register pages with forms.

## Concepts

- **Controlled Inputs**: Form inputs whose values are managed by React state
- **Form Submission**: Handling the submit event and preventing default behavior
- **Error Handling**: Displaying validation and API errors
- **Navigation after Auth**: Redirecting user after successful login/register

## Tasks

### 6.1 Create LoginPage

Update `src/pages/LoginPage.jsx`:

**What to include:**
- Email input field
- Password input field
- "Remember me" checkbox (optional)
- Submit button with loading state
- Link to register page
- Error message display

**State to manage:**
- `email` - string
- `password` - string
- `error` - string (API error message)
- `isLoading` - boolean

**Form flow:**
1. User fills in email and password
2. User clicks "Login" button
3. Set `isLoading = true`
4. Call `login(email, password)` from `useAuth()`
5. On success: navigate to `/`
6. On error: set error message, set `isLoading = false`

**Example structure:**
```jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Button, Input } from '../components/ui'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const { login } = useAuth()
  const navigate = useNavigate()
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Login</h1>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          <Button type="submit" isLoading={isLoading} className="w-full">
            Login
          </Button>
        </form>
        
        <p className="mt-4 text-center text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}
```

### 6.2 Create RegisterPage

Update `src/pages/RegisterPage.jsx`:

Similar to LoginPage but with:
- Email input
- Password input
- Confirm password input
- Client-side validation: passwords must match
- Link to login page

**Additional validation:**
```jsx
const handleSubmit = async (e) => {
  e.preventDefault()
  setError('')
  
  // Client-side validation
  if (password !== confirmPassword) {
    setError('Passwords do not match')
    return
  }
  
  if (password.length < 8) {
    setError('Password must be at least 8 characters')
    return
  }
  
  setIsLoading(true)
  // ... rest of submission
}
```

### 6.3 Add Redirect for Logged-In Users

If a logged-in user visits `/login` or `/register`, redirect them to the dashboard.

At the top of each auth page:

```jsx
import { Navigate } from 'react-router-dom'

export default function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth()
  
  // Redirect if already logged in
  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }
  
  // Show loading while checking auth
  if (isLoading) {
    return <LoadingSpinner />
  }
  
  // ... rest of component
}
```

### 6.4 Style the Auth Pages

Both pages should:
- Be centered on the screen
- Have a card-like container
- Have consistent spacing
- Look good on mobile (responsive)

**Tailwind classes for the container:**
```jsx
<div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
  <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
    {/* form content */}
  </div>
</div>
```

### 6.5 Test Auth Flow

For testing without a real API, temporarily modify the `login` function in AuthContext:

```jsx
const login = async (email, password) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Simulate successful login
  if (email === 'test@example.com' && password === 'password') {
    setUser({ id: 1, email })
  } else {
    throw new Error('Invalid credentials')
  }
}
```

Test:
1. Go to `/login`
2. Enter wrong credentials → should show error
3. Enter correct credentials → should redirect to `/`
4. Try to go back to `/login` → should redirect to `/`
5. Click Logout → should go to `/login`

## Checkpoint

At this point you should have:
- [ ] LoginPage with email/password form
- [ ] RegisterPage with password confirmation
- [ ] Error message display on both pages
- [ ] Loading states during submission
- [ ] Navigation links between login and register
- [ ] Redirect away from auth pages when logged in

## Next Step

Continue to [07_dashboard_page.md](./07_dashboard_page.md) to build the main entry list view.
