import { describe, afterEach, it, expect } from 'vitest';
import sinon from 'sinon';

import { SearchHistoryService } from '../../services/SearchHistoryService';
import { ISearchHistory } from '../../models/SearchHistory';

describe('SearchHistory Service', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('getOrCreateSearchHistory', () => {
    it('should return existing search history for user', async () => {
      const mockSearchHistory = {
        _id: 'test_history_id',
        userId: 'test_user_id',
        searchTerms: ['gaming laptop', 'macbook pro'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as unknown as ISearchHistory;

      sinon.stub(SearchHistoryService, 'getOrCreateSearchHistory').resolves(mockSearchHistory);

      const result = await SearchHistoryService.getOrCreateSearchHistory('test_user_id');

      expect(result).to.deep.equal(mockSearchHistory);
    });

    it('should create new search history for new user', async () => {
      const mockNewSearchHistory = {
        _id: 'new_history_id',
        userId: 'new_user_id',
        searchTerms: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as unknown as ISearchHistory;

      sinon.stub(SearchHistoryService, 'getOrCreateSearchHistory').resolves(mockNewSearchHistory);

      const result = await SearchHistoryService.getOrCreateSearchHistory('new_user_id');

      expect(result).to.deep.equal(mockNewSearchHistory);
    });

    it('should throw error for database failure', async () => {
      sinon.stub(SearchHistoryService, 'getOrCreateSearchHistory').throws(new Error('Database connection failed'));

      try {
        await SearchHistoryService.getOrCreateSearchHistory('test_user_id');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.equal('Database connection failed');
      }
    });
  });

  describe('addSearchTerm', () => {
    it('should add new search term to existing history', async () => {
      const mockUpdatedHistory = {
        _id: 'test_history_id',
        userId: 'test_user_id',
        searchTerms: ['gaming laptop', 'wireless headphones'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as unknown as ISearchHistory;

      sinon.stub(SearchHistoryService, 'addSearchTerm').resolves(mockUpdatedHistory);

      const result = await SearchHistoryService.addSearchTerm('test_user_id', 'wireless headphones');

      expect(result).to.deep.equal(mockUpdatedHistory);
    });

    it('should enforce 25 search term limit', async () => {
      const twentyFiveTerms = Array.from({ length: 25 }, (_, i) => `term ${i + 1}`);
      const mockLimitedHistory = {
        _id: 'test_history_id',
        userId: 'test_user_id',
        searchTerms: twentyFiveTerms,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as unknown as ISearchHistory;

      sinon.stub(SearchHistoryService, 'addSearchTerm').resolves(mockLimitedHistory);

      const result = await SearchHistoryService.addSearchTerm('test_user_id', 'new term');

      expect(result.searchTerms).to.have.lengthOf(25);
    });

    it('should throw error for database failure during add', async () => {
      sinon.stub(SearchHistoryService, 'addSearchTerm').throws(new Error('Failed to update search history'));

      try {
        await SearchHistoryService.addSearchTerm('test_user_id', 'test search');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.equal('Failed to update search history');
      }
    });
  });

  describe('getSearchHistory', () => {
    it('should return search terms array for existing user', async () => {
      const mockSearchTerms = ['gaming laptop', 'macbook pro', 'budget phones'];

      sinon.stub(SearchHistoryService, 'getSearchHistory').resolves(mockSearchTerms);

      const result = await SearchHistoryService.getSearchHistory('test_user_id');

      expect(result).to.deep.equal(mockSearchTerms);
    });

    it('should return empty array for user with no search history', async () => {
      sinon.stub(SearchHistoryService, 'getSearchHistory').resolves([]);

      const result = await SearchHistoryService.getSearchHistory('new_user_id');

      expect(result).to.deep.equal([]);
    });

    it('should throw error for database failure during get', async () => {
      sinon.stub(SearchHistoryService, 'getSearchHistory').throws(new Error('Database query failed'));

      try {
        await SearchHistoryService.getSearchHistory('test_user_id');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.equal('Database query failed');
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle special characters in search terms', async () => {
      const specialCharSearch = 'laptop $500-$1000 @BestBuy #deals 50% off!';
      const mockHistory = {
        _id: 'test_history_id',
        userId: 'test_user_id',
        searchTerms: [specialCharSearch],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as unknown as ISearchHistory;

      sinon.stub(SearchHistoryService, 'addSearchTerm').resolves(mockHistory);

      const result = await SearchHistoryService.addSearchTerm('test_user_id', specialCharSearch);

      expect(result.searchTerms[0]).to.equal(specialCharSearch);
    });

    it('should handle unicode characters in search terms', async () => {
      const unicodeSearch = 'ordinateur portable français 中文搜索';
      const mockHistory = {
        _id: 'test_history_id',
        userId: 'test_user_id',
        searchTerms: [unicodeSearch],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as unknown as ISearchHistory;

      sinon.stub(SearchHistoryService, 'addSearchTerm').resolves(mockHistory);

      const result = await SearchHistoryService.addSearchTerm('test_user_id', unicodeSearch);

      expect(result.searchTerms[0]).to.equal(unicodeSearch);
    });
  });
});
