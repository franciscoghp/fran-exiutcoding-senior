export interface VehicleTypeDto {
	typeId: number;
	typeName: string;
}

export interface MakeDto {
	makeId: number;
	makeName: string;
	vehicleTypes: VehicleTypeDto[];
}
