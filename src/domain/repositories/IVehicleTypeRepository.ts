import { VehicleType } from '../entities/VehicleType';

export interface IVehicleTypeRepository {
  findAll(): Promise<VehicleType[]>;
  findById(id: string): Promise<VehicleType | null>;
  create(vehicleType: VehicleType): Promise<VehicleType>;
  update(vehicleType: VehicleType): Promise<VehicleType>;
  delete(id: string): Promise<void>;
}