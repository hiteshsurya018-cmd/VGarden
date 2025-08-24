import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Trophy,
  Users,
  UserPlus,
  Target,
  Coins,
  Star,
  Clock,
  Heart,
  Home,
  Activity,
  Sprout,
} from 'lucide-react';

const CommunityPage: React.FC = () => {
  const challenges = [
    {
      id: '1',
      title: 'Rose Enthusiast',
      description: 'Show your love for roses by growing one in your garden',
      goal: 'Grow a Rose',
      reward: { coins: 100, xp: 50 },
      daysLeft: 125,
      icon: <Heart className="w-6 h-6" />,
      color: 'text-pink-500'
    },
    {
      id: '2',
      title: 'Balcony Gardener', 
      description: 'Create a beautiful and cozy balcony garden',
      goal: 'Create a balcony garden',
      reward: { coins: 150, xp: 75 },
      daysLeft: 134,
      icon: <Home className="w-6 h-6" />,
      color: 'text-orange-500'
    },
    {
      id: '3',
      title: 'Health Inspector',
      description: 'Prove your gardening skills by having 5 healthy plants at once',
      goal: 'Have 5 healthy plants',
      reward: { coins: 200, xp: 100 },
      daysLeft: 181,
      icon: <Activity className="w-6 h-6" />,
      color: 'text-blue-500'
    },
    {
      id: '4',
      title: 'Sprouting Up',
      description: 'Begin your journey and reach level 2',
      goal: 'Reach level 2',
      reward: { coins: 50, xp: 25 },
      daysLeft: 119,
      icon: <Sprout className="w-6 h-6" />,
      color: 'text-green-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Garden Challenges */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Target className="w-6 h-6 text-purple-600" />
                Garden Challenges
              </h1>
            </motion.div>

            <div className="space-y-6">
              {challenges.map((challenge, index) => (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Card className="bg-white border-0 shadow-sm hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`${challenge.color}`}>
                            {challenge.icon}
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-gray-900">{challenge.title}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Clock className="w-4 h-4" />
                              <span>{challenge.daysLeft} days left</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-4">{challenge.description}</p>
                      
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Goal:</p>
                        <p className="text-sm text-gray-600">{challenge.goal}</p>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-gray-500">Reward:</span>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              <Coins className="w-4 h-4 text-yellow-500" />
                              <span className="text-sm font-medium">{challenge.reward.coins} Coins</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-purple-500" />
                              <span className="text-sm font-medium">{challenge.reward.xp} XP</span>
                            </div>
                          </div>
                        </div>
                        <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                          <Trophy className="w-4 h-4 mr-2" />
                          Accept Challenge
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Friends Section */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Friends
                </h2>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Friend
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-white border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Friends (0)
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900 flex items-center gap-2">
                        <UserPlus className="w-4 h-4" />
                        Requests (0)
                      </span>
                    </div>
                    
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <h3 className="font-medium text-gray-900 mb-2">No friends yet</h3>
                      <p className="text-sm text-gray-600">
                        Add friends to see their gardens!
                      </p>
                    </div>
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

export default CommunityPage;
