import { Service } from '../entities/Service';

export interface IServiceRepository {
  create(service: Service): Promise<Service>;
  findById(id: string): Promise<Service | null>;
  findByVehicleId(vehicleId: string): Promise<Service[]>;
  update(service: Service): Promise<Service>;
  delete(id: string): Promise<void>;
}