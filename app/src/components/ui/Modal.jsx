export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  if (!isOpen) return null

  const sizeClasses = {
    md: 'max-w-md',
    lg: 'max-w-2xl',
  }

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal content */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className={`bg-white rounded-lg shadow-xl ${sizeClasses[size] || sizeClasses.md} w-full p-6 relative`}>
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Title */}
          {title && (
            <h2 className="text-xl font-semibold text-gray-900 mb-4 pr-8">
              {title}
            </h2>
          )}

          {/* Content */}
          {children}
        </div>
      </div>
    </div>
  )
}
