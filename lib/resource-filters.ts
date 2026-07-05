import { createParser, parseAsString, parseAsBoolean } from 'nuqs'
import { ResourceType, ResourceStatus, Category } from '@/types'
import { RESOURCE_TYPES, STATUS_OPTIONS, getResourceTypeInfo } from '@/components/resources/resource-types'

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
export const parseResourceCategory = parseAsString

// Centralized export for useQueryStates
export const resourceFilterParsers = {
  type: parseResourceType,
  status: parseResourceStatus,
  favorite: parseResourceFavorite,
  q: parseSearchQuery,
  category: parseResourceCategory,
}

export interface ResourceFilters {
  type?: ResourceType | null
  status?: ResourceStatus | null
  favorite?: boolean
  q?: string | null
  category?: string | null
}

export function getResourcesPageTitle(filters: ResourceFilters, categories?: Category[]): string {
  const parts: string[] = []
  
  if (filters.status) {
    const statusOpt = STATUS_OPTIONS.find(s => s.value === filters.status)
    if (statusOpt) {
      parts.push(statusOpt.label)
    }
  }
  
  if (filters.favorite) {
    parts.push("Starred")
  }
  
  if (filters.category) {
    if (filters.category === "none") {
      parts.push("Uncategorized")
    } else if (categories) {
      const category = categories.find(
        c => c.id === filters.category || c._id?.toString() === filters.category
      )
      if (category) {
        parts.push(category.name)
      }
    }
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
