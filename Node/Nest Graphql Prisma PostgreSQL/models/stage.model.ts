import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { JobStageType } from '@prisma/client';

registerEnumType(JobStageType, { name: 'JobStageType' });

@ObjectType()
export class JobStage {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  index: number;

  @Field(() => JobStageType, { nullable: true })
  type: JobStageType;

  @Field(() => Boolean, { nullable: true })
  inUse?: boolean;
}

export const predefinedStages = [
  {
    name: 'Sourced',
    type: JobStageType.SOURCED,
  },
  {
    name: 'Applied',
    type: JobStageType.APPLIED,
  },
];
