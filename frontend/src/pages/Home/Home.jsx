import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { FiSearch, FiFilter, FiHeart, FiMessageCircle, FiEye, FiChevronRight } from 'react-icons/fi'
import Button from '../../components/Common/Button'
import Card from '../../components/Common/Card'
import Loading from '../../components/Common/Loading'
import articleService from '../../services/articleService'

/**
 * Home Page Component
 * Discover articles with filtering, search, and trending sections
 */
const Home = () => {
  const [searchParams] = useSearchParams()
  const { user } = useSelector((state) => state.auth)
  const [articles, setArticles] = useState([])
  const [trendingArticles, setTrendingArticles] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '')
  const [sortBy, setSortBy] = useState('latest')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const categories = ['Technology', 'Business', 'Lifestyle', 'Travel', 'Health', 'Education']

  // Fetch articles
  useEffect(() => {
    fetchArticles()
    fetchTrendingArticles()
  }, [searchQuery, selectedCategory, sortBy, page])

  const fetchArticles = async () => {
    try {
      setIsLoading(true)
      const response = await articleService.searchArticles({
        query: searchQuery,
        category: selectedCategory,
        sortBy,
        page,
        limit: 9,
      })
      setArticles(response.articles || [])
      setTotalPages(response.totalPages || 1)
    } catch (error) {
      toast.error('Failed to fetch articles')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTrendingArticles = async () => {
    try {
      const response = await articleService.getTrendingArticles({ limit: 5 })
      setTrendingArticles(response.articles || [])
    } catch (error) {
      console.error('Failed to fetch trending articles')
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    fetchArticles()
  }

  const handleCategoryClick = (category) => {
    setSelectedCategory(category === selectedCategory ? '' : category)
    setPage(1)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-blue-600 dark:from-primary-900 dark:to-blue-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Discover Great Articles
            </h1>
            <p className="text-xl text-blue-100">
              Read, learn, and share knowledge from writers around the world
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <FiSearch className="absolute left-4 top-4 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles, topics, authors..."
                className="w-full pl-12 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-primary-500 border-0 dark:bg-gray-800 dark:text-white"
              />
              <button
                type="submit"
                className="absolute right-2 top-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-1 rounded-lg"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Articles List */}
          <div className="lg:col-span-2">
            {/* Category Filter */}
            <div className="mb-8">
              <div className="flex items-center space-x-2 mb-4">
                <FiFilter size={20} className="text-gray-600 dark:text-gray-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Categories</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryClick(category)}
                    className={`px-4 py-2 rounded-full font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Options */}
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {selectedCategory ? `${selectedCategory} Articles` : 'Latest Articles'}
              </h2>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value)
                  setPage(1)
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              >
                <option value="latest">Latest</option>
                <option value="trending">Trending</option>
                <option value="popular">Most Popular</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>

            {/* Articles Grid */}
            {isLoading ? (
              <Loading message="Loading articles..." />
            ) : articles.length === 0 ? (
              <Card>
                <div className="text-center py-12">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    No articles found. Try adjusting your filters.
                  </p>
                  <Button onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory('')
                  }}>
                    Clear Filters
                  </Button>
                </div>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {articles.map((article) => (
                    <Link
                      key={article.id}
                      to={`/articles/${article.slug}`}
                      className="group"
                    >
                      <Card className="h-full hover:shadow-lg transition-shadow">
                        {/* Cover Image */}
                        {article.coverImageUrl && (
                          <img
                            src={article.coverImageUrl}
                            alt={article.title}
                            className="w-full h-48 object-cover rounded-lg mb-4 group-hover:opacity-90 transition-opacity"
                          />
                        )}

                        {/* Content */}
                        <div>
                          {/* Category Badge */}
                          {article.category && (
                            <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium mb-2">
                              {article.category}
                            </span>
                          )}

                          {/* Title */}
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary-500 transition-colors">
                            {article.title}
                          </h3>

                          {/* Excerpt */}
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                            {article.excerpt}
                          </p>

                          {/* Author Info */}
                          <div className="flex items-center space-x-3 mb-4 py-3 border-t border-gray-200 dark:border-gray-700">
                            <img
                              src={article.author?.profilePictureUrl || `https://ui-avatars.com/api/?name=${article.author?.firstName}+${article.author?.lastName}`}
                              alt={article.author?.firstName}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {article.author?.firstName} {article.author?.lastName}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {new Date(article.publishedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          {/* Stats */}
                          <div className="flex items-center justify-between text-gray-600 dark:text-gray-400 text-sm">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-1">
                                <FiEye size={16} />
                                <span>{article.viewCount?.toLocaleString() || 0}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <FiHeart size={16} />
                                <span>{article.likeCount?.toLocaleString() || 0}</span>
                              </div>
                            </div>
                            <span>{article.readingTimeMinutes || 5} min</span>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center space-x-4">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      Previous
                    </button>
                    <span className="text-gray-600 dark:text-gray-400">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* CTA Card */}
            {!user && (
              <Card className="mb-8 text-center">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Share Your Stories
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Join our community of writers and readers
                </p>
                <Link to="/register">
                  <Button variant="primary" fullWidth>
                    Get Started
                  </Button>
                </Link>
              </Card>
            )}

            {/* Trending Articles */}
            <Card>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center space-x-2">
                <span>🔥 Trending</span>
              </h3>
              <div className="space-y-4">
                {trendingArticles.map((article, idx) => (
                  <Link
                    key={article.id}
                    to={`/articles/${article.slug}`}
                    className="flex space-x-3 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0 hover:opacity-70 transition-opacity"
                  >
                    <span className="text-2xl font-bold text-primary-500">
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2">
                        {article.title}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {article.author?.firstName} {article.author?.lastName}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
