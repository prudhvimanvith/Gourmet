import { Request, Response } from 'express';
import { recipeService } from '../services/recipe.service';

export class RecipeController {

    // POST /api/v1/items
    async createItem(req: Request, res: Response) {
        try {
            // Validate body...
            const id = await recipeService.createItem(req.body);
            res.status(201).json({ id, message: 'Item created' });
        } catch (error: any) {
            console.error('Create item error:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // PUT /api/v1/items/:itemId
    async updateItem(req: Request, res: Response) {
        try {
            await recipeService.updateItem(req.params.itemId, req.body);
            res.json({ message: 'Item updated' });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // POST /api/v1/recipes
    async createRecipe(req: Request, res: Response) {
        try {
            const id = await recipeService.createRecipe(req.body);
            res.status(201).json({ id, message: 'Recipe created' });
        } catch (error: any) {
            console.error('Create recipe error:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // GET /api/v1/items
    async listItems(req: Request, res: Response) {
        try {
            const items = await recipeService.getItems();
            res.json(items);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch items' });
        }
    }

    // GET /api/v1/recipes/:itemId
    async getRecipe(req: Request, res: Response) {
        try {
            const recipe = await recipeService.getRecipeDetails(req.params.itemId);
            if (!recipe) {
                res.status(404).json({ error: 'Recipe not found' });
                return;
            }
            res.json(recipe);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // DELETE /api/v1/recipes/:itemId
    async deleteRecipe(req: Request, res: Response) {
        try {
            await recipeService.deleteRecipe(req.params.itemId);
            res.json({ message: 'Recipe deleted' });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // PUT /api/v1/recipes/:itemId
    async updateRecipe(req: Request, res: Response) {
        try {
            await recipeService.updateRecipe(req.params.itemId, req.body);
            res.json({ message: 'Recipe updated' });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}

export const recipeController = new RecipeController();
