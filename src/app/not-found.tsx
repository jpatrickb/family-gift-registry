import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md text-center space-y-3">
        <h1 className="text-2xl font-bold">Page not found</h1>
        <p className="text-gray-600">
          The page you are looking for doesn&apos;t exist or may have moved.
        </p>
        <Link href="/dashboard" className="ds-btn ds-btn-primary">
          Go to dashboard
        </Link>
      </div>
    </div>
  )
}
