import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { GraphQLModule } from "@nestjs/graphql";
import { join } from "node:path";
import { DatabaseModule } from "./database/database.module";
import { MakesModule } from "./makes/makes.module";
import { UtilsModule } from "./utils/utils.module";

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		DatabaseModule,
		GraphQLModule.forRoot<ApolloDriverConfig>({
			definitions: {
				path: join(process.cwd(), "src/graphql/generated.ts"),
			},
			driver: ApolloDriver,
			typePaths: ["./**/*.graphql"],
		}),
		MakesModule,
		UtilsModule,
	],
	controllers: [],
	providers: [],
})
export class AppModule {}
