import React, { useState, useEffect } from 'react';
import { getBlogPosts, createBlogPost, updateBlogPost, deleteBlogPost } from '../services/api';
import { Plus, Edit, Trash2, Eye, X } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const AdminBlog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    title: '', slug: '', content: '', excerpt: '', category: '',
    tags: '', author: 'Admin', published: true, meta_title: '', meta_description: ''
  });

  const fetchData = async () => {
    try {
      const res = await getBlogPosts({ published_only: false, limit: 100 });
      setPosts(res.data);
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : []
      };
      if (editing) {
        await updateBlogPost(editing.id, data);
      } else {
        await createBlogPost(data);
      }
      setShowModal(false);
      setEditing(null);
      resetForm();
      fetchData();
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to save');
    }
  };

  const handleEdit = (post) => {
    setEditing(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt || '',
      category: post.category,
      tags: post.tags?.join(', ') || '',
      author: post.author,
      published: post.published,
      meta_title: post.meta_title || '',
      meta_description: post.meta_description || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this post?')) {
      try {
        await deleteBlogPost(id);
        fetchData();
      } catch (error) {
        alert('Failed to delete');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '', slug: '', content: '', excerpt: '', category: '',
      tags: '', author: 'Admin', published: true, meta_title: '', meta_description: ''
    });
  };

  const generateSlug = (title) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Blog Posts</h2>
        <button onClick={() => { resetForm(); setEditing(null); setShowModal(true); }} className="btn-primary flex items-center gap-2">
          <Plus size={20} /> New Post
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Title</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Category</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Views</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-900 line-clamp-1">{post.title}</p>
                    <p className="text-xs text-gray-500">{post.slug}</p>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{post.category}</td>
                  <td className="py-3 px-4 text-gray-600">{post.views}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs ${post.published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {post.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600 text-sm">
                    {format(parseISO(post.published_at), 'MMM d, yyyy')}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-500 hover:text-primary-600 inline-block"><Eye size={18} /></a>
                    <button onClick={() => handleEdit(post)} className="p-2 text-gray-500 hover:text-primary-600"><Edit size={18} /></button>
                    <button onClick={() => handleDelete(post.id)} className="p-2 text-gray-500 hover:text-red-600"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
              {posts.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-gray-500">No posts</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <h2 className="text-lg font-semibold">{editing ? 'Edit Post' : 'New Post'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input type="text" required value={formData.title} onChange={(e) => {
                  setFormData({...formData, title: e.target.value, slug: editing ? formData.slug : generateSlug(e.target.value)});
                }} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                <input type="text" required value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} className="input-field" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <input type="text" required value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="input-field" placeholder="Health Tips" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                  <input type="text" value={formData.author} onChange={(e) => setFormData({...formData, author: e.target.value})} className="input-field" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
                <textarea value={formData.excerpt} onChange={(e) => setFormData({...formData, excerpt: e.target.value})} className="input-field" rows={2} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content * (HTML supported)</label>
                <textarea required value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} className="input-field font-mono text-sm" rows={10} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                <input type="text" value={formData.tags} onChange={(e) => setFormData({...formData, tags: e.target.value})} className="input-field" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
                  <input type="text" value={formData.meta_title} onChange={(e) => setFormData({...formData, meta_title: e.target.value})} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                  <input type="text" value={formData.meta_description} onChange={(e) => setFormData({...formData, meta_description: e.target.value})} className="input-field" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="published" checked={formData.published} onChange={(e) => setFormData({...formData, published: e.target.checked})} className="rounded" />
                <label htmlFor="published" className="text-sm text-gray-700">Published</label>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">{editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBlog;
