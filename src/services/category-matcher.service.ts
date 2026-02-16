/**
 * Category matching utility for provider roles and service categories
 * 
 * This utility normalizes and matches provider roles with service categories
 * using a mapping table for predictable matching.
 */

/**
 * Normalize a string value (lowercase, trim)
 */
export function normalize(value: string): string {
  return value.toLowerCase().trim();
}

/**
 * Map provider role to normalized category
 * Maps provider roles (e.g., "Electrician") to service categories (e.g., "electrical")
 */
const roleToCategoryMap: Record<string, string> = {
  'electrician': 'electrical',
  'plumber': 'plumbing',
  'cleaner': 'cleaning',
  'carpenter': 'carpentry',
  'painter': 'painting',
  'hvac technician': 'hvac',
  'appliance repair technician': 'appliance repair',
  'gardener/landscaper': 'gardening',
  'pest control specialist': 'pest control',
  'water tank cleaner': 'water tank cleaning',
};

/**
 * Map service category/name to normalized category
 * Maps service names (e.g., "Electrical") to normalized categories (e.g., "electrical")
 */
const serviceToCategoryMap: Record<string, string> = {
  'electrical': 'electrical',
  'plumbing': 'plumbing',
  'cleaning': 'cleaning',
  'carpentry': 'carpentry',
  'painting': 'painting',
  'hvac': 'hvac',
  'appliance repair': 'appliance repair',
  'gardening': 'gardening',
  'pest control': 'pest control',
  'water tank cleaning': 'water tank cleaning',
};

/**
 * Get normalized category from provider role
 */
export function getCategoryFromRole(role: string): string | null {
  const normalizedRole = normalize(role);
  return roleToCategoryMap[normalizedRole] || null;
}

/**
 * Get normalized category from service name
 */
export function getCategoryFromService(serviceName: string): string | null {
  const normalizedService = normalize(serviceName);
  return serviceToCategoryMap[normalizedService] || normalizedService;
}

/**
 * Check if provider role matches service category
 * 
 * @param providerRole - Provider's verified role (e.g., "Electrician")
 * @param serviceCategory - Service category/name (e.g., "Electrical")
 * @returns true if they match, false otherwise
 */
export function isCategoryMatch(providerRole: string, serviceCategory: string): boolean {
  if (!providerRole || !serviceCategory) {
    return false;
  }

  const roleCategory = getCategoryFromRole(providerRole);
  const serviceCategoryNormalized = getCategoryFromService(serviceCategory);

  // If role doesn't map to a category, return false
  if (!roleCategory) {
    return false;
  }

  // Compare normalized categories
  return roleCategory === serviceCategoryNormalized;
}
