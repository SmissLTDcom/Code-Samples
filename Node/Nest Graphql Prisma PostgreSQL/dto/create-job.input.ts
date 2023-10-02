import { Field, ID, InputType } from '@nestjs/graphql';
import { JobContractType } from '@prisma/client';
import { IsNotEmpty, IsOptional } from 'class-validator';

import { ApplicationQuestionInput } from '../../application-question/dto/application-question.input';
import { JobBoardInput } from './job-board.input';
import { JobStageInput } from './stage.input';

@InputType()
export class CreateJobInput {
  @Field()
  @IsNotEmpty()
  name: string;

  @Field({ nullable: true })
  @IsNotEmpty()
  departmentId?: string | null;

  @Field(() => JobContractType)
  @IsNotEmpty()
  contract: JobContractType;

  @Field({ nullable: true })
  @IsNotEmpty()
  salary: string | null;

  @Field()
  @IsNotEmpty()
  location: string;

  @Field()
  @IsNotEmpty()
  hiringManagerId: string;

  @Field(() => [ID])
  @IsNotEmpty()
  recruiterIds: string[];

  @Field(() => [ID])
  @IsNotEmpty()
  hiringTeamIds: string[];

  @Field(() => [JobStageInput])
  @IsNotEmpty()
  stages: JobStageInput[];

  @Field(() => JobBoardInput)
  @IsNotEmpty()
  jobBoard: JobBoardInput;

  @Field(() => [ApplicationQuestionInput], { defaultValue: [], nullable: true })
  @IsOptional()
  questions: ApplicationQuestionInput[];
}
