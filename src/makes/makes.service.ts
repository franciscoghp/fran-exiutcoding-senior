import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";
import { DatabaseService } from "../database/database.service";
import { UtilsService } from "../utils/utils.service";
import { MakesServiceUtils } from "./makes.service.utils";
import type { ParsedMake, ParsedMakesResponse } from "./types/fetch-makes.type";
import { MakeDto } from "./types/make.dto";
import { PaginationInput } from "./types/paginationInput.type";
import { Cron, CronExpression } from "@nestjs/schedule";

@Injectable()
export class MakesService {
	constructor(
		private readonly configService: ConfigService,
		private readonly databaseService: DatabaseService,
		private readonly makeServiceUtils: MakesServiceUtils,
		private readonly utilsService: UtilsService
	) {
	}

	@Cron(CronExpression.EVERY_30_MINUTES_BETWEEN_9AM_AND_5PM)
	async handleCron() {
		try {
			console.log("[Cron]: Fetching makes...");
			const res = await this.getMakes( { skip: 0,  take: 10 } ,true);
			console.log(`[Cron]: Successfully fetched ${res.total} makes!`);
		} catch (error) {
			console.error("[Cron]: Error during fetching makes\n" + error);
		}
	}
	
    public async getMakes(paginationInput?: PaginationInput, actualize?: boolean): Promise<{ total: number, items: MakeDto[] }> {
        const lastActualizationAt = await this.databaseService.actualization.findFirst({
            select: { date: true },
            orderBy: { date: 'desc' },
        });
    
        if (!actualize && lastActualizationAt && lastActualizationAt.date.getDate() === new Date().getDate()) {
            const { total, items } = await this.getMakesFromDb(paginationInput);
            return { total, items };
        }

        const makesResponse = await this.fetchMakes();
        const items = await this.getVehiclesTypes(makesResponse.result);
        return { total: items.length, items };
    }

    public async getMakesFromDb(paginationInput?: PaginationInput): Promise<{ total: number, items: MakeDto[] }> {
        const total = await this.databaseService.make.count(); // Contamos todos los registros

        const items = await this.databaseService.make.findMany({
            skip: paginationInput?.skip ?? 0,
            take: paginationInput?.take ?? 10,
            select: {
                makeId: true,
                makeName: true,
                vehicleTypes: {
                    select: {
                        typeId: true,
                        typeName: true,
                    },
                },
            },
        });

        return { total, items };
    }

	private async fetchMakes(): Promise<ParsedMakesResponse> {
		const res = await axios.get<string>("https://vpic.nhtsa.dot.gov/api/vehicles/getallmakes?format=XML");
		if (res.status !== 200) {
			throw new Error("Unable to fetch makes from NHTSA API\n" + res.statusText);
		}

		return this.makeServiceUtils.parseMakesXmlResponse(res.data);
	}

	private async getVehiclesTypes(makes: ParsedMake[]): Promise<MakeDto[]> {
		const makesResponses: MakeDto[] = [];
		console.log('makes.length', makes.length)
		console.log('this.configService.get("MAKES_API_CHUNK_SIZE")', this.configService.get("MAKES_API_CHUNK_SIZE"))
		const chunks = this.utilsService.createChunks(makes, this.configService.get("MAKES_API_CHUNK_SIZE") ?? 1000);
		console.log('chunks?.length', chunks?.length)
		// console.log('chunks', chunks)
		let count = 0
		let countRejected = 0
		let countGuardado = 0
		let countMake = 0
		for (const chunk of chunks) {
			console.log('chunk.lenght', chunk.length)
			const fetchResponse = await Promise.allSettled(
				chunk.map(make => axios.get<string>(`https://vpic.nhtsa.dot.gov/api/vehicles/GetVehicleTypesForMakeId/${make.makeId}?format=XML`))
			);

			console.log('deberia haber 1000 aqui: fetchResponse.length', fetchResponse.length)
			for (const response of fetchResponse) {
				if (response.status === "rejected") {
					countRejected =  countRejected + 1
					count =  count + 1
					console.log('count procesado', count, ' rejected', countRejected)
					// better handling, e.g. retrying or logging
					continue;
				}

				const parsedVehicleTypes = this.makeServiceUtils.parseVehicleTypesXmlResponse(response.value.data);
				const make = chunk.find(make => make.makeId === parsedVehicleTypes.makeId);
				if (!make) {
					countMake =  countMake + 1
					count =  count + 1
					console.log('count procesado', count, ' !make', countMake)
					console.log()
					// make from response id not found in chunk, API mistake, because we are fetching only makes from chunk
					// better handling, e.g. logging
					continue;
				}

				const makeDto = this.makeServiceUtils.combineMakesWithTypes(make, parsedVehicleTypes.result);
				await this.saveMake(makeDto);
				count =  count + 1
				countGuardado =  countGuardado + 1
				console.log('count procesado', count, ' count del countGuardado', countGuardado)
				makesResponses.push(makeDto);
			}
			count =  count + 1
			console.log('count del chunk', count)
		}
		console.log('TERMINO CICLO', makesResponses.length)
		return makesResponses;
	}

	public async saveMake(make: MakeDto): Promise<void> {
		// console.log('saveMake', make)
		for (const type of make.vehicleTypes) {
			await this.databaseService.vehicleType.upsert({
				create: {
					typeId: type.typeId,
					typeName: type.typeName,
				},
				update: {
					typeName: type.typeName,
				},
				where: {
					typeId: type.typeId,
				},
			});
		}

		await this.databaseService.make.upsert({
			create: {
				makeId: make.makeId,
				makeName: make.makeName,
				vehicleTypesIds: {
					set: make.vehicleTypes.map(type => type.typeId),
				},
			},
			update: {
				makeName: make.makeName,
				vehicleTypesIds: {
					set: make.vehicleTypes.map(type => type.typeId),
				},
			},
			where: {
				makeId: make.makeId,
			},
		});

		await this.databaseService.actualization.create({
			data: {
				date: new Date(),
			},
		});
	}
}
