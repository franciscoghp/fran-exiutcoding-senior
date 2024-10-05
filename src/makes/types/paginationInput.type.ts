import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class PaginationInput {
  @Field(() => Int, { defaultValue: 0, nullable: true })
  skip?: number;

  @Field(() => Int, { defaultValue: 10, nullable: true })
  take?: number;
}
