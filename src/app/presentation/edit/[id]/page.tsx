'use client'

import { useRouter } from 'next/navigation'
import UpdatePresentationForm from '@/features/presentation/components/UpdatePresentationForm'

export default function CreatePresentationPage() {
  const router = useRouter()

  const handleGoToList = () => {
    router.push('/presentation/my-presentations')
  }

  return (
    <div className="max-w-xl mx-auto mt-10 p-4 border rounded shadow space-y-6">
      

      <UpdatePresentationForm />
    </div>
  )
}