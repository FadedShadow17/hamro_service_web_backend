


export function normalize(value: string): string {
  return value.toLowerCase().trim();
}


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


export function getCategoryFromRole(role: string): string | null {
  const normalizedRole = normalize(role);
  return roleToCategoryMap[normalizedRole] || null;
}


export function getCategoryFromService(serviceName: string): string | null {
  const normalizedService = normalize(serviceName);

  if (serviceToCategoryMap[normalizedService]) {
    return serviceToCategoryMap[normalizedService];
  }

  for (const [category, normalizedCategory] of Object.entries(serviceToCategoryMap)) {
    if (normalizedService.includes(category) || category.includes(normalizedService)) {
      return normalizedCategory;
    }
  }

  const variations: Record<string, string> = {
    'electrical': 'electrical',
    'electric': 'electrical',
    'plumbing': 'plumbing',
    'plumber': 'plumbing',
    'cleaning': 'cleaning',
    'cleaner': 'cleaning',
    'carpentry': 'carpentry',
    'carpenter': 'carpentry',
    'painting': 'painting',
    'painter': 'painting',
    'hvac': 'hvac',
    'heating': 'hvac',
    'cooling': 'hvac',
    'appliance': 'appliance repair',
    'repair': 'appliance repair',
    'gardening': 'gardening',
    'gardener': 'gardening',
    'landscaping': 'gardening',
    'pest': 'pest control',
    'water tank': 'water tank cleaning',
  };
  
  for (const [keyword, category] of Object.entries(variations)) {
    if (normalizedService.includes(keyword)) {
      return category;
    }
  }

  return normalizedService;
}


export function isCategoryMatch(providerRole: string, serviceCategory: string): boolean {
  if (!providerRole || !serviceCategory) {
    return false;
  }

  const roleCategory = getCategoryFromRole(providerRole);
  const serviceCategoryNormalized = getCategoryFromService(serviceCategory);

  if (!roleCategory) {
    return false;
  }

  return roleCategory === serviceCategoryNormalized;
}
