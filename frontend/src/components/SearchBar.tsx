import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onFiltersChange: (filters: any) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, onFiltersChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    location: '',
    jobType: '',
    experienceLevel: '',
    workplaceType: '',
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  return (
    <div className='w-full'>
      <form onSubmit={handleSearch} className='flex flex-col md:flex-row gap-3 mb-4'>
        <input
          type='text'
          placeholder='Search jobs by title, company, or skills...'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className='flex-1 px-4 py-3 border border-pink-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white'
        />
        <button
          type='submit'
          className='px-6 py-3 bg-pink-500 text-white font-semibold rounded-xl hover:bg-pink-600 transition'
        >
          Search
        </button>
        <button
          type='button'
          onClick={() => setShowFilters(!showFilters)}
          className='px-4 py-3 border border-pink-200 rounded-xl hover:bg-pink-50 transition text-gray-700 font-medium'
        >
          Filters
        </button>
      </form>

      {showFilters && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className='grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-pink-50 border border-pink-50 rounded-xl mb-4'
        >
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Location</label>
            <input
              type='text'
              placeholder='e.g., New York'
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              className='w-full px-3 py-2 border border-pink-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Job Type</label>
            <select
              value={filters.jobType}
              onChange={(e) => handleFilterChange('jobType', e.target.value)}
              className='w-full px-3 py-2 border border-pink-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white'
            >
              <option value=''>All Types</option>
              <option value='full-time'>Full-time</option>
              <option value='part-time'>Part-time</option>
              <option value='contract'>Contract</option>
              <option value='internship'>Internship</option>
            </select>
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Experience Level</label>
            <select
              value={filters.experienceLevel}
              onChange={(e) => handleFilterChange('experienceLevel', e.target.value)}
              className='w-full px-3 py-2 border border-pink-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white'
            >
              <option value=''>All Levels</option>
              <option value='entry'>Entry</option>
              <option value='mid'>Mid-level</option>
              <option value='senior'>Senior</option>
              <option value='lead'>Lead</option>
            </select>
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Workplace</label>
            <select
              value={filters.workplaceType}
              onChange={(e) => handleFilterChange('workplaceType', e.target.value)}
              className='w-full px-3 py-2 border border-pink-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white'
            >
              <option value=''>All Types</option>
              <option value='remote'>Remote</option>
              <option value='on-site'>On-site</option>
              <option value='hybrid'>Hybrid</option>
            </select>
          </div>
        </motion.div>
      )}
    </div>
  );
};
