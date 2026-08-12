import { ImageItem } from '../types';
import { dbService } from './db';
import { storageService } from './storageService';

export const searchService = {
  async searchImages(query: string, category?: string, tag?: string): Promise<{ results: ImageItem[]; totalCount: number }> {
    const allImages = await dbService.getAll<ImageItem>('images');

    let filtered = allImages.filter((img) => img.status === 'published' && img.privacy === 'public');

    const cleanQuery = query.toLowerCase().trim();

    if (cleanQuery) {
      storageService.addRecentSearch(cleanQuery);

      filtered = filtered.filter((img) => {
        const titleMatch = img.title.toLowerCase().includes(cleanQuery);
        const descMatch = img.description.toLowerCase().includes(cleanQuery);
        const creatorMatch =
          img.creator.displayName.toLowerCase().includes(cleanQuery) ||
          img.creator.username.toLowerCase().includes(cleanQuery);
        const tagMatch = img.tags.some((t) => t.toLowerCase().includes(cleanQuery));
        const catMatch = img.category.toLowerCase().includes(cleanQuery);

        return titleMatch || descMatch || creatorMatch || tagMatch || catMatch;
      });
    }

    if (category && category.toLowerCase() !== 'all') {
      filtered = filtered.filter((img) => img.category.toLowerCase() === category.toLowerCase());
    }

    if (tag) {
      filtered = filtered.filter((img) =>
        img.tags.map((t) => t.toLowerCase()).includes(tag.toLowerCase())
      );
    }

    return {
      results: filtered,
      totalCount: filtered.length,
    };
  },

  async getSearchSuggestions(query: string): Promise<string[]> {
    if (!query.trim()) return [];
    const allImages = await dbService.getAll<ImageItem>('images');
    const qLower = query.toLowerCase().trim();

    const tagSuggestions = new Set<string>();
    const titleSuggestions = new Set<string>();

    for (const img of allImages) {
      if (img.title.toLowerCase().includes(qLower)) {
        titleSuggestions.add(img.title);
      }
      for (const t of img.tags) {
        if (t.toLowerCase().includes(qLower)) {
          tagSuggestions.add(t);
        }
      }
    }

    return [...Array.from(tagSuggestions), ...Array.from(titleSuggestions)].slice(0, 6);
  },
};
