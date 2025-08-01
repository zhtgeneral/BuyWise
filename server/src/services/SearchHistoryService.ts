import SearchHistory, { ISearchHistory } from "../models/SearchHistory";

const MAX_ITEMS = 25;

export class SearchHistoryService {
  /**
   * Get existing search history or create new document for user
   */
  static async getOrCreateSearchHistory(
    userId: string
  ): Promise<ISearchHistory> {
    try {
      let searchHistory = await SearchHistory.findOne({ userId });
      if (!searchHistory) {
        searchHistory = new SearchHistory({
          userId,
          searchTerms: [],
        });
        await searchHistory.save();
        console.log(`Created new search history for user: ${userId}`);
      }

      return searchHistory;
    } catch (error) {
      console.error("Error getting or creating search history:", error);
      throw error;
    }
  }

  /**
   * Add a search term to user's history, maintaining a max (first in, first out)
   */
  static async addSearchTerm(
    userId: string,
    searchTerm: string
  ): Promise<ISearchHistory> {
    try {
      const searchHistory = await this.getOrCreateSearchHistory(userId);
      searchHistory.searchTerms.push(searchTerm);

      // Maintain maximum of so and so search terms
      if (searchHistory.searchTerms.length > MAX_ITEMS) {
        searchHistory.searchTerms.shift();
      }

      await searchHistory.save();

      console.log(
        `Added search term "${searchTerm}" for user: ${userId}. Total terms: ${searchHistory.searchTerms.length}`
      );

      return searchHistory;
    } catch (error) {
      console.error("Error adding search term:", error);
      throw error;
    }
  }

  /**
   * Get user's search history array
   */
  static async getSearchHistory(userId: string): Promise<string[]> {
    try {
      const searchHistory = await SearchHistory.findOne({ userId });

      if (!searchHistory) {
        return [];
      }

      return searchHistory.searchTerms;
    } catch (error) {
      console.error("Error getting search history:", error);
      throw error;
    }
  }
}
