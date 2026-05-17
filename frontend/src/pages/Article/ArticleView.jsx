import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { FiHeart, FiMessageCircle, FiShare2, FiArrowLeft, FiEdit2, FiTrash2, FiUser } from 'react-icons/fi'
import Button from '../../components/Common/Button'
import Card from '../../components/Common/Card'
import Loading from '../../components/Common/Loading'
import articleService from '../../services/articleService'
import commentService from '../../services/commentService'

/**
 * Article View Page Component
 * Display full article with comments, likes, and sharing options
 */
const ArticleView = () => {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const [article, setArticle] = useState(null)
  const [comments, setComments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [likeCount, setLikeCount] = useState(0)

  // Fetch article and comments on mount
  useEffect(() => {
    fetchArticle()
    fetchComments()
  }, [slug])

  const fetchArticle = async () => {
    try {
      setIsLoading(true)
      const response = await articleService.getArticleBySlug(slug)
      setArticle(response)
      setLikeCount(response.likeCount || 0)
      setIsLiked(response.isLiked || false)

      // Increment view count
      await articleService.incrementViewCount(response.id)
    } catch (error) {
      toast.error('Article not found')
      navigate('/')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchComments = async () => {
    try {
      const response = await articleService.getComments(slug)
      setComments(response.comments || [])
    } catch (error) {
      console.error('Failed to fetch comments')
    }
  }

  const handleLike = async () => {
    if (!user) {
      toast.error('Please login to like articles')
      navigate('/login')
      return
    }

    try {
      if (isLiked) {
        await articleService.unlikeArticle(article.id)
        setLikeCount(likeCount - 1)
      } else {
        await articleService.likeArticle(article.id)
        setLikeCount(likeCount + 1)
      }
      setIsLiked(!isLiked)
    } catch (error) {
      toast.error('Failed to update like status')
    }
  }

  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    if (!user) {
      toast.error('Please login to comment')
      navigate('/login')
      return
    }

    if (!commentText.trim()) {
      toast.error('Please write a comment')
      return
    }

    try {
      setIsSubmittingComment(true)
      await commentService.createComment({
        articleId: article.id,
        content: commentText,
      })
      toast.success('Comment posted successfully!')
      setCommentText('')
      fetchComments()
    } catch (error) {
      toast.error('Failed to post comment')
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return

    try {
      await commentService.deleteComment(commentId)
      toast.success('Comment deleted')
      fetchComments()
    } catch (error) {
      toast.error('Failed to delete comment')
    }
  }

  const handleDeleteArticle = async () => {
    if (!window.confirm('Are you sure you want to delete this article?')) return

    try {
      await articleService.deleteArticle(article.id)
      toast.success('Article deleted successfully')
      navigate('/dashboard')
    } catch (error) {
      toast.error('Failed to delete article')
    }
  }

  const handleShare = async () => {
    const shareText = `${article.title}\n\nRead more: ${window.location.href}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.excerpt,
          url: window.location.href,
        })
      } catch (error) {
        console.log('Share cancelled')
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard!')
    }
  }

  if (isLoading) {
    return <Loading message="Loading article..." />
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Article not found
          </h2>
          <Button onClick={() => navigate('/')}>Back to Home</Button>
        </div>
      </div>
    )
  }

  const isAuthor = user?.id === article.authorId

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-primary-500 hover:text-primary-600 mb-8"
        >
          <FiArrowLeft size={20} />
          <span>Back</span>
        </button>

        {/* Article Card */}
        <Card>
          {/* Cover Image */}
          {article.coverImageUrl && (
            <img
              src={article.coverImageUrl}
              alt={article.title}
              className="w-full h-96 object-cover rounded-lg mb-8"
            />
          )}

          {/* Title and Meta */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {article.title}
            </h1>
            
            <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-400 mb-6">
              <span>
                {new Date(article.publishedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
              <span>•</span>
              <span>{article.readingTimeMinutes || 5} min read</span>
              <span>•</span>
              <span>{article.viewCount?.toLocaleString() || 0} views</span>
            </div>

            {/* Author Info */}
            <Link
              to={`/profile/${article.author?.username}`}
              className="flex items-center space-x-4 py-4 border-b border-gray-200 dark:border-gray-700"
            >
              <img
                src={article.author?.profilePictureUrl || `https://ui-avatars.com/api/?name=${article.author?.firstName}+${article.author?.lastName}`}
                alt={article.author?.firstName}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {article.author?.firstName} {article.author?.lastName}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  @{article.author?.username}
                </p>
              </div>
            </Link>
          </div>

          {/* Article Content */}
          <div className="prose dark:prose-invert max-w-none mb-8">
            {article.excerpt && (
              <p className="text-xl text-gray-600 dark:text-gray-400 italic mb-6">
                {article.excerpt}
              </p>
            )}
            <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
              {article.content}
            </div>
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              {article.tags.map((tag) => (
                <Link
                  key={tag}
                  to={`/?tag=${tag}`}
                  className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm hover:bg-blue-200 dark:hover:bg-blue-800"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLike}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  isLiked
                    ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-red-100 dark:hover:bg-red-900'
                }`}
              >
                <FiHeart size={20} fill={isLiked ? 'currentColor' : 'none'} />
                <span>{likeCount}</span>
              </button>

              <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700">
                <FiMessageCircle size={20} />
                <span>{comments.length}</span>
              </button>
            </div>

            <div className="flex items-center space-x-2">
              {isAuthor && (
                <>
                  <Link to={`/article/${article.id}/edit`}>
                    <button className="flex items-center space-x-2 px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800">
                      <FiEdit2 size={20} />
                      <span>Edit</span>
                    </button>
                  </Link>
                  <button
                    onClick={handleDeleteArticle}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-800"
                  >
                    <FiTrash2 size={20} />
                    <span>Delete</span>
                  </button>
                </>
              )}
              <button
                onClick={handleShare}
                className="flex items-center space-x-2 px-4 py-2 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-800"
              >
                <FiShare2 size={20} />
                <span>Share</span>
              </button>
            </div>
          </div>
        </Card>

        {/* Comments Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Comments ({comments.length})
          </h2>

          {/* Comment Form */}
          {user ? (
            <Card className="mb-8">
              <form onSubmit={handleCommentSubmit}>
                <div className="flex space-x-4 mb-4">
                  <img
                    src={user.profilePictureUrl || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}`}
                    alt={user.firstName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Share your thoughts..."
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    loading={isSubmittingComment}
                  >
                    Post Comment
                  </Button>
                </div>
              </form>
            </Card>
          ) : (
            <Card className="mb-8 text-center py-8">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Please log in to post a comment
              </p>
              <Link to="/login">
                <Button variant="primary">Log In</Button>
              </Link>
            </Card>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <Card>
                <p className="text-center text-gray-600 dark:text-gray-400 py-8">
                  No comments yet. Be the first to comment!
                </p>
              </Card>
            ) : (
              comments.map((comment) => (
                <Card key={comment.id}>
                  <div className="flex space-x-4">
                    <img
                      src={comment.author?.profilePictureUrl || `https://ui-avatars.com/api/?name=${comment.author?.firstName}+${comment.author?.lastName}`}
                      alt={comment.author?.firstName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {comment.author?.firstName} {comment.author?.lastName}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        {user?.id === comment.authorId && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ArticleView
