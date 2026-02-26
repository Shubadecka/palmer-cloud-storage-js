# Step 2: Routing Setup

Configure React Router with routes for all pages, including protected routes that require authentication.

## Concepts

- **BrowserRouter**: Wraps your app to enable routing
- **Routes/Route**: Define URL-to-component mappings
- **Protected Routes**: Routes that redirect to login if user isn't authenticated
- **Outlet**: Placeholder where child routes render

## Tasks

### 2.1 Create Placeholder Page Components

Before setting up routes, create minimal placeholder components for each page. These will be fleshed out later.

Create these files in `src/pages/`:

**LoginPage.jsx**
```jsx
export default function LoginPage() {
  return <div>Login Page</div>
}
```

**RegisterPage.jsx**
```jsx
export default function RegisterPage() {
  return <div>Register Page</div>
}
```

**DashboardPage.jsx**
```jsx
export default function DashboardPage() {
  return <div>Dashboard Page</div>
}
```

**UploadPage.jsx**
```jsx
export default function UploadPage() {
  return <div>Upload Page</div>
}
```

**EntryDetailPage.jsx**
```jsx
export default function EntryDetailPage() {
  return <div>Entry Detail Page</div>
}
```

### 2.2 Create a ProtectedRoute Component

This component wraps routes that require authentication. If the user isn't logged in, it redirects to the login page.

Create `src/components/auth/ProtectedRoute.jsx`:

The component should:
1. Check if the user is authenticated (you'll get this from AuthContext later)
2. If authenticated, render the child routes using `<Outlet />`
3. If not authenticated, redirect to `/login` using `<Navigate />`

For now, you can hardcode `isAuthenticated = true` to test routing works.

### 2.3 Set Up the Router in App.jsx

Update `src/App.jsx` to configure all routes:

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
// Import your page components
// Import ProtectedRoute

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Protected routes - wrapped in ProtectedRoute */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/entry/:id" element={<EntryDetailPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
```

### 2.4 Understand the Route Structure

| Path | Component | Protected? | Purpose |
|------|-----------|------------|---------|
| `/login` | LoginPage | No | User login form |
| `/register` | RegisterPage | No | User registration form |
| `/` | DashboardPage | Yes | Main entry list view |
| `/upload` | UploadPage | Yes | Upload new journal page |
| `/entry/:id` | EntryDetailPage | Yes | View single entry with image |

The `:id` in `/entry/:id` is a URL parameter. You'll access it with `useParams()` hook later.

### 2.5 Test Navigation

With the dev server running, manually test each route:
- `http://localhost:5173/login` → Shows Login Page
- `http://localhost:5173/register` → Shows Register Page
- `http://localhost:5173/` → Shows Dashboard Page (or redirects if protected)
- `http://localhost:5173/upload` → Shows Upload Page
- `http://localhost:5173/entry/123` → Shows Entry Detail Page

## Checkpoint

At this point you should have:
- [ ] All placeholder page components created
- [ ] ProtectedRoute component created (hardcoded for now)
- [ ] Router configured in App.jsx
- [ ] All routes accessible in the browser

## Next Step

Continue to [03_auth_context.md](./03_auth_context.md) to create the authentication context.
