import { Field, ID, InputType, PartialType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional } from 'class-validator';

import { UpdateApplicationQuestionInput } from '../../application-question/dto/update-application-question.input';
import { CreateJobInput } from './create-job.input';

@InputType()
export class UpdateJobInput extends PartialType(CreateJobInput) {
  @Field(() => ID)
  @IsNotEmpty()
  id: string;

  @Field(() => [UpdateApplicationQuestionInput], {
    defaultValue: [],
    nullable: true,
  })
  
  @IsOptional()
  questions: UpdateApplicationQuestionInput[];
}
