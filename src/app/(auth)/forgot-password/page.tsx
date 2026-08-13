import Link from "next/link"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Reset your password</h1>
        <p className="mt-2 text-sm text-gray-600">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>
      <ForgotPasswordForm />
      <p className="text-center text-sm text-gray-600">
        Remembered it?{" "}
        <Link href="/login" className="font-medium underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
