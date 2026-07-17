import { apiClient } from '@/lib/apiClient';
import type { ApiResponse } from '@/types/api';
import type { SearchResultItem } from '@/features/search/types/search.types';

export const searchApi = {
  search: async (q: string): Promise<SearchResultItem[]> => {
    const { data } = await apiClient.get<ApiResponse<SearchResultItem[]>>('/search', { params: { q } });
    return data.data;
  },
};
