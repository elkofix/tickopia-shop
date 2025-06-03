'use client'

import PresentationCreateForm from '@/features/presentation/components/PresentationCreateForm'

export default function CreatePresentationPage() {
  return (
    <div className="max-w-xl mx-auto mt-10 p-4 border rounded shadow space-y-6">
      <h1 className="text-2xl font-bold">Crear Presentación</h1>
      <PresentationCreateForm />
    </div>
  )
}