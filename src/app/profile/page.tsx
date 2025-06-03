"use client"
import { ProtectedRoute } from '@/features/auth/login/components/ProtectedRoute'
import React, { useState, useEffect } from 'react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { closeProfile, updateProfile } from '@/features/users/users.client.api'
import { Card } from '@/shared/components/Card'
import { Alert } from '@/shared/components/Alert'
import { ProfileView } from '@/features/users/components/ProfileView'
import { ProfileEditForm } from '@/features/users/components/ProfileEditForm'
import { ConfirmationModal } from '@/features/users/components/ConfirmationModal'

export default function ProfilePage() {
  const { user, isAuthenticated, logout, updateUserProfile } = useAuth()
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    lastname: '',
    email: ''
  })
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    if (user) {
      console.log(user)
      setFormData({
        name: user.name || '',
        lastname: user.lastname || '',
        email: user.email || ''
      })
    }
  }, [user])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    try {
      if (!user?.id) throw new Error('User ID not found')
      
      const updatedUser = await updateProfile(formData, user.id)
      updateUserProfile(updatedUser)
      setEditMode(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCloseAccount = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      if (!user?.id) throw new Error('User ID not found')
      
      await closeProfile(user.id)
      logout()
      router.push('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error closing account')
    } finally {
      setIsLoading(false)
      closeModal()
    }
  }

  const closeModal = () => setIsOpen(false)
  const openModal = () => setIsOpen(true)

  if (!isAuthenticated || !user) {
    return <div>Loading...</div>
  }

  return (
    <ProtectedRoute>
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <h1 className="text-2xl font-bold mb-6 text-indigo-600">Mi Perfil</h1>
          
          {error && (
            <Alert variant="error" className="mb-4">
              {error}
            </Alert>
          )}
          
          {!editMode ? (
            <ProfileView 
              user={user} 
              onEdit={() => setEditMode(true)} 
              onOpenModal={openModal} 
            />
          ) : (
            <ProfileEditForm
              formData={formData}
              onChange={handleInputChange}
              onSubmit={handleSubmit}
              onCancel={() => setEditMode(false)}
              isLoading={isLoading}
            />
          )}
          
          <ConfirmationModal
            isOpen={isOpen}
            onClose={closeModal}
            onConfirm={handleCloseAccount}
            isLoading={isLoading}
          />
        </Card>
      </div>
    </ProtectedRoute>
  )
}