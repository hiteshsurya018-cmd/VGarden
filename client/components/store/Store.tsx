import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { 
  fetchCategories, 
  fetchItems, 
  addToCart, 
  purchaseItem,
  setSelectedCategory 
} from '../../store/slices/storeSlice';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { 
  ShoppingCart, 
  Coins, 
  Search, 
  Filter, 
  Star,
  Leaf,
  Palette,
  Zap,
  Wrench
} from 'lucide-react';

const Store: React.FC = () => {
  const dispatch = useAppDispatch();
  const { categories, items, cart, selectedCategory, isLoading } = useAppSelector((state) => state.store);
  const { user } = useAppSelector((state) => state.auth);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'popularity'>('name');

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchItems());
  }, [dispatch]);

  useEffect(() => {
    if (selectedCategory) {
      dispatch(fetchItems(selectedCategory));
    } else {
      dispatch(fetchItems());
    }
  }, [selectedCategory, dispatch]);

  const handleCategorySelect = (categoryId: string | null) => {
    dispatch(setSelectedCategory(categoryId));
  };

  const handleAddToCart = (itemId: string) => {
    dispatch(addToCart({ itemId, quantity: 1 }));
  };

  const handlePurchase = async (itemId: string) => {
    await dispatch(purchaseItem({ itemId, quantity: 1 }));
  };

  const getCartTotal = () => {
    return Object.entries(cart).reduce((total, [itemId, quantity]) => {
      const item = items.find(i => i.id === itemId);
      return total + (item ? item.price * quantity : 0);
    }, 0);
  };

  const getIconForCategory = (categoryName: string) => {
    switch (categoryName.toLowerCase()) {
      case 'seeds':
        return Leaf;
      case 'decorations':
        return Palette;
      case 'boosts':
        return Zap;
      case 'tools':
        return Wrench;
      default:
        return Leaf;
    }
  };

  const filteredItems = items
    .filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.price - b.price;
        case 'popularity':
          return b.price - a.price; // Mock popularity sort
        default:
          return a.name.localeCompare(b.name);
      }
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-green-200/50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Garden Store</h1>
              <p className="text-gray-600 mt-1">
                Everything you need for your virtual garden
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-yellow-600">
                <Coins className="w-5 h-5" />
                <span className="font-semibold">{user?.coins || 0}</span>
              </div>
              <Button variant="outline" className="relative">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Cart
                {Object.keys(cart).length > 0 && (
                  <Badge className="absolute -top-2 -right-2 w-5 h-5 rounded-full p-0 flex items-center justify-center">
                    {Object.values(cart).reduce((sum, qty) => sum + qty, 0)}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Search */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Search & Filter</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Sort by</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="name">Name</option>
                    <option value="price">Price</option>
                    <option value="popularity">Popularity</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button
                    variant={selectedCategory === null ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => handleCategorySelect(null)}
                  >
                    All Items
                  </Button>
                  {categories.map((category) => {
                    const Icon = getIconForCategory(category.name);
                    return (
                      <Button
                        key={category.id}
                        variant={selectedCategory === category.id ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => handleCategorySelect(category.id)}
                      >
                        <Icon className="w-4 h-4 mr-2" />
                        {category.name}
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Cart Summary */}
            {Object.keys(cart).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Cart Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(cart).map(([itemId, quantity]) => {
                      const item = items.find(i => i.id === itemId);
                      if (!item) return null;
                      return (
                        <div key={itemId} className="flex justify-between text-sm">
                          <span>{item.name} x{quantity}</span>
                          <span>{item.price * quantity} coins</span>
                        </div>
                      );
                    })}
                    <div className="border-t pt-2 font-semibold">
                      Total: {getCartTotal()} coins
                    </div>
                    <Button className="w-full mt-2">
                      Checkout
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Featured Items */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <Card className="bg-gradient-to-r from-green-500 to-blue-600 text-white">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-2">Daily Deals</h2>
                  <p className="mb-4 opacity-90">
                    Special offers on premium seeds and decorations
                  </p>
                  <Button variant="secondary">
                    View Deals
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardContent className="p-0">
                      <div className="h-48 bg-gradient-to-br from-green-200 to-green-300 rounded-t-lg flex items-center justify-center relative">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover rounded-t-lg"
                          />
                        ) : (
                          <Leaf className="w-16 h-16 text-green-500 opacity-50" />
                        )}
                        {item.isLimited && (
                          <Badge className="absolute top-2 left-2 bg-red-500">
                            Limited
                          </Badge>
                        )}
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-yellow-500">
                            {item.price} <Coins className="w-3 h-3 ml-1" />
                          </Badge>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {item.description || 'No description available'}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="text-sm">4.5</span>
                          </div>
                          <Badge variant="outline">
                            {item.category.name}
                          </Badge>
                        </div>
                        <div className="mt-4 space-y-2">
                          <Button
                            className="w-full"
                            onClick={() => handlePurchase(item.id)}
                            disabled={!item.isAvailable || (user?.coins || 0) < item.price}
                          >
                            Buy Now - {item.price} coins
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => handleAddToCart(item.id)}
                            disabled={!item.isAvailable}
                          >
                            Add to Cart
                          </Button>
                        </div>
                        {item.stock !== null && item.stock < 10 && (
                          <p className="text-xs text-red-600 mt-2">
                            Only {item.stock} left in stock!
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {filteredItems.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-500 mb-4">
                  <Search className="w-12 h-12 mx-auto mb-2" />
                  No items found
                </div>
                <p className="text-gray-600">
                  Try adjusting your search or filters
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Store;
