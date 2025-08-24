import express from 'express';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Get all plant species
router.get('/species', optionalAuth, async (req, res) => {
  try {
    const { category, search, limit = 50, offset = 0 } = req.query;

    const where = {};
    
    if (category) {
      where.category = category;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { scientificName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const species = await req.prisma.plantSpecies.findMany({
      where,
      take: parseInt(limit),
      skip: parseInt(offset),
      orderBy: { name: 'asc' }
    });

    const total = await req.prisma.plantSpecies.count({ where });

    res.json({
      species,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < total
      }
    });
  } catch (error) {
    console.error('Get plant species error:', error);
    res.status(500).json({ error: 'Failed to fetch plant species' });
  }
});

// Get plant species by ID
router.get('/species/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const species = await req.prisma.plantSpecies.findUnique({
      where: { id },
      include: {
        storeItems: {
          where: { isAvailable: true },
          include: {
            category: true
          }
        }
      }
    });

    if (!species) {
      return res.status(404).json({ error: 'Plant species not found' });
    }

    res.json(species);
  } catch (error) {
    console.error('Get plant species by ID error:', error);
    res.status(500).json({ error: 'Failed to fetch plant species' });
  }
});

// Search plant species
router.get('/species/search', optionalAuth, async (req, res) => {
  try {
    const { q, category, limit = 20 } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const where = {
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { scientificName: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } }
      ]
    };

    if (category) {
      where.category = category;
    }

    const species = await req.prisma.plantSpecies.findMany({
      where,
      take: parseInt(limit),
      orderBy: [
        { name: 'asc' },
        { scientificName: 'asc' }
      ]
    });

    res.json(species);
  } catch (error) {
    console.error('Search plant species error:', error);
    res.status(500).json({ error: 'Failed to search plant species' });
  }
});

// Get plant categories
router.get('/categories', optionalAuth, async (req, res) => {
  try {
    const categories = await req.prisma.plantSpecies.groupBy({
      by: ['category'],
      _count: {
        category: true
      },
      orderBy: {
        category: 'asc'
      }
    });

    const formattedCategories = categories.map(cat => ({
      name: cat.category,
      count: cat._count.category
    }));

    res.json(formattedCategories);
  } catch (error) {
    console.error('Get plant categories error:', error);
    res.status(500).json({ error: 'Failed to fetch plant categories' });
  }
});

// Create new plant species (admin only)
router.post('/species', authenticateToken, async (req, res) => {
  try {
    // For now, anyone can create species - in production, add admin check
    const {
      name,
      scientificName,
      category,
      description,
      careLevel,
      sunlight,
      watering,
      soilType,
      growthTime,
      harvestYield,
      imageUrl,
      color,
      size,
      seedPrice,
      rarity = 'common'
    } = req.body;

    if (!name || !category) {
      return res.status(400).json({ error: 'Name and category are required' });
    }

    const species = await req.prisma.plantSpecies.create({
      data: {
        name,
        scientificName,
        category,
        description,
        careLevel,
        sunlight,
        watering,
        soilType,
        growthTime,
        harvestYield,
        imageUrl,
        color,
        size,
        seedPrice,
        rarity
      }
    });

    res.status(201).json(species);
  } catch (error) {
    console.error('Create plant species error:', error);
    res.status(500).json({ error: 'Failed to create plant species' });
  }
});

// Update plant species (admin only)
router.put('/species/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const species = await req.prisma.plantSpecies.findUnique({
      where: { id }
    });

    if (!species) {
      return res.status(404).json({ error: 'Plant species not found' });
    }

    const updatedSpecies = await req.prisma.plantSpecies.update({
      where: { id },
      data: updateData
    });

    res.json(updatedSpecies);
  } catch (error) {
    console.error('Update plant species error:', error);
    res.status(500).json({ error: 'Failed to update plant species' });
  }
});

// Delete plant species (admin only)
router.delete('/species/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const species = await req.prisma.plantSpecies.findUnique({
      where: { id },
      include: {
        plantInstances: true
      }
    });

    if (!species) {
      return res.status(404).json({ error: 'Plant species not found' });
    }

    if (species.plantInstances.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete species that has planted instances' 
      });
    }

    await req.prisma.plantSpecies.delete({
      where: { id }
    });

    res.json({ message: 'Plant species deleted successfully' });
  } catch (error) {
    console.error('Delete plant species error:', error);
    res.status(500).json({ error: 'Failed to delete plant species' });
  }
});

// Get plant care guide
router.get('/species/:id/care-guide', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const species = await req.prisma.plantSpecies.findUnique({
      where: { id }
    });

    if (!species) {
      return res.status(404).json({ error: 'Plant species not found' });
    }

    const careGuide = {
      species: {
        name: species.name,
        scientificName: species.scientificName,
        category: species.category
      },
      basicCare: {
        difficulty: species.careLevel || 'medium',
        sunlight: species.sunlight || 'partial',
        watering: species.watering || 'medium',
        soilType: species.soilType || 'well-draining'
      },
      timeline: {
        growthTime: species.growthTime || 60,
        harvestYield: species.harvestYield || 20
      },
      tips: [
        `This ${species.category} prefers ${species.sunlight || 'partial'} sunlight`,
        `Water when soil feels ${species.watering === 'low' ? 'dry' : species.watering === 'high' ? 'moist' : 'slightly dry'}`,
        `Expected to mature in ${species.growthTime || 60} days`,
        species.careLevel === 'easy' ? 'Great for beginners!' : 
        species.careLevel === 'hard' ? 'Requires experienced care' : 'Moderate care needed'
      ],
      warnings: [
        'Always check soil moisture before watering',
        'Ensure proper drainage to prevent root rot',
        'Monitor for pests and diseases regularly'
      ]
    };

    res.json(careGuide);
  } catch (error) {
    console.error('Get care guide error:', error);
    res.status(500).json({ error: 'Failed to fetch care guide' });
  }
});

export default router;
