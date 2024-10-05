import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { UtilsModule } from "../utils/utils.module";
import { MakesController } from "./makes.controller";
import { MakesResolver } from "./makes.resolver";
import { MakesService } from "./makes.service";
import { MakesServiceUtils } from "./makes.service.utils";

@Module({
	imports: [UtilsModule, DatabaseModule],
	controllers: [MakesController],
	providers: [MakesResolver, MakesService, MakesServiceUtils],
})
export class MakesModule {}
