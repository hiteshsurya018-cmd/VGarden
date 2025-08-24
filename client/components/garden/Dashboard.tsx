import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { fetchUserGardens, createGarden } from '../../store/slices/gardenSlice';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import {
  Plus,
  Leaf,
  Sparkles,
  TrendingUp,
  Calendar,
  Users,
  Trophy,
  MapPin,
  Settings,
  Camera,
  TreePine,
  Eye,
  Droplets,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { gardens, isLoading } = useAppSelector((state) => state.garden);
  const [showCreateGarden, setShowCreateGarden] = useState(false);

  useEffect(() => {
    dispatch(fetchUserGardens());
  }, [dispatch]);

  const handleCreateGarden = async () => {
    await dispatch(createGarden({
      name: `Garden ${gardens.length + 1}`,
      description: 'My beautiful virtual garden'
    }));
    setShowCreateGarden(false);
  };

  const getUserLevel = () => {
    if (!user) return 1;
    return Math.floor(user.experience / 1000) + 1;
  };

  const getExperienceProgress = () => {
    if (!user) return 0;
    return (user.experience % 1000) / 10; // Convert to percentage
  };

  // Mock data to match the design
  const mockGardens = [
    {
      id: '1',
      name: 'My First Garden',
      description: 'A beautiful starter garden with roses and sunflowers',
      plants: 5,
      healthy: 4,
      type: 'outdoor',
      imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop&crop=center'
    },
    {
      id: '2', 
      name: 'Boston Fern Garden',
      description: 'The garden features a modern, minimalist design with vertical plant arrangements on the walls, creating a lush backdrop. The area includes comfortable seating, with a small table placed centrally on a stone...',
      plants: 12,
      healthy: 8,
      type: 'indoor',
      imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop&crop=center'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.firstName || 'HITESH'}! 🌱
            </h1>
            <p className="text-gray-600 mt-1">
              Your virtual gardens are thriving. Ready to grow something new?
            </p>
          </div>
          <Button className="bg-green-600 hover:bg-green-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            New Garden
          </Button>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-white border-0 shadow-lg" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-white border-0 shadow-lg" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-white border-0 shadow-lg" />
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* My Gardens Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Leaf className="w-5 h-5 text-green-600" />
                My Gardens
              </h2>
              <Link to="/gardens" className="text-green-600 hover:text-green-700 text-sm font-medium">
                View All
              </Link>
            </div>

            <div className="space-y-4">
              {mockGardens.map((garden, index) => (
                <motion.div
                  key={garden.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Card className="bg-white border-0 shadow-sm hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                          <Leaf className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">{garden.name}</h3>
                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                              {garden.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {garden.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <TreePine className="w-3 h-3" />
                              {garden.plants} plants
                            </span>
                            <span className="flex items-center gap-1">
                              <Droplets className="w-3 h-3" />
                              {garden.healthy} healthy
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Aug 19
                            </span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Recent Activity Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Recent Activity
              </h2>
            </div>

            <div className="space-y-3">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-start gap-3 p-3 bg-white rounded-lg border"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                  <Droplets className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">Watered Dracaena</p>
                  <p className="text-xs text-gray-600">2 hours ago</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-start gap-3 p-3 bg-white rounded-lg border"
              >
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mt-1">
                  <Leaf className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">Watered Fern</p>
                  <p className="text-xs text-gray-600">4 hours ago</p>
                </div>
              </motion.div>
            </div>

            {/* Garden Level Progress */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-8"
            >
              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
                <CardContent className="p-6">
                  <div className="text-center">
                    <h3 className="font-bold text-xl mb-2">Garden Level</h3>
                    <div className="text-4xl font-bold mb-2">Level 3</div>
                    <div className="w-full bg-purple-400 rounded-full h-2 mb-2">
                      <div className="bg-white rounded-full h-2" style={{ width: '75%' }}></div>
                    </div>
                    <p className="text-purple-100 text-sm">750/1000 XP</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
