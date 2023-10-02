import { ChevronRightIcon } from '@heroicons/react/24/solid';
import type { Maybe } from 'graphql/jsutils/Maybe';
import { Link } from 'react-router-dom';

import type { Contract } from '../../../../../types.__generated__';
import { contractString } from '../../../../../types/enums/contractTypesEnums';
import { ContractIcon, LocationIcon, SalaryIcon } from '../../../shared/icons';


interface JobsList {
  jobs: Array<JobListElement>;
}

const JobsList = ({ jobs }: JobsList) => (
  <div className="bg-slate-100 flex-1 relative flex-grow-1">
    <div className="space-y-8 max-w-6xl mx-auto px-6 pt-10">
      <h1 className="text-3xl leading-9 font-bold text-slate-900">
        Open positions
      </h1>
      <ul className="space-y-4">
        {jobs.map((job) => (
          <JobListElement key={job.id} job={job} />
        ))}
      </ul>
    </div>
  </div>
);

interface JobListElement {
  id: string;
  name: string;
  salary?: Maybe<string>;
  contract: Contract;
  location: string;
  department?: { name: string } | null;
  shortDescription?: Maybe<string>;
}

interface JobListElementProps {
  job: JobListElement;
}

const JobListElement = ({ job }: JobListElementProps) => (
  <li>
    <Link to={'jobs/' + job.id}>
      <div className="block rounded-lg shadow-sm border cursor-pointer hover:opacity-80">
        <div className="flex justify-between items-center rounded-lg px-6 py-4 bg-white">
          <div className="space-y-6">
            <div className="space-y-1">
              <p className="cursor-pointer hover:underline text-lg leading-7 font-semibold text-slate-800">
                {job.name}
              </p>
              <p className="text-slate-400">{job.shortDescription}</p>
            </div>
            <dl className="space-y-4 md:flex md:space-y-0 md:space-x-6">
              <div>
                <dt className="sr-only">Employment type</dt>
                <dl className="flex items-start space-x-2 text-sm leading-5">
                  <ContractIcon />
                  <span className="text-slate-600">
                    {contractString(job.contract)}
                  </span>
                </dl>
              </div>
              <div>
                <dt className="sr-only">Location</dt>
                <dl className="flex items-start space-x-2 text-sm leading-5">
                  <LocationIcon />
                  <span className="text-slate-600">{job.location}</span>
                </dl>
              </div>
              {job.salary && (
                <div>
                  <dt className="sr-only">Salary</dt>
                  <dl className="flex items-start space-x-2 text-sm leading-5">
                    <SalaryIcon />
                    <span className="text-slate-600">{job.salary}</span>
                  </dl>
                </div>
              )}
            </dl>
          </div>
          <div className="block">
            <ChevronRightIcon className="text-slate-300 w-10 h-10" />
          </div>
        </div>
      </div>
    </Link>
  </li>
);

export default JobList;
