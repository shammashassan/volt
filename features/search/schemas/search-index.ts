import { BaseDocument } from '@/features/shared/types';

export interface SearchIndexEntry extends BaseDocument {
  title: string;
  description?: string;
  entityType: 'note' | 'project' | 'resource' | 'reminder' | 'watchlist' | 'person';
  entityId: string;
  searchVersion: number;
}
