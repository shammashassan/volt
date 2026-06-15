import { createParser, parseAsString, parseAsBoolean } from 'nuqs'
import { ResourceType, ResourceStatus } from './types'
import { RESOURCE_TYPES, STATUS_OPTIONS, getResourceTypeInfo } from './resource-types'

const validTypes = RESOURCE_TYPES.map(t => t.value)
export const parseResourceType = createParser({
  parse: (value) => {
    return validTypes.includes(value as ResourceType) ? (value as ResourceType) : null
  },
  serialize: (value) => value
})

const validStatuses = STATUS_OPTIONS.map(s => s.value)
export const parseResourceStatus = createParser({
  parse: (value) => {
    return validStatuses.includes(value as ResourceStatus) ? (value as ResourceStatus) : null
  },
  serialize: (value) => value
})

export const parseResourceFavorite = parseAsBoolean
export const parseSearchQuery = parseAsString

// Centralized export for useQueryStates
export const resourceFilterParsers = {
  type: parseResourceType,
  status: parseResourceStatus,
  favorite: parseResourceFavorite,
  q: parseSearchQuery,
}

export interface ResourceFilters {
  type?: string | null
  status?: string | null
  favorite?: boolean
  q?: string | null
}

export function getResourcesPageTitle(filters: ResourceFilters): string {
  const parts: string[] = []
  
  if (filters.favorite) {
    parts.push("Starred")
  }
  
  if (filters.type) {
    const config = getResourceTypeInfo(filters.type)
    if (config) {
      parts.push(config.label)
    }
  }
  
  if (parts.length === 0) {
    return "Resources Library"
  }
  
  return `${parts.join(" ")} Resources`
}
