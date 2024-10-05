export interface ResponseMake {
	Make_ID: number;
	Make_Name: string;
}

export interface MakesResponse {
	Response: {
		Count: number;
		Message: string;
		Results: {
			AllVehicleMakes: ResponseMake[];
		};
	};
}

export interface ParsedMake {
	makeId: number;
	makeName: string;
}

export interface ParsedMakesResponse {
	count: number;
	result: ParsedMake[];
}
