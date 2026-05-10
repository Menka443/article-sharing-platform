import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiHeart, FiMessageCircle, FiTrendingUp } from 'react-icons/fi'
import Button from '../../components/Common/Button'
import Card from '../../components/Common/Card'
import Loading from '../../components/Common/Loading'
import { setArticles, setLoading } from '../../store/slices/articleSlice'
import articleService from '../../services/articleService'
import toast from 'react-hot-toast'

/**
 * Dashboard Page Component
 * Shows user's articles, statistics, and analytics
 */
const Dashboard = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { articles, isLoading } = useSelector((state) => state.articles)
  const [stats, setStats] = useState({
    totalArticles: 0,
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
  })

  // Fetch user's articles on component mount
  useEffect(() => {
    fetchArticles()
  }, [])

  // Calculate statistics
  useEffect(() => {
    if (articles.length > 0) {
      setStats({
        totalArticles: articles.length,
        totalViews: articles.reduce((sum, article) => sum + (article.viewCount || 0), 0),
        totalLikes: articles.reduce((sum, article) => sum + (article.likeCount || 0), 0),
        totalComments: articles.reduce((sum, article) => sum + (article.commentCount || 0), 0),
      })
    }
  }, [articles])

  const fetchArticles = async () => {
    try {
      dispatch(setLoading(true))
      const response = await articleService.getDrafts()
      dispatch(setArticles({
        articles: response.articles || [],
        total: response.total || 0,
      }))
    } catch (error) {
      toast.error('Failed to fetch articles')
    } finally {
      dispatch(setLoading(false))
    }
  }

  const handleDeleteArticle = async (id) => {
    if (!window.confirm('Are you sure you want to delete this article?')) return

    try {
      await articleService.deleteArticle(id)
      toast.success('Article deleted successfully')
      fetchArticles()
    } catch (error) {
      toast.error('Failed to delete article')
    }
  }

  if (isLoading) {
    return <Loading message="Loading your dashboard..." />
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Welcome back, {user?.firstName}! 👋
            </p>
          </div>
          <Link to="/article/new">
            <Button variant="primary" className="flex items-center space-x-2">
              <FiPlus size={20} />
              <span>Write Article</span>
            </Button>
          </Link>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              label: 'Total Articles',
              value: stats.totalArticles,
              icon: FiEdit2,
              color: 'blue',
            },
            {
              label: 'Total Views',
              value: stats.totalViews.toLocaleString(),
              icon: FiEye,
              color: 'green',
            },
            {
              label: 'Total Likes',
              value: stats.totalLikes.toLocaleString(),
              icon: FiHeart,
              color: 'red',
            },
            {
              label: 'Total Comments',
              value: stats.totalComments.toLocaleString(),
              icon: FiMessageCircle,
              color: 'purple',
            },
          ].map((stat, idx) => {
            const Icon = stat.icon
            const colorClasses = {
              blue: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400',
              green: 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400',
              red: 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400',
              purple: 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400',
            }

            return (
              <Card key={idx}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${colorClasses[stat.color]}`}>
                    <Icon size={24} />
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Articles Section */}
        <Card>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Your Articles
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage and track your published articles
            </p>
          </div>

          {articles.length === 0 ? (
            <div className="text-center py-12">
              <FiEdit2 className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                You haven't written any articles yet.
              </p>
              <Link to="/article/new">
                <Button variant="primary">
                  Write Your First Article
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                      Title
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                      <div className="flex items-center space-x-1">
                        <FiEye size={16} />
                        <span>Views</span>
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                      <div className="flex items-center space-x-1">
                        <FiHeart size={16} />
                        <span>Likes</span>
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                      Published
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {articles.map((article) => (
                    <tr
                      key={article.id}
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <Link
                          to={`/articles/${article.slug}`}
                          className="text-primary-500 hover:text-primary-600 font-medium"
                        >
                          {article.title}
                        </Link>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            article.status === 'PUBLISHED'
                              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                              : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                          }`}
                        >
                          {article.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                        {article.viewCount?.toLocaleString() || 0}
                      </td>
                      <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                        {article.likeCount?.toLocaleString() || 0}
                      </td>
                      <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                        {new Date(article.publishedAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end space-x-2">
                          <Link to={`/article/${article.id}/edit`}>
                            <button className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded">
                              <FiEdit2 size={18} />
                            </button>
                          </Link>
                          <button
                            onClick={() => handleDeleteArticle(article.id)}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <FiTrendingUp className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Avg. Views per Article
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {articles.length > 0
                    ? Math.round(stats.totalViews / articles.length)
                    : 0}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                <FiHeart className="text-red-600 dark:text-red-400" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Avg. Likes per Article
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {articles.length > 0
                    ? Math.round(stats.totalLikes / articles.length)
                    : 0}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <FiMessageCircle className="text-purple-600 dark:text-purple-400" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Avg. Comments per Article
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {articles.length > 0
                    ? Math.round(stats.totalComments / articles.length)
                    : 0}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
