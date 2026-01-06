export interface ServiceEntity {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  image?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

