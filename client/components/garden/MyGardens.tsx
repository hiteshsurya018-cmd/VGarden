import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import {
  Plus,
  Search,
  Settings,
  MoreVertical,
  TreePine,
  Droplets,
} from 'lucide-react';

const MyGardens: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All Types');

  const gardens = [
    {
      id: '1',
      name: 'Sunny Balcony Oasis',
      description: 'A small sun-drenched balcony filled with perfect plants.',
      plants: 0,
      watering: 0,
      type: 'balcony',
      createdDate: 'Aug 18, 2025',
      imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=200&fit=crop&crop=center',
      backgroundColor: 'bg-green-100'
    },
    {
      id: '2', 
      name: 'Indoor Jungle',
      description: 'My collection of indoor plants, turning my room green.',
      plants: 0,
      watering: 0,
      type: 'indoor',
      createdDate: 'Aug 18, 2025',
      imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=200&fit=crop&crop=center',
      backgroundColor: 'bg-blue-100'
    },
    {
      id: '3',
      name: 'Boston Fern Garden',
      description: 'The garden features a modern, minimalist design with vertical plant arrangements on the walls, creating a lush backdrop. The area includes comfortable seating, with a small table placed centrally on a stone...',
      plants: 3,
      watering: 3,
      type: 'outdoor',
      createdDate: 'Aug 18, 2025',
      imageUrl: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400&h=200&fit=crop&crop=center',
      backgroundColor: 'bg-green-200'
    }
  ];

  const filters = ['All Types', 'indoor', 'outdoor', 'balcony', 'greenhouse'];

  const filteredGardens = gardens.filter(garden => {
    const matchesSearch = garden.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'All Types' || garden.type === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Gardens</h1>
            <p className="text-gray-600 mt-1">
              Manage your virtual gardens and watch them grow
            </p>
          </div>
          <Button className="bg-green-600 hover:bg-green-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            New Garden
          </Button>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search gardens..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full max-w-md"
            />
          </div>

          <div className="flex items-center gap-4">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedFilter === filter
                    ? 'bg-black text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {filter}
              </button>
            ))}
            <Button variant="ghost" size="sm" className="ml-auto">
              <Settings className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>

        {/* Gardens Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGardens.map((garden, index) => (
            <motion.div
              key={garden.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <Card className="bg-white border-0 shadow-sm hover:shadow-lg transition-shadow overflow-hidden">
                <div className={`h-48 ${garden.backgroundColor} relative`}>
                  {garden.imageUrl ? (
                    <img 
                      src={garden.imageUrl} 
                      alt={garden.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <TreePine className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <Badge variant="secondary" className="bg-white/90 text-gray-700">
                      {garden.type}
                    </Badge>
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">{garden.name}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {garden.description}
                  </p>
                  
                  <div className="flex items-center gap-4 mb-3 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <TreePine className="w-4 h-4 text-green-500" />
                      <span>{garden.plants} Plants</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Droplets className="w-4 h-4 text-blue-500" />
                      <span>{garden.watering} Watering</span>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    Created {garden.createdDate}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredGardens.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <TreePine className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No gardens found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm ? 'Try adjusting your search or filters' : 'Start your gardening journey by creating your first garden'}
            </p>
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Garden
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MyGardens;
