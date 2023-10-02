import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { JobContractType } from '@prisma/client';

import { ApplicationQuestion } from '../../application-question/models/application-question.model';
import { OrganisationDepartment } from '../../organisation/models/organisation-department.model';
import { User } from '../../user/models/user.model';
import { JobStage } from './stage.model';

registerEnumType(JobContractType, { name: 'Contract' });

@ObjectType()
export class BasicJob {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  salary: string;

  @Field(() => JobContractType)
  contract: JobContractType;

  @Field()
  jobBoardShow: boolean;

  @Field()
  archived: boolean;

  @Field(() => OrganisationDepartment, { nullable: true })
  department?: OrganisationDepartment;

  @Field({ nullable: true })
  shortDescription: string;

  @Field({ nullable: true })
  longDescription: string;

  @Field()
  location: string;

  @Field(() => Date)
  createdAt: Date;
}

@ObjectType()
export class Job extends BasicJob {
  @Field(() => User)
  hiringManager: User;

  @Field(() => [JobStage])
  stages?: JobStage[];

  @Field(() => [ApplicationQuestion], { nullable: true })
  questions: ApplicationQuestion[];

  @Field(() => [User])
  recruiters: User[];

  @Field(() => [User])
  hiringTeam: User[];
}


