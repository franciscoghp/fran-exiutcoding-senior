import { Test, TestingModule } from "@nestjs/testing";
import { MakesServiceUtils } from "./makes.service.utils";
import { ParsedVehicleTypes } from "./types/fetch-make-type.type";
import { ParsedMakesResponse } from "./types/fetch-makes.type";

describe("MakesServiceUtils", () => {
	let service: MakesServiceUtils;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [MakesServiceUtils],
		}).compile();

		service = module.get<MakesServiceUtils>(MakesServiceUtils);
	});

	describe("parseMakesXmlResponse", () => {
		it("parse makes XML response: not empty result", () => {
			const xml = `
			<Response xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
				<Count>3</Count>
				<Message>Response returned successfully</Message>
				<Results>
					<AllVehicleMakes>
						<Make_ID>4877</Make_ID>
						<Make_Name>1/OFF KUSTOMS, LLC</Make_Name>
					</AllVehicleMakes>
					<AllVehicleMakes>
						<Make_ID>11257</Make_ID>
						<Make_Name>102 IRONWORKS, INC.</Make_Name>
					</AllVehicleMakes>
					<AllVehicleMakes>
						<Make_ID>12255</Make_ID>
						<Make_Name>12832429 CANADA INC.</Make_Name>
					</AllVehicleMakes>
				</Results>
			</Response>
			`;
			const result = service.parseMakesXmlResponse(xml);
			expect(result).toEqual<ParsedMakesResponse>({
				count: 3,
				result: [
					{
						makeId: 4877,
						makeName: "1/OFF KUSTOMS, LLC",
					},
					{
						makeId: 11257,
						makeName: "102 IRONWORKS, INC.",
					},
					{
						makeId: 12255,
						makeName: "12832429 CANADA INC.",
					},
				],
			});
		});

		it("parse makes XML response: empty result", () => {
			const xml = `
			<Response xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
				<Count>0</Count>
				<Message>Response returned successfully</Message>
				<Results/>
			</Response>
			`;
			const result = service.parseMakesXmlResponse(xml);
			expect(result).toEqual<ParsedMakesResponse>({
				count: 0,
				result: [],
			});
		});

		it("parse makes XML response: invalid XML", () => {
			const xml = `403 Forbidden`;
			expect(() => service.parseMakesXmlResponse(xml)).toThrow();
		});
	});

	describe("parseVehicleTypesXmlResponse", () => {
		it("parse vehicle types XML response: not empty result", () => {
			const xml = `
			<Response xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
				<Count>2</Count>
				<Message>Response returned successfully</Message>
				<SearchCriteria>Make ID: 440</SearchCriteria>
				<Results>
					<VehicleTypesForMakeIds>
						<VehicleTypeId>2</VehicleTypeId>
						<VehicleTypeName>Passenger Car</VehicleTypeName>
					</VehicleTypesForMakeIds>
					<VehicleTypesForMakeIds>
						<VehicleTypeId>7</VehicleTypeId>
						<VehicleTypeName>Multipurpose Passenger Vehicle (MPV)</VehicleTypeName>
					</VehicleTypesForMakeIds>
				</Results>
			</Response>
			`;
			const result = service.parseVehicleTypesXmlResponse(xml);
			expect(result).toEqual<ParsedVehicleTypes>({
				count: 2,
				makeId: 440,
				result: [
					{
						typeId: 2,
						typeName: "Passenger Car",
					},
					{
						typeId: 7,
						typeName: "Multipurpose Passenger Vehicle (MPV)",
					},
				],
			});
		});

		it("parse vehicle types XML response: empty result", () => {
			const xml = `
			<Response xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
				<Count>0</Count>
				<Message>Response returned successfully</Message>
				<SearchCriteria>Make ID: 404</SearchCriteria>
				<Results/>
			</Response>
			`;
			const result = service.parseVehicleTypesXmlResponse(xml);
			expect(result).toEqual<ParsedVehicleTypes>({
				count: 0,
				makeId: 404,
				result: [],
			});
		});

		it("parse vehicle types XML response: invalid XML", () => {
			const xml = `403 Forbidden`;
			expect(() => service.parseVehicleTypesXmlResponse(xml)).toThrow();
		});
	});
});
