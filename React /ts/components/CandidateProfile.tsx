import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { useGetApplicationQuestionsByCandidateLazyQuery } from '../../graphql/queries/__generated__/getApplicationQuestionsByCandidate.query.generated';
import { useGetCandidateActivityItemsByCandidateLazyQuery } from '../../graphql/queries/__generated__/getCandidateActivityItemsByCandidate.query.generated';
import { useGetCandidateByIdLazyQuery } from '../../graphql/queries/__generated__/getCandidateById.query.generated';
import { useCandidateGetMeLazyQuery } from '../../graphql/queries/__generated__/getCandidateMe.query.generated';
import { useGetCandidateMeetingsLazyQuery } from '../../graphql/queries/__generated__/getCandidateMeetings.query.generated';
import { useGetJobAnswersByCandidateLazyQuery } from '../../graphql/queries/__generated__/getJobAnswersByCandidate.query.generated';
import { useGetCandidateSelfServeActivityItemsLazyQuery } from '../../graphql/queries/__generated__/getMyCandidateActivityItems.query.generated';
import { useGetMyCandidateMeetingsLazyQuery } from '../../graphql/queries/__generated__/getMyCandidateMeetings.query.generated';
import { CandidateActivityItemsViewType } from '../../types.__generated__';
import CandidateSelfServe from './components/CandidateSelfServe';

export default function CandidateProfile() {
  const { candidateId } = useParams();
  const [getMe, { data: getMeData }] = useCandidateGetMeLazyQuery();

  const [getCandidateById, { data: getCandidateByIdData }] =
    useGetCandidateByIdLazyQuery();

  const [getMyActivityItems, { data: getMyActivityItemsData }] =
    useGetCandidateSelfServeActivityItemsLazyQuery();

  const [getCandidateActivityItems, { data: candidateActivityItemsData }] =
    useGetCandidateActivityItemsByCandidateLazyQuery();

  const [getCandidateMeetings, { data: candidateMeetingsData }] =
    useGetCandidateMeetingsLazyQuery();

  const [getMyCandidateMeetings, { data: myCandidateMeetingsData }] =
    useGetMyCandidateMeetingsLazyQuery();

  const [
    getApplicationQuestionsByCandidate,
    { data: getApplicationQuestionsByCandidateData },
  ] = useGetApplicationQuestionsByCandidateLazyQuery();

  const [getJobAnswersByCandidate, { data: getJobAnswersByCandidateData }] =
    useGetJobAnswersByCandidateLazyQuery();

  useEffect(() => {
    if (candidateId) {
      getCandidateById({ variables: { candidateId } });
      getCandidateActivityItems({
        variables: {
          candidateId,
          viewType: CandidateActivityItemsViewType.Allowlisted,
        },
      });
      getCandidateMeetings({ variables: { candidateId } });
    } else {
      getMe();
      getMyActivityItems();
      getMyCandidateMeetings();
      getApplicationQuestionsByCandidate();
      getJobAnswersByCandidate();
    }
  }, [
    candidateId,
    getCandidateById,
    getMe,
    getMyActivityItems,
    getCandidateActivityItems,
    getCandidateMeetings,
    getMyCandidateMeetings,
  ]);

  const candidateInfo =
    getMeData?.candidateMyProfile || getCandidateByIdData?.getCandidateById;
  const isCandidate = !candidateId;

  const candidateActivityItems =
    getMyActivityItemsData?.getCandidateSelfServeActivityItems ||
    candidateActivityItemsData?.findCandidateActivityItems;

  const meetingsData =
    candidateMeetingsData?.getCandidateMeetings ||
    myCandidateMeetingsData?.getMyCandidateMeetings;

  const questionsData =
    getApplicationQuestionsByCandidateData?.getApplicationQuestionsByCandidate;

  const answersData = getJobAnswersByCandidateData?.getJobAnswersByCandidate;

  return (
    <CandidateSelfServe
      candidateActivityItems={candidateActivityItems}
      meetingsData={meetingsData}
      answersData={answersData}
      candidateInfo={candidateInfo}
      isCandidate={isCandidate}
      questionsData={questionsData}
    />
  );
}
