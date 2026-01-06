export interface ProviderServiceEntity {
  id: string;
  providerId: string;
  serviceId: string;
  price: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

