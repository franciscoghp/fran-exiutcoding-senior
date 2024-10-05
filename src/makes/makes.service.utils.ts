import { Injectable } from "@nestjs/common";
import { XMLParser, XMLValidator } from "fast-xml-parser";
import type { ResponseVehicleType, VehicleTypesResponse } from "./types/fetch-make-type.type";
import { ParsedVehicleType, ParsedVehicleTypes } from "./types/fetch-make-type.type";
import type { MakesResponse, ParsedMake, ResponseMake } from "./types/fetch-makes.type";
import { ParsedMakesResponse } from "./types/fetch-makes.type";
import { MakeDto, VehicleTypeDto } from "./types/make.dto";

@Injectable()
export class MakesServiceUtils {
	public parseMakesXmlResponse(xml: string): ParsedMakesResponse {
		const validationResult = XMLValidator.validate(xml);
		if (typeof validationResult !== "boolean") {
			throw new Error("Unable to validate XML with makes response:\n" + validationResult.err.msg);
		}

		const parser = new XMLParser();
		const json = parser.parse(xml);
		if (!this.isMakesResponse(json)) {
			throw new Error("XML does not fulfills makes response requirements\n" + json);
		}

		return {
			count: json.Response.Count,
			result: json.Response.Results.AllVehicleMakes.filter(this.isResponseMake).map(this.responseMakeToParsedMake),
		};
	}

	public parseVehicleTypesXmlResponse(xml: string): ParsedVehicleTypes {
		const validationResult = XMLValidator.validate(xml);
		if (typeof validationResult !== "boolean") {
			throw new Error("Unable to validate XML with make types:\n" + validationResult.err.msg);
		}

		const parser = new XMLParser();
		const json = parser.parse(xml);
		if (!this.isVehicleTypesResponse(json)) {
			throw new Error("XML does not fulfills make types requirements\n" + json);
		}

		const vehicleTypes = json.Response.Results.VehicleTypesForMakeIds;
		const parsingResult: ParsedVehicleTypes = {
			count: json.Response.Count,
			makeId: parseInt(json.Response.SearchCriteria.split(":")[1].trim(), 10),
			result: [],
		};

		if (Array.isArray(vehicleTypes)) {
			parsingResult.result = vehicleTypes.filter(this.isResponseMakeType).map(this.responseVehicleTypesToParsedVehicleType);

			return parsingResult;
		}

		if (!this.isResponseMakeType(vehicleTypes)) {
			throw new Error("XML does not fulfills make types requirements\n" + vehicleTypes);
		}

		parsingResult.result = [this.responseVehicleTypesToParsedVehicleType(vehicleTypes)];

		return parsingResult;
	}

	public combineMakesWithTypes(make: ParsedMake, types: ParsedVehicleType[]): MakeDto {
		return {
			makeId: make.makeId,
			makeName: make.makeName,
			vehicleTypes: types.map(this.parsedVehicleTypeToVehicleTypeDto),
		};
	}

	private isMakesResponse(obj: unknown): obj is MakesResponse {
		if (typeof obj !== "object" || obj === null) {
			return false;
		}

		if (!("Response" in obj && typeof obj["Response"] === "object" && obj["Response"] !== null)) {
			return false;
		}

		if (
			!("Count" in obj["Response"] && typeof obj["Response"]["Count"] === "number") ||
			!("Message" in obj["Response"] && typeof obj["Response"]["Message"] === "string") ||
			!(
				"Results" in obj["Response"] &&
				(typeof obj["Response"]["Results"] === "object" || typeof obj["Response"]["Results"] === "string") &&
				obj["Response"]["Results"] !== null
			)
		) {
			return false;
		}

		if (typeof obj["Response"]["Results"] === "string") {
			obj["Response"]["Results"] = {
				AllVehicleMakes: [],
			};
			return true;
		}

		return "AllVehicleMakes" in obj["Response"]["Results"] && Array.isArray(obj["Response"]["Results"]["AllVehicleMakes"]);
	}

	private isVehicleTypesResponse(obj: unknown): obj is VehicleTypesResponse {
		if (typeof obj !== "object" || obj === null) {
			return false;
		}

		if (!("Response" in obj && typeof obj["Response"] === "object" && obj["Response"] !== null)) {
			return false;
		}

		if (
			!("Count" in obj["Response"] && typeof obj["Response"]["Count"] === "number") ||
			!("Message" in obj["Response"] && typeof obj["Response"]["Message"] === "string") ||
			!("SearchCriteria" in obj["Response"] && typeof obj["Response"]["SearchCriteria"] === "string") ||
			!(
				"Results" in obj["Response"] &&
				(typeof obj["Response"]["Results"] === "object" || typeof obj["Response"]["Results"] === "string") &&
				obj["Response"]["Results"] !== null
			)
		) {
			return false;
		}

		if (typeof obj["Response"]["Results"] === "string") {
			obj["Response"]["Results"] = {
				VehicleTypesForMakeIds: [],
			};
			return true;
		}

		if (!("VehicleTypesForMakeIds" in obj["Response"]["Results"])) {
			return false;
		}

		return (
			Array.isArray(obj["Response"]["Results"]["VehicleTypesForMakeIds"]) ||
			typeof obj["Response"]["Results"]["VehicleTypesForMakeIds"] === "object"
		);
	}

	private isResponseMake(obj: unknown): obj is ResponseMake {
		if (typeof obj !== "object" || obj === null) {
			return false;
		}

		return "Make_ID" in obj && typeof obj["Make_ID"] === "number" && "Make_Name" in obj && typeof obj["Make_Name"] === "string";
	}

	private isResponseMakeType(obj: unknown): obj is ResponseVehicleType {
		if (typeof obj !== "object" || obj === null) {
			return false;
		}

		return (
			"VehicleTypeId" in obj &&
			typeof obj["VehicleTypeId"] === "number" &&
			"VehicleTypeName" in obj &&
			typeof obj["VehicleTypeName"] === "string"
		);
	}

	private responseMakeToParsedMake(make: ResponseMake): ParsedMake {
		return {
			makeId: make.Make_ID,
			makeName: make.Make_Name,
		};
	}

	private responseVehicleTypesToParsedVehicleType(type: ResponseVehicleType): ParsedVehicleType {
		return {
			typeId: type.VehicleTypeId,
			typeName: type.VehicleTypeName,
		};
	}

	private parsedVehicleTypeToVehicleTypeDto(type: ParsedVehicleType): VehicleTypeDto {
		return {
			typeId: type.typeId,
			typeName: type.typeName,
		};
	}
}
