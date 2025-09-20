import { ServiceType } from '../entities/ServiceType';

export interface IServiceTypeRepository {
  findAll(): Promise<ServiceType[]>;
  findById(id: string): Promise<ServiceType | null>;
  findByCategory(category: string): Promise<ServiceType[]>;
  create(serviceType: ServiceType): Promise<ServiceType>;
  update(serviceType: ServiceType): Promise<ServiceType>;
  delete(id: string): Promise<void>;
}