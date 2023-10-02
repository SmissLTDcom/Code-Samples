import { ArgsType, Field } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';

import { PaginationArgs } from '../../../shared/classes';

@ArgsType()
export class GetJobsArgs extends PaginationArgs {
  organisationId: string;

  @Field(() => Boolean, { nullable: true, defaultValue: false })
  @IsOptional()
  archived: boolean;

  @Field(() => String, { nullable: true, defaultValue: '' })
  @IsOptional()
  search: string;
}
