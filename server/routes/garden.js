import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get user's gardens
router.get('/', authenticateToken, async (req, res) => {
  try {
    const gardens = await req.prisma.garden.findMany({
      where: { userId: req.user.id },
      include: {
        plants: {
          include: {
            species: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    res.json(gardens);
  } catch (error) {
    console.error('Get gardens error:', error);
    res.status(500).json({ error: 'Failed to fetch gardens' });
  }
});

// Create new garden
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Garden name is required' });
    }

    const garden = await req.prisma.garden.create({
      data: {
        name,
        description,
        userId: req.user.id
      },
      include: {
        plants: {
          include: {
            species: true
          }
        }
      }
    });

    res.status(201).json(garden);
  } catch (error) {
    console.error('Create garden error:', error);
    res.status(500).json({ error: 'Failed to create garden' });
  }
});

// Get specific garden
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const garden = await req.prisma.garden.findFirst({
      where: {
        id,
        userId: req.user.id
      },
      include: {
        plants: {
          include: {
            species: true
          }
        }
      }
    });

    if (!garden) {
      return res.status(404).json({ error: 'Garden not found' });
    }

    res.json(garden);
  } catch (error) {
    console.error('Get garden error:', error);
    res.status(500).json({ error: 'Failed to fetch garden' });
  }
});

// Update garden
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, layoutData, imageUrl, width, height } = req.body;

    const garden = await req.prisma.garden.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!garden) {
      return res.status(404).json({ error: 'Garden not found' });
    }

    const updatedGarden = await req.prisma.garden.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(layoutData && { layoutData }),
        ...(imageUrl && { imageUrl }),
        ...(width && { width }),
        ...(height && { height })
      },
      include: {
        plants: {
          include: {
            species: true
          }
        }
      }
    });

    res.json(updatedGarden);
  } catch (error) {
    console.error('Update garden error:', error);
    res.status(500).json({ error: 'Failed to update garden' });
  }
});

// Delete garden
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const garden = await req.prisma.garden.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!garden) {
      return res.status(404).json({ error: 'Garden not found' });
    }

    await req.prisma.garden.delete({
      where: { id }
    });

    res.json({ message: 'Garden deleted successfully' });
  } catch (error) {
    console.error('Delete garden error:', error);
    res.status(500).json({ error: 'Failed to delete garden' });
  }
});

// Add plant to garden
router.post('/plants', authenticateToken, async (req, res) => {
  try {
    const { gardenId, speciesId, x, y, z = 0 } = req.body;

    if (!gardenId || !speciesId || x === undefined || y === undefined) {
      return res.status(400).json({ 
        error: 'Garden ID, species ID, and position (x, y) are required' 
      });
    }

    // Verify garden belongs to user
    const garden = await req.prisma.garden.findFirst({
      where: {
        id: gardenId,
        userId: req.user.id
      }
    });

    if (!garden) {
      return res.status(404).json({ error: 'Garden not found' });
    }

    // Verify species exists
    const species = await req.prisma.plantSpecies.findUnique({
      where: { id: speciesId }
    });

    if (!species) {
      return res.status(404).json({ error: 'Plant species not found' });
    }

    const plant = await req.prisma.plantInstance.create({
      data: {
        gardenId,
        speciesId,
        x,
        y,
        z
      },
      include: {
        species: true
      }
    });

    // Update garden plant count
    await req.prisma.garden.update({
      where: { id: gardenId },
      data: {
        plantsCount: {
          increment: 1
        }
      }
    });

    res.status(201).json(plant);
  } catch (error) {
    console.error('Add plant error:', error);
    res.status(500).json({ error: 'Failed to add plant to garden' });
  }
});

// Water plant
router.post('/plants/:plantId/water', authenticateToken, async (req, res) => {
  try {
    const { plantId } = req.params;

    const plant = await req.prisma.plantInstance.findFirst({
      where: {
        id: plantId,
        garden: {
          userId: req.user.id
        }
      }
    });

    if (!plant) {
      return res.status(404).json({ error: 'Plant not found' });
    }

    const updatedPlant = await req.prisma.plantInstance.update({
      where: { id: plantId },
      data: {
        waterLevel: Math.min(100, plant.waterLevel + 30),
        health: Math.min(100, plant.health + 5),
        lastWatered: new Date()
      },
      include: {
        species: true
      }
    });

    // Award coins and experience
    await req.prisma.user.update({
      where: { id: req.user.id },
      data: {
        coins: { increment: 5 },
        experience: { increment: 10 }
      }
    });

    res.json(updatedPlant);
  } catch (error) {
    console.error('Water plant error:', error);
    res.status(500).json({ error: 'Failed to water plant' });
  }
});

// Harvest plant
router.post('/plants/:plantId/harvest', authenticateToken, async (req, res) => {
  try {
    const { plantId } = req.params;

    const plant = await req.prisma.plantInstance.findFirst({
      where: {
        id: plantId,
        garden: {
          userId: req.user.id
        }
      },
      include: {
        species: true
      }
    });

    if (!plant) {
      return res.status(404).json({ error: 'Plant not found' });
    }

    if (plant.growthStage < 80) {
      return res.status(400).json({ error: 'Plant is not ready for harvest' });
    }

    const coinsEarned = plant.species.harvestYield || 20;
    const experienceEarned = plant.species.harvestYield || 25;

    const updatedPlant = await req.prisma.plantInstance.update({
      where: { id: plantId },
      data: {
        growthStage: 20, // Reset growth after harvest
        lastHarvested: new Date()
      },
      include: {
        species: true
      }
    });

    // Award coins and experience
    await req.prisma.user.update({
      where: { id: req.user.id },
      data: {
        coins: { increment: coinsEarned },
        experience: { increment: experienceEarned }
      }
    });

    res.json({
      ...updatedPlant,
      reward: {
        coins: coinsEarned,
        experience: experienceEarned
      }
    });
  } catch (error) {
    console.error('Harvest plant error:', error);
    res.status(500).json({ error: 'Failed to harvest plant' });
  }
});

// Remove plant from garden
router.delete('/plants/:plantId', authenticateToken, async (req, res) => {
  try {
    const { plantId } = req.params;

    const plant = await req.prisma.plantInstance.findFirst({
      where: {
        id: plantId,
        garden: {
          userId: req.user.id
        }
      }
    });

    if (!plant) {
      return res.status(404).json({ error: 'Plant not found' });
    }

    await req.prisma.plantInstance.delete({
      where: { id: plantId }
    });

    // Update garden plant count
    await req.prisma.garden.update({
      where: { id: plant.gardenId },
      data: {
        plantsCount: {
          decrement: 1
        }
      }
    });

    res.json({ message: 'Plant removed successfully' });
  } catch (error) {
    console.error('Remove plant error:', error);
    res.status(500).json({ error: 'Failed to remove plant' });
  }
});

export default router;
