import { CreateFamilyForm } from "@/components/family/create-family-form"

export default function NewFamilyPage() {
  return (
    <div className="max-w-md mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Create a family</h1>
        <p className="text-gray-600 mt-1">
          Create a new family group and invite members
        </p>
      </div>
      <CreateFamilyForm />
    </div>
  )
}
