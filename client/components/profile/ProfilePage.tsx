import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { useAppSelector } from '../../store/store';
import {
  BarChart3,
  Trophy,
  Settings,
  Bell,
  Moon,
  Mail,
  Globe,
  Shield,
  Star,
  Coins,
  TreePine,
  Heart,
  Target,
  Crown,
  Lock,
} from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);

  const achievements = [
    {
      id: '1',
      title: 'First Garden',
      description: 'Created your first virtual garden',
      icon: <TreePine className="w-5 h-5" />,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
      unlocked: true
    },
    {
      id: '2',
      title: 'Green Thumb', 
      description: 'Maintained 5 healthy plants',
      icon: <Heart className="w-5 h-5" />,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      unlocked: true
    },
    {
      id: '3',
      title: 'Master Gardener',
      description: 'Successfully grew 10 plants to maturity',
      icon: <Crown className="w-5 h-5" />,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      unlocked: true
    },
    {
      id: '4',
      title: 'Plant Whisperer',
      description: 'Grow 25 plants',
      icon: <Target className="w-5 h-5" />,
      color: 'text-gray-400',
      bgColor: 'bg-gray-50',
      unlocked: false
    }
  ];

  const stats = [
    { label: 'Gardens Created', value: '4', icon: <TreePine className="w-5 h-5 text-green-500" /> },
    { label: 'Plants Grown', value: '3', icon: <Heart className="w-5 h-5 text-pink-500" /> },
    { label: 'Healthy Plants', value: '3', icon: <Star className="w-5 h-5 text-yellow-500" /> },
    { label: 'Success Rate', value: '100%', icon: <Target className="w-5 h-5 text-blue-500" /> }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="relative inline-block mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {user?.firstName?.charAt(0) || 'H'}
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            {user?.firstName} {user?.lastName} || 'HITESH SURYA'
          </h1>
          <p className="text-gray-600 mb-4">
            {user?.email || 'hiteshsurya018@gmail.com'}
          </p>
          <div className="flex items-center justify-center gap-4">
            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
              Level {user?.level || '1'}
            </Badge>
            <div className="flex items-center gap-1">
              <Coins className="w-4 h-4 text-yellow-500" />
              <span className="font-medium">{user?.coins || '115'} Coins</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-purple-500" />
              <span className="font-medium">{user?.experience || '100'} XP</span>
            </div>
          </div>
          <div className="w-48 bg-gray-200 rounded-full h-2 mx-auto mt-2">
            <div className="bg-purple-500 h-2 rounded-full" style={{ width: '100%' }}></div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Garden Statistics */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-6"
            >
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6">
                <BarChart3 className="w-5 h-5 text-green-600" />
                Garden Statistics
              </h2>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                {stats.map((stat, index) => (
                  <Card key={index} className="bg-white border-0 shadow-sm">
                    <CardContent className="p-4 text-center">
                      <div className="flex justify-center mb-2">
                        {stat.icon}
                      </div>
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {stat.value}
                      </div>
                      <div className="text-sm text-gray-600">
                        {stat.label}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>

            {/* Settings */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6">
                <Settings className="w-5 h-5 text-blue-600" />
                Settings
              </h2>
              
              <Card className="bg-white border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Bell className="w-5 h-5 text-gray-400" />
                        <span className="font-medium text-gray-900">Push Notifications</span>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Moon className="w-5 h-5 text-gray-400" />
                        <span className="font-medium text-gray-900">Dark Mode</span>
                      </div>
                      <Switch />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <span className="font-medium text-gray-900">Email Notifications</span>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-gray-400" />
                        <span className="font-medium text-gray-900">Language</span>
                      </div>
                      <select className="border border-gray-300 rounded-md px-3 py-1 text-sm">
                        <option>English</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-gray-400" />
                        <span className="font-medium text-gray-900">Privacy Settings</span>
                      </div>
                      <Button variant="outline" size="sm">
                        Manage Privacy
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Achievements */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6">
                <Trophy className="w-5 h-5 text-yellow-600" />
                Achievements
              </h2>
              
              <div className="space-y-4">
                {achievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <Card className={`border-0 shadow-sm ${achievement.unlocked ? 'bg-white' : 'bg-gray-50'}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${achievement.bgColor}`}>
                            <div className={achievement.color}>
                              {achievement.unlocked ? achievement.icon : <Lock className="w-5 h-5" />}
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className={`font-semibold ${achievement.unlocked ? 'text-gray-900' : 'text-gray-500'}`}>
                              {achievement.title}
                            </h3>
                            <p className={`text-sm ${achievement.unlocked ? 'text-gray-600' : 'text-gray-400'}`}>
                              {achievement.unlocked ? achievement.description : `Locked - ${achievement.description}`}
                            </p>
                          </div>
                          {achievement.unlocked && (
                            <Trophy className="w-5 h-5 text-yellow-500" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
