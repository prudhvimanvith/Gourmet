import { Router } from 'express';
import { inventoryController } from '../controllers/inventory.controller';
import { recipeController } from '../controllers/recipe.controller';
import { analyticsController } from '../controllers/analytics.controller';

const router = Router();

// Inventory Routes
router.post('/orders', (req, res) => inventoryController.processOrder(req, res));
router.post('/prep', (req, res) => inventoryController.recordPrep(req, res));
router.post('/inventory/adjust', (req, res) => inventoryController.adjustStock(req, res));
router.get('/inventory/:itemId', (req, res) => inventoryController.getStock(req, res));

// Recipe Routes
router.post('/items', (req, res) => recipeController.createItem(req, res));
router.get('/items', (req, res) => recipeController.listItems(req, res));
router.put('/items/:itemId', (req, res) => recipeController.updateItem(req, res)); // New Update Item Endpoint (Needs Controller Method)
router.post('/recipes', (req, res) => recipeController.createRecipe(req, res));
router.get('/recipes/:itemId', (req, res) => recipeController.getRecipe(req, res));
router.delete('/recipes/:itemId', (req, res) => recipeController.deleteRecipe(req, res)); // Deletes Items too
router.put('/recipes/:itemId', (req, res) => recipeController.updateRecipe(req, res));

// Analytics Routes
router.get('/analytics/dashboard', (req, res) => analyticsController.getDashboardStats(req, res));

export default router;
