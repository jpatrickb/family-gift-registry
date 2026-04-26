import Link from "next/link"
import { Suspense } from "react"
import { SignupForm } from "@/components/auth/signup-form"

export default function SignupPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Create an account</h1>
        <p className="mt-2 text-sm text-gray-600">
          Start sharing your wishlist with family
        </p>
      </div>
      <Suspense>
        <SignupForm />
      </Suspense>
      <p className="text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link href="/login" className="font-medium underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
