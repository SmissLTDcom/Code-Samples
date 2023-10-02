import { Module } from '@nestjs/common';

import { JobResolver } from './job.resolver';
import { JobService } from './job.service';

@Module({
  imports: [],
  providers: [JobService, JobResolver],
})
export class JobModule {}
