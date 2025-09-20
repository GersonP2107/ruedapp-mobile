import { Vehicle } from '../entities/Vehicle';

export interface IVehicleRepository {
  create(vehicle: Vehicle): Promise<Vehicle>;
  findById(id: string): Promise<Vehicle | null>;
  findByUserId(userId: string): Promise<Vehicle[]>;
  findByLicensePlate(licensePlate: string): Promise<Vehicle | null>;
  update(vehicle: Vehicle): Promise<Vehicle>;
  delete(id: string): Promise<void>;
}