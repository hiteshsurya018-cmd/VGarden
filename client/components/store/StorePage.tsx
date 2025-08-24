import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Sparkles,
  Star,
  Droplets,
  Zap,
  Coins,
  TrendingUp,
} from 'lucide-react';

const StorePage: React.FC = () => {
  const storeItems = [
    {
      id: '1',
      name: 'Rose Seeds',
      description: 'Beautiful red rose seeds perfect for outdoor gardens',
      growthBoost: '+10',
      price: 25,
      category: 'seeds',
      backgroundColor: 'bg-green-100',
      icon: '🌹'
    },
    {
      id: '2',
      name: 'Sunflower Seeds',
      description: 'Bright yellow sunflower seeds that grow tall and strong',
      growthBoost: '+15',
      price: 20,
      category: 'seeds', 
      backgroundColor: 'bg-yellow-100',
      icon: '🌻'
    },
    {
      id: '3',
      name: 'Tulip Bulbs',
      description: 'Colorful tulip bulbs for spring gardens',
      growthBoost: '+20',
      price: 30,
      category: 'seeds',
      backgroundColor: 'bg-purple-100',
      icon: '🌷'
    },
    {
      id: '4',
      name: 'Baby Cactus',
      description: 'Low maintenance succulent perfect for beginners',
      healthBoost: '+25',
      price: 50,
      category: 'plants',
      backgroundColor: 'bg-green-200',
      icon: '🌵'
    },
    {
      id: '5',
      name: 'Lucky Bamboo',
      description: 'Bring good luck and positive energy to your garden',
      healthBoost: '+40',
      price: 40,
      category: 'tools',
      backgroundColor: 'bg-green-100',
      icon: <Sparkles className="w-8 h-8 text-purple-500" />
    },
    {
      id: '6',
      name: 'Garden Gnome',
      description: 'Adorable garden gnome to watch over your plants',
      decorationBoost: '+5',
      price: 35,
      category: 'decorations',
      backgroundColor: 'bg-orange-100',
      icon: <Star className="w-8 h-8 text-orange-500" />
    },
    {
      id: '7',
      name: 'Watering Can',
      description: 'Essential for keeping your plants hydrated',
      growthBoost: '+5',
      price: 15,
      category: 'tools',
      backgroundColor: 'bg-blue-100',
      icon: <Droplets className="w-8 h-8 text-blue-500" />
    },
    {
      id: '8',
      name: 'Super Fertilizer',
      description: 'Advanced nutrient boost plant growth significantly',
      growthBoost: '+15',
      price: 60,
      category: 'tools',
      backgroundColor: 'bg-red-100',
      icon: <Zap className="w-8 h-8 text-red-500" />
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Store</h1>
          <p className="text-gray-600">
            Everything you need for your virtual garden
          </p>
        </motion.div>

        {/* Store Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {storeItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <Card className="bg-white border-0 shadow-sm hover:shadow-lg transition-shadow overflow-hidden">
                <div className={`h-32 ${item.backgroundColor} flex items-center justify-center relative`}>
                  {typeof item.icon === 'string' ? (
                    <span className="text-4xl">{item.icon}</span>
                  ) : (
                    item.icon
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge variant="outline" className="bg-white/90 text-xs">
                      {item.category}
                    </Badge>
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">{item.name}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {item.description}
                  </p>
                  
                  {item.growthBoost && (
                    <div className="flex items-center gap-1 mb-2">
                      <TrendingUp className="w-3 h-3 text-green-500" />
                      <span className="text-xs text-gray-500">growth boost {item.growthBoost}</span>
                    </div>
                  )}
                  
                  {item.healthBoost && (
                    <div className="flex items-center gap-1 mb-2">
                      <Sparkles className="w-3 h-3 text-purple-500" />
                      <span className="text-xs text-gray-500">health boost {item.healthBoost}</span>
                    </div>
                  )}
                  
                  {item.decorationBoost && (
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="w-3 h-3 text-orange-500" />
                      <span className="text-xs text-gray-500">decoration {item.decorationBoost}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-1">
                      <Coins className="w-4 h-4 text-yellow-500" />
                      <span className="font-bold text-gray-900">{item.price}</span>
                    </div>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                      Buy Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StorePage;
