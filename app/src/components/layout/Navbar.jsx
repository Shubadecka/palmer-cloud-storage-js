import { NavLink } from 'react-router-dom'

export default function Navbar() {
  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? 'bg-blue-100 text-blue-700'
        : 'text-gray-600 hover:bg-gray-100'
    }`

  return (
    <nav className="bg-gray-50 border-b">
      <div className="max-w-7xl mx-auto px-4 py-2 flex gap-2">
        <NavLink to="/" className={linkClass} end>
          Pages
        </NavLink>
        <NavLink to="/entries" className={linkClass}>
          Entries
        </NavLink>
        <NavLink to="/chat" className={linkClass}>
          Chat
        </NavLink>
        <NavLink to="/upload" className={linkClass}>
          Upload Page
        </NavLink>
      </div>
    </nav>
  )
}
