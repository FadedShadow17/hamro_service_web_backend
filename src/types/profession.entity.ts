export interface ProfessionEntity {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}
