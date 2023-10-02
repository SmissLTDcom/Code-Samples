import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import SignInPage from './components/Auth/SignIn';
import SignUpPage from './components/Auth/SignUp';
import { CandidateModalRouter } from './components/Candidate/CandidateModalRouter';
import CandidateProfile from './components/CandidateProfile/CandidateProfile';
import { PipelineRouter } from './components/Pipeline/PipelineRouter';
import Tasks from './components/Tasks';
import VerifyCandidateMagicLink from './components/VerifyCandidateMagicLink/VerifyCandidateMagicLink';
import { LOADER_PORTAL_CONTAINER } from './const/portals';
import {
  authRoutes,
  candidateModalRoutes,
  candidateRoutes,
  homeRoutes,
} from './const/routes';
import { CommandBarProvider } from './context/commandBar';
import JobBoardRoutes, { jobBoardRoutes } from './routes/job-board';
import JobsRoutes, { jobsRoutes } from './routes/jobs';
import MessagesRoutes, { messagesRoutes } from './routes/messages';
import NotesRoutes, { notesRoutes } from './routes/notes';
import OnboardingRoutes, { onboardingRoutes } from './routes/onboarding';
import SettingsRoutes, { settingsRoutes } from './routes/settings';
import ProtectedRoute from './shared/components/ProtectedRoute';
import WithSidebar from './shared/components/WithSidebar';

function Routing() {
  return (
    <BrowserRouter>
      <CommandBarProvider>
        <Routes>
          <Route
            path={onboardingRoutes.VERIFY_MAGIC_LINK}
            element={<VerifyCandidateMagicLink />}
          />
          <Route
            path={jobBoardRoutes.ALL}
            element={
              <ProtectedRoute isPrivate={false}>
                <JobBoardRoutes />
              </ProtectedRoute>
            }
          />
          <Route
            path={settingsRoutes.SETTINGS}
            element={
              <ProtectedRoute>
                <SettingsRoutes />
              </ProtectedRoute>
            }
          />
          <Route
            path={onboardingRoutes.ONBOARDING}
            element={
              <ProtectedRoute isPrivate={false} redirectIfLoggedIn={false}>
                <OnboardingRoutes />
              </ProtectedRoute>
            }
          />
          <Route
            path={authRoutes.SIGN_IN}
            element={
              <ProtectedRoute isPrivate={false} redirectIfLoggedIn={true}>
                <SignInPage />
              </ProtectedRoute>
            }
          />

          <Route path={candidateRoutes.CANDIDATE_PROFILE + '/*'}>
            <Route index element={<CandidateProfile />} />
            <Route path=":candidateId" element={<CandidateProfile />} />
          </Route>

          <Route
            path={authRoutes.SIGN_UP}
            element={
              <ProtectedRoute isPrivate={false} redirectIfLoggedIn={true}>
                <SignUpPage />
              </ProtectedRoute>
            }
          />

          <Route
            element={
              <ProtectedRoute>
                <WithSidebar />
              </ProtectedRoute>
            }
          >
            <Route path={homeRoutes.PIPELINE} element={<PipelineRouter />}>
              <Route path={candidateModalRoutes.CANDIDATE}>
                <Route
                  path=":candidateId/*"
                  element={
                      <CandidateModalRouter />
                  }
                />
              </Route>
              <Route path=":pipelineViewId">
                <Route path={candidateModalRoutes.CANDIDATE}>
                  <Route
                    path=":candidateId/*"
                    element={
                        <CandidateModalRouter />
                    }
                  />
                </Route>
              </Route>
            </Route>
            <Route path={homeRoutes.TASKS + '/*'} element={<Tasks />} />
            <Route
              path={notesRoutes.NOTES}
              element={
                <ProtectedRoute>
                  <NotesRoutes />
                </ProtectedRoute>
              }
            />
            <Route
              path={messagesRoutes.MESSAGES}
              element={
                <ProtectedRoute>
                  <MessagesRoutes />
                </ProtectedRoute>
              }
            />
            <Route
              path={jobsRoutes.JOBS}
              element={
                <ProtectedRoute isPrivate={false} redirectIfLoggedIn={false}>
                  <JobsRoutes />
                </ProtectedRoute>
              }
            />
          </Route>
          <Route
            path="*"
            element={<Navigate replace to={authRoutes.SIGN_IN} />}
          />
        </Routes>
      </CommandBarProvider>
      {/* Portals can be placed here, or create a separate component for portal containers */}
      <div id={LOADER_PORTAL_CONTAINER}></div>
    </BrowserRouter>
  );
}

export default Routing;
