export interface ResponseVehicleType {
	VehicleTypeId: number;
	VehicleTypeName: string;
}

export interface VehicleTypesResponse {
	Response: {
		Count: number;
		Message: string;
		SearchCriteria: string;
		Results: {
			VehicleTypesForMakeIds: ResponseVehicleType | ResponseVehicleType[];
		};
	};
}

export interface ParsedVehicleType {
	typeId: number;
	typeName: string;
}

export interface ParsedVehicleTypes {
	count: number;
	makeId: number;
	result: ParsedVehicleType[];
}
