'use client'

import UpdatePresentationForm from '@/features/presentation/components/UpdatePresentationForm'

export default function CreatePresentationPage() {
  return (
    <div className="max-w-xl mx-auto mt-10 p-4 border rounded shadow space-y-6">
      <UpdatePresentationForm />
    </div>
  )
}