import { Args, Query, Resolver } from "@nestjs/graphql";
import { MakesService } from "./makes.service";
import { PaginationInput } from "./types/paginationInput.type";
import { MakeDto } from "./types/make.dto";

@Resolver("Make")
export class MakesResolver {
	constructor(private readonly makesService: MakesService) {}

	@Query("makes")
    async makes(
        @Args('paginationInput', { nullable: true }) paginationInput?: PaginationInput,
        @Args('actualize', { nullable: true }) actualize?: boolean,
    ): Promise<{ total: number, items: MakeDto[] }> {
        return this.makesService.getMakes(paginationInput, actualize);
    }
}
