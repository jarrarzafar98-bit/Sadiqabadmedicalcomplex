import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getDiagnosticTests } from '../services/api';
import { Search, TestTube, Clock, FileText, ArrowRight } from 'lucide-react';

const DiagnosticsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  const categories = [
    { value: '', label: 'All Tests' },
    { value: 'lab_tests', label: 'Lab Tests' },
    { value: 'imaging', label: 'Imaging' },
    { value: 'cardiology', label: 'Cardiology' },
  ];

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const response = await getDiagnosticTests({
          category: selectedCategory || undefined,
          search: searchQuery || undefined
        });
        setTests(response.data);
      } catch (error) {
        console.error('Failed to fetch tests:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTests();
  }, [selectedCategory, searchQuery]);

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    if (value) {
      searchParams.set('category', value);
    } else {
      searchParams.delete('category');
    }
    setSearchParams(searchParams);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery) {
      searchParams.set('search', searchQuery);
    } else {
      searchParams.delete('search');
    }
    setSearchParams(searchParams);
  };

  const getCategoryLabel = (value) => {
    const cat = categories.find(c => c.value === value);
    return cat ? cat.label : value;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Diagnostic Center</h1>
          <p className="text-gray-600">Comprehensive lab tests and imaging services</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search tests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </form>
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => handleCategoryChange(cat.value)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                    selectedCategory === cat.value
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-500">Loading tests...</p>
          </div>
        ) : tests.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl">
            <TestTube className="mx-auto text-gray-300 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No tests found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map((test) => (
              <div key={test.id} className="card hover:shadow-lg transition-shadow" data-testid={`test-card-${test.id}`}>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 bg-accent-50 rounded-lg flex items-center justify-center">
                      <TestTube className="text-accent-600" size={24} />
                    </div>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {getCategoryLabel(test.category)}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{test.name}</h3>
                  {test.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{test.description}</p>
                  )}
                  <div className="space-y-2 mb-4">
                    {test.report_time && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock size={14} />
                        <span>Report: {test.report_time}</span>
                      </div>
                    )}
                    {test.preparation && (
                      <div className="flex items-start gap-2 text-sm text-gray-500">
                        <FileText size={14} className="mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-1">{test.preparation}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t">
                    <span className="text-sm text-gray-500">{test.price}</span>
                    <Link
                      to={`/book-diagnostic?test=${test.id}`}
                      className="btn-accent text-sm py-1.5 px-3 flex items-center gap-1"
                    >
                      Book Test
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DiagnosticsPage;
