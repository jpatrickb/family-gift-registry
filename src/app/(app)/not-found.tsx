import Link from "next/link"

export default function AppNotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md text-center space-y-3">
        <h1 className="text-2xl font-bold">Page not found</h1>
        <p className="text-gray-600">
          We couldn&apos;t find that page in your account area.
        </p>
        <div className="flex items-center justify-center gap-2">
          <Link href="/dashboard" className="ds-btn ds-btn-primary">
            Go to dashboard
          </Link>
          <Link href="/families" className="ds-btn ds-btn-secondary">
            View families
          </Link>
        </div>
      </div>
    </div>
  )
}
