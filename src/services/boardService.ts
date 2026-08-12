import { Board, ImageItem, SavedImage } from '../types';
import { dbService } from './db';
import { imageService } from './imageService';

export const boardService = {
  async getUserBoards(userId: string): Promise<Board[]> {
    const all = await dbService.getAll<Board>('boards');
    return all.filter((b) => b.userId === userId);
  },

  async getBoardById(id: string): Promise<Board | null> {
    return await dbService.getById<Board>('boards', id);
  },

  async createBoard(userId: string, name: string, description: string, isPrivate: boolean): Promise<Board> {
    const newBoard: Board = {
      id: 'board_' + Date.now(),
      userId,
      name: name.trim(),
      description: description.trim(),
      isPrivate,
      imageIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await dbService.put('boards', newBoard);
    return newBoard;
  },

  async updateBoard(id: string, updates: Partial<Board>): Promise<Board | null> {
    const existing = await dbService.getById<Board>('boards', id);
    if (!existing) return null;

    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await dbService.put('boards', updated);
    return updated;
  },

  async deleteBoard(id: string): Promise<void> {
    // Delete board record and associated saved_images entries
    const saved = await dbService.getAll<SavedImage>('saved_images');
    const toDelete = saved.filter((s) => s.boardId === id);
    for (const item of toDelete) {
      await dbService.delete('saved_images', item.id);
    }
    await dbService.delete('boards', id);
  },

  async saveImageToBoard(userId: string, imageId: string, boardId?: string): Promise<SavedImage> {
    const savedList = await dbService.getAll<SavedImage>('saved_images');
    const existing = savedList.find((s) => s.userId === userId && s.imageId === imageId && s.boardId === boardId);

    if (existing) {
      return existing;
    }

    const newSave: SavedImage = {
      id: 'save_' + Date.now(),
      userId,
      imageId,
      boardId,
      createdAt: new Date().toISOString(),
    };
    await dbService.put('saved_images', newSave);

    // If saved to a specific board, update board imageIds and cover
    if (boardId) {
      const board = await dbService.getById<Board>('boards', boardId);
      if (board) {
        if (!board.imageIds.includes(imageId)) {
          board.imageIds.push(imageId);
        }
        const img = await dbService.getById<ImageItem>('images', imageId);
        if (img && !board.coverImageUrl) {
          board.coverImageUrl = img.url;
        }
        board.updatedAt = new Date().toISOString();
        await dbService.put('boards', board);
      }
    }

    // Increment saves count on the image
    const img = await dbService.getById<ImageItem>('images', imageId);
    if (img) {
      img.savesCount += 1;
      await dbService.put('images', img);
    }

    return newSave;
  },

  async unsaveImage(userId: string, imageId: string, boardId?: string): Promise<void> {
    const savedList = await dbService.getAll<SavedImage>('saved_images');
    const target = savedList.find(
      (s) => s.userId === userId && s.imageId === imageId && (boardId ? s.boardId === boardId : true)
    );

    if (target) {
      await dbService.delete('saved_images', target.id);

      if (target.boardId) {
        const board = await dbService.getById<Board>('boards', target.boardId);
        if (board) {
          board.imageIds = board.imageIds.filter((id) => id !== imageId);
          await dbService.put('boards', board);
        }
      }

      const img = await dbService.getById<ImageItem>('images', imageId);
      if (img) {
        img.savesCount = Math.max(0, img.savesCount - 1);
        await dbService.put('images', img);
      }
    }
  },

  async isImageSavedByUser(userId: string, imageId: string): Promise<boolean> {
    const savedList = await dbService.getAll<SavedImage>('saved_images');
    return savedList.some((s) => s.userId === userId && s.imageId === imageId);
  },

  async getSavedImagesForUser(userId: string): Promise<ImageItem[]> {
    const savedList = await dbService.getAll<SavedImage>('saved_images');
    const userSaves = savedList.filter((s) => s.userId === userId);
    const imageIds = Array.from(new Set(userSaves.map((s) => s.imageId)));

    const allImages = await dbService.getAll<ImageItem>('images');
    return allImages.filter((img) => imageIds.includes(img.id) && img.status === 'published');
  },

  async getBoardImages(boardId: string): Promise<ImageItem[]> {
    const board = await dbService.getById<Board>('boards', boardId);
    if (!board) return [];

    const allImages = await dbService.getAll<ImageItem>('images');
    return allImages.filter((img) => board.imageIds.includes(img.id) && img.status === 'published');
  },
};
