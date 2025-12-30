import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getBlogPosts, getBlogCategories } from '../services/api';
import { Calendar, User, Eye, Tag, ArrowRight } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const BlogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postsRes, categoriesRes] = await Promise.all([
          getBlogPosts({ category: selectedCategory || undefined, limit: 20 }),
          getBlogCategories()
        ]);
        setPosts(postsRes.data);
        setCategories(categoriesRes.data);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedCategory]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    if (category) {
      searchParams.set('category', category);
    } else {
      searchParams.delete('category');
    }
    setSearchParams(searchParams);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Health Articles</h1>
            <p className="text-xl text-primary-100">
              Stay informed with the latest health tips and medical insights from our experts.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="card p-6 sticky top-24">
                <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => handleCategoryChange('')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      !selectedCategory ? 'bg-primary-50 text-primary-600' : 'hover:bg-gray-50'
                    }`}
                  >
                    All Articles
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => handleCategoryChange(category)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        selectedCategory === category ? 'bg-primary-50 text-primary-600' : 'hover:bg-gray-50'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>

                {/* Ad Placeholder */}
                <div className="mt-8 p-4 bg-gray-100 rounded-lg text-center text-sm text-gray-400">
                  {/* Ad Space - Sidebar */}
                </div>
              </div>
            </div>

            {/* Posts Grid */}
            <div className="lg:col-span-3">
              {posts.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl">
                  <Tag className="mx-auto text-gray-300 mb-4" size={48} />
                  <h3 className="text-xl font-semibold text-gray-700">No articles found</h3>
                  <p className="text-gray-500">Check back soon for new content.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {posts.map((post) => (
                    <article key={post.id} className="card overflow-hidden hover:shadow-lg transition-shadow">
                      {post.featured_image && (
                        <img
                          src={post.featured_image}
                          alt={post.title}
                          className="w-full h-48 object-cover"
                        />
                      )}
                      <div className="p-6">
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                          <span className="bg-primary-50 text-primary-600 px-2 py-1 rounded text-xs">
                            {post.category}
                          </span>
                          {post.published_at && (
                            <span className="flex items-center gap-1">
                              <Calendar size={14} />
                              {format(parseISO(post.published_at), 'MMM d, yyyy')}
                            </span>
                          )}
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                          <Link to={`/blog/${post.slug}`} className="hover:text-primary-600">
                            {post.title}
                          </Link>
                        </h2>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {post.excerpt || post.content?.replace(/<[^>]*>/g, '').substring(0, 150) + '...'}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500 flex items-center gap-1">
                            <User size={14} />
                            {post.author}
                          </span>
                          <Link
                            to={`/blog/${post.slug}`}
                            className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
                          >
                            Read More
                            <ArrowRight size={16} />
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BlogPage;
