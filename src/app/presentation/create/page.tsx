'use client'

import { useRouter } from 'next/navigation'
import PresentationCreateForm from '@/features/presentation/components/PresentationCreateForm'

export default function CreatePresentationPage() {
  const router = useRouter()

  const handleGoToList = () => {
    router.push('/presentation/my-presentations')
  }

  return (
    <div className="max-w-xl mx-auto mt-10 p-4 border rounded shadow space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Crear Presentación</h1>
        <button
          onClick={handleGoToList}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
        >
          Ver mis presentaciones
        </button>
      </div>

      <PresentationCreateForm />
    </div>
  )
}
