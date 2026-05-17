import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { FiImage, FiTag, FiLayers } from 'react-icons/fi'
import Button from '../../components/Common/Button'
import Card from '../../components/Common/Card'
import articleService from '../../services/articleService'
import { calculateReadingTime, generateSlug } from '../../utils/helpers'

/**
 * Article Create Page Component
 * Rich editor for creating new articles with preview
 */
const ArticleCreate = () => {
  const navigate = useNavigate()
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      title: '',
      excerpt: '',
      content: '',
      coverImageUrl: '',
      categoryId: '',
      tags: [],
      status: 'DRAFT',
    },
  })

  const [isLoading, setIsLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [coverImage, setCoverImage] = useState(null)
  const title = watch('title')
  const content = watch('content')
  const excerpt = watch('excerpt')

  // Handle cover image upload
  const handleCoverImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      setIsLoading(true)
      const response = await articleService.uploadCoverImage(file)
      setCoverImage(response.url)
      setValue('coverImageUrl', response.url)
      toast.success('Cover image uploaded successfully!')
    } catch (error) {
      toast.error('Failed to upload cover image')
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (data) => {
    try {
      // Validation
      if (!data.title.trim()) {
        toast.error('Please enter an article title')
        return
      }
      if (!data.content.trim()) {
        toast.error('Please write some content')
        return
      }

      setIsLoading(true)

      const articleData = {
        ...data,
        slug: generateSlug(data.title),
        readingTimeMinutes: calculateReadingTime(data.content),
      }

      const response = await articleService.createArticle(articleData)
      toast.success('Article created successfully!')
      navigate(`/articles/${response.slug}`)
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create article'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Write New Article
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Share your thoughts and ideas with our community
          </p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setShowPreview(false)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              !showPreview
                ? 'bg-primary-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Editor
          </button>
          <button
            onClick={() => setShowPreview(true)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              showPreview
                ? 'bg-primary-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Preview
          </button>
        </div>

        {!showPreview ? (
          // Editor Mode
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Title */}
            <Card>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Article Title *
                </label>
                <input
                  type="text"
                  placeholder="Enter an engaging title for your article..."
                  {...register('title', { required: 'Title is required' })}
                  className="w-full px-4 py-3 text-xl border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
                )}
                {title && (
                  <p className="mt-2 text-xs text-gray-500">
                    Reading time: ~{calculateReadingTime(content)} min
                  </p>
                )}
              </div>
            </Card>

            {/* Cover Image */}
            <Card>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  Cover Image
                </label>
                {coverImage ? (
                  <div className="relative mb-4">
                    <img
                      src={coverImage}
                      alt="Cover"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setCoverImage(null)
                        setValue('coverImageUrl', '')
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                    <div className="flex flex-col items-center justify-center">
                      <FiImage className="text-gray-400 mb-2" size={32} />
                      <p className="text-gray-600 dark:text-gray-400">
                        Click to upload cover image
                      </p>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverImageUpload}
                      className="hidden"
                      disabled={isLoading}
                    />
                  </label>
                )}
              </div>
            </Card>

            {/* Excerpt */}
            <Card>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Excerpt
                </label>
                <textarea
                  placeholder="Write a brief summary of your article (optional)..."
                  rows="3"
                  {...register('excerpt')}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {excerpt.length}/160 characters
                </p>
              </div>
            </Card>

            {/* Content Editor */}
            <Card>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Content *
                </label>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-4">
                  <div className="flex space-x-2 mb-4 pb-4 border-b border-gray-300 dark:border-gray-600">
                    <button type="button" className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm hover:bg-gray-300">
                      <strong>B</strong>
                    </button>
                    <button type="button" className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm hover:bg-gray-300">
                      <em>I</em>
                    </button>
                    <button type="button" className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm hover:bg-gray-300">
                      <u>U</u>
                    </button>
                    <div className="border-l border-gray-300 dark:border-gray-600"></div>
                    <button type="button" className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm hover:bg-gray-300">
                      H1
                    </button>
                    <button type="button" className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm hover:bg-gray-300">
                      H2
                    </button>
                    <button type="button" className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm hover:bg-gray-300">
                      Quote
                    </button>
                  </div>
                  <textarea
                    placeholder="Start writing your article here..."
                    rows="12"
                    {...register('content', { required: 'Content is required' })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white resize-none"
                  />
                </div>
                {errors.content && (
                  <p className="mt-1 text-sm text-red-500">{errors.content.message}</p>
                )}
              </div>
            </Card>

            {/* Category & Tags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  {...register('categoryId')}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select a category</option>
                  <option value="tech">Technology</option>
                  <option value="business">Business</option>
                  <option value="lifestyle">Lifestyle</option>
                  <option value="travel">Travel</option>
                  <option value="other">Other</option>
                </select>
              </Card>

              <Card>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center space-x-2">
                  <FiTag size={16} />
                  <span>Tags</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter tags separated by commas..."
                  {...register('tags')}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                />
              </Card>
            </div>

            {/* Status */}
            <Card>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 flex items-center space-x-2">
                <FiLayers size={16} />
                <span>Publish Status</span>
              </label>
              <div className="space-y-3">
                {[
                  { value: 'DRAFT', label: 'Save as Draft', desc: 'Only you can see this' },
                  { value: 'PUBLISHED', label: 'Publish Now', desc: 'Visible to everyone' },
                ].map((option) => (
                  <label key={option.value} className="flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                    <input
                      type="radio"
                      value={option.value}
                      {...register('status')}
                      className="text-primary-500"
                    />
                    <div className="ml-3">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {option.label}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {option.desc}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <Button type="submit" variant="primary" loading={isLoading}>
                Publish Article
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/dashboard')}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          // Preview Mode
          <Card>
            <div className="prose dark:prose-invert max-w-none">
              {coverImage && (
                <img
                  src={coverImage}
                  alt="Cover"
                  className="w-full h-96 object-cover rounded-lg mb-6"
                />
              )}
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {title || 'Your article title...'}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                {excerpt || 'Your article excerpt...'}
              </p>
              <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                {content || 'Your article content will appear here...'}
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

export default ArticleCreate
