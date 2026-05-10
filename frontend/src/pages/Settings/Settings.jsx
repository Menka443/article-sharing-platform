import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { FiCamera, FiMail, FiUser, FiLock, FiBell, FiShield } from 'react-icons/fi'
import Button from '../../components/Common/Button'
import Card from '../../components/Common/Card'
import { updateUser } from '../../store/slices/authSlice'
import userService from '../../services/userService'

/**
 * Settings Page Component
 * Manages user profile, password, and notification settings
 */
const Settings = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const [activeTab, setActiveTab] = useState('profile')
  const [isLoading, setIsLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      bio: user?.bio || '',
    },
  })

  // Handle profile update
  const onProfileSubmit = async (data) => {
    try {
      setIsLoading(true)
      const response = await userService.updateProfile(data)
      dispatch(updateUser(response))
      toast.success('Profile updated successfully!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const oldPassword = formData.get('oldPassword')
    const newPassword = formData.get('newPassword')
    const confirmPassword = formData.get('confirmPassword')

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    try {
      setIsLoading(true)
      await userService.changePassword(oldPassword, newPassword)
      toast.success('Password changed successfully!')
      e.target.reset()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle avatar upload
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      setIsLoading(true)
      const response = await userService.uploadProfilePicture(file)
      dispatch(updateUser({ profilePictureUrl: response.url }))
      toast.success('Avatar updated successfully!')
    } catch (error) {
      toast.error('Failed to upload avatar')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              {[
                { id: 'profile', label: 'Profile', icon: FiUser },
                { id: 'password', label: 'Password', icon: FiLock },
                { id: 'notifications', label: 'Notifications', icon: FiBell },
                { id: 'privacy', label: 'Privacy & Security', icon: FiShield },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === id
                      ? 'bg-primary-500 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon size={20} />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <Card>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Profile Information
                </h2>

                {/* Avatar Section */}
                <div className="mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <img
                        src={user?.profilePictureUrl || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}`}
                        alt={user?.firstName}
                        className="w-24 h-24 rounded-full object-cover"
                      />
                      <label className="absolute bottom-0 right-0 bg-primary-500 text-white p-2 rounded-full cursor-pointer hover:bg-primary-600">
                        <FiCamera size={16} />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="hidden"
                          disabled={isLoading}
                        />
                      </label>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Upload a new profile picture
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG up to 2MB
                      </p>
                    </div>
                  </div>
                </div>

                {/* Profile Form */}
                <form onSubmit={handleSubmit(onProfileSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        {...register('firstName', { required: 'First name is required' })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                      />
                      {errors.firstName && (
                        <p className="mt-1 text-sm text-red-500">{errors.firstName.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        {...register('lastName', { required: 'Last name is required' })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                      />
                      {errors.lastName && (
                        <p className="mt-1 text-sm text-red-500">{errors.lastName.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      disabled
                      {...register('email')}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 dark:text-gray-400 cursor-not-allowed"
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      Email cannot be changed. Contact support for assistance.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Bio
                    </label>
                    <textarea
                      {...register('bio')}
                      rows="4"
                      placeholder="Tell us about yourself..."
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    loading={isLoading}
                  >
                    Save Changes
                  </Button>
                </form>
              </Card>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <Card>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Change Password
                </h2>

                <form onSubmit={handlePasswordChange} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      name="oldPassword"
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      required
                      minLength={8}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      Must be at least 8 characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      required
                      minLength={8}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    loading={isLoading}
                  >
                    Update Password
                  </Button>
                </form>
              </Card>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <Card>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Notification Settings
                </h2>

                <div className="space-y-4">
                  {[
                    { label: 'Email on new follower', desc: 'Get notified when someone follows you' },
                    { label: 'Email on article like', desc: 'Get notified when your article is liked' },
                    { label: 'Email on comment', desc: 'Get notified when someone comments on your article' },
                    { label: 'Email digest', desc: 'Weekly summary of trending articles' },
                    { label: 'Newsletter', desc: 'Get the latest news and features' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-0">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{item.label}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                      </div>
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-5 h-5 text-primary-500 rounded focus:ring-primary-500"
                      />
                    </div>
                  ))}
                </div>

                <Button variant="primary" className="mt-6">
                  Save Preferences
                </Button>
              </Card>
            )}

            {/* Privacy & Security Tab */}
            {activeTab === 'privacy' && (
              <Card>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Privacy & Security
                </h2>

                <div className="space-y-6">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                      Two-Factor Authentication
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Add an extra layer of security to your account
                    </p>
                    <Button variant="outline">
                      Enable 2FA
                    </Button>
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                      Profile Visibility
                    </h3>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="visibility"
                          defaultChecked
                          className="text-primary-500"
                        />
                        <span className="ml-3 text-gray-700 dark:text-gray-300">
                          Public - Anyone can see your profile
                        </span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="visibility"
                          className="text-primary-500"
                        />
                        <span className="ml-3 text-gray-700 dark:text-gray-300">
                          Private - Only your followers can see your profile
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <h3 className="font-medium text-red-900 dark:text-red-400 mb-2">
                      Danger Zone
                    </h3>
                    <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                      Permanently delete your account and all associated data
                    </p>
                    <Button variant="danger">
                      Delete Account
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
