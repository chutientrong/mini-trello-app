import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { Suspense, lazy } from "react";
import { LoadingSpinner } from "@/components";
import NotFound from "@/components/NotFound";
import { ProtectedRoute, PublicRoute } from "@/contexts";
// Lazy load components for code splitting
const Layout = lazy(() =>
  import("../layouts/Layout").then((module) => ({ default: module.Layout }))
);
const SignIn = lazy(() =>
  import("../features/auth/pages/SignIn").then((module) => ({
    default: module.default,
  }))
);
const SignUp = lazy(() =>
  import("../features/auth/pages/SignUp").then((module) => ({
    default: module.default,
  }))
);
const Boards = lazy(() =>
  import("../features/boards/pages/Boards").then((module) => ({
    default: module.default,
  }))
);
const BoardDetail = lazy(() =>
  import("../features/boards/pages/BoardDetail").then((module) => ({
    default: module.default,
  }))
);
const GitHubCallback = lazy(() =>
  import("../features/github/pages/GitHubCallback").then((module) => ({
    default: module.GitHubCallback,
  }))
);

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/boards" replace />,
  },
  {
    path: "/signin",
    element: (
      <PublicRoute>
        <Suspense fallback={<LoadingSpinner />}>
          <SignIn />
        </Suspense>
      </PublicRoute>
    ),
  },
  {
    path: "/signup",
    element: (
      <PublicRoute>
        <Suspense fallback={<LoadingSpinner />}>
          <SignUp />
        </Suspense>
      </PublicRoute>
    ),
  },

  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Suspense fallback={<LoadingSpinner />}>
          <Layout>
            <Outlet />
          </Layout>
        </Suspense>
      </ProtectedRoute>
    ),
    children: [
      {
        path: "boards",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Boards />
          </Suspense>
        ),
      },
      {
        path: "boards/:boardId",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <BoardDetail />
          </Suspense>
        ),
      },
      {
        path: "auth/github/callback",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <GitHubCallback />
          </Suspense>
        ),
      },
    ],
  },

  {
    path: "*",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <NotFound />
      </Suspense>
    ),
  },
]);
