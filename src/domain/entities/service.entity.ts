export interface ServiceEntity {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  basePrice: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

