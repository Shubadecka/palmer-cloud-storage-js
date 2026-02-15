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
            <span className="text-gray-600 text-sm">{user.email}</span>
            <Button variant="secondary" size="sm" onClick={logout}>
              Logout
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}
