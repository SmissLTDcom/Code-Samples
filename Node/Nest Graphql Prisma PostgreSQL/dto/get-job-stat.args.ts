import { ArgsType, Field, ID } from '@nestjs/graphql';
import { IsOptional, IsUUID } from 'class-validator';

import { FiltersExpressionInput } from '../../candidate/dto/get-candidates.args';

@ArgsType()
export class GetJobStatArgs {
  @Field(() => ID)
  @IsUUID()
  jobId: string;

  @Field(() => FiltersExpressionInput, { nullable: true })
  @IsOptional()
  filter: FiltersExpressionInput;

  organisationId: string;
}
