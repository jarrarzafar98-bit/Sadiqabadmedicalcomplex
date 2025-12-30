import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getBlogPost, getBlogPosts } from '../services/api';
import { Calendar, User, Eye, Tag, ArrowLeft, Share2, Facebook, Twitter } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const BlogPostPage = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await getBlogPost(slug);
        setPost(response.data);

        // Fetch related posts
        const relatedRes = await getBlogPosts({ category: response.data.category, limit: 3 });
        setRelatedPosts(relatedRes.data.filter(p => p.slug !== slug).slice(0, 2));
      } catch (error) {
        console.error('Failed to fetch post:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Article not found</h2>
          <Link to="/blog" className="text-primary-600 hover:underline">
            Back to Health Articles
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <article className="lg:col-span-3">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-6"
            >
              <ArrowLeft size={20} />
              Back to Articles
            </Link>

            <div className="card overflow-hidden">
              {post.featured_image && (
                <img
                  src={post.featured_image}
                  alt={post.title}
                  className="w-full h-64 md:h-96 object-cover"
                />
              )}
              <div className="p-6 md:p-8">
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                  <span className="bg-primary-50 text-primary-600 px-3 py-1 rounded">
                    {post.category}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={16} />
                    {format(parseISO(post.published_at), 'MMMM d, yyyy')}
                  </span>
                  <span className="flex items-center gap-1">
                    <User size={16} />
                    {post.author}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye size={16} />
                    {post.views} views
                  </span>
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  {post.title}
                </h1>

                <div
                  className="prose prose-lg max-w-none text-gray-600"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {/* Tags */}
                {post.tags?.length > 0 && (
                  <div className="mt-8 pt-6 border-t">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Tag size={18} className="text-gray-400" />
                      {post.tags.map((tag) => (
                        <span key={tag} className="bg-gray-100 text-gray-600 px-3 py-1 rounded text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Share */}
                <div className="mt-6 pt-6 border-t">
                  <p className="text-sm font-medium text-gray-700 mb-3">Share this article:</p>
                  <div className="flex gap-3">
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Facebook size={20} />
                    </a>
                    <a
                      href={`https://twitter.com/intent/tweet?url=${window.location.href}&text=${post.title}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
                    >
                      <Twitter size={20} />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* In-Article Ad Space */}
            <div className="my-8 p-4 bg-gray-100 rounded-lg text-center text-sm text-gray-400">
              {/* Ad Space - In Article */}
            </div>
          </article>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Related Posts */}
              {relatedPosts.length > 0 && (
                <div className="card p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Related Articles</h3>
                  <div className="space-y-4">
                    {relatedPosts.map((related) => (
                      <Link
                        key={related.id}
                        to={`/blog/${related.slug}`}
                        className="block hover:bg-gray-50 p-2 rounded -m-2 transition-colors"
                      >
                        <h4 className="font-medium text-gray-900 text-sm line-clamp-2">
                          {related.title}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {format(parseISO(related.published_at), 'MMM d, yyyy')}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Ad Space */}
              <div className="card p-4 bg-gray-100 text-center text-sm text-gray-400">
                {/* Ad Space - Sidebar */}
              </div>

              {/* CTA */}
              <div className="card p-6 bg-primary-50">
                <h3 className="font-semibold text-gray-900 mb-2">Need Medical Advice?</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Book an appointment with our specialists for personalized healthcare.
                </p>
                <Link to="/book-appointment" className="btn-primary w-full text-center text-sm">
                  Book Appointment
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPostPage;
