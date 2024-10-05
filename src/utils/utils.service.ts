import { Injectable } from "@nestjs/common";

@Injectable()
export class UtilsService {
	public createChunks<T>(array: T[], chunkSize: number) {
		const chunks: T[][] = [];
		for (let i = 0; i < array.length; i += Number(chunkSize)) {
			chunks.push(array.slice(i, i + Number(chunkSize)));
		}

		return chunks;
	}
}
