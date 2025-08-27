const { status: httpStatus } = require("http-status");
const catchAsync = require("../utils/catchAsync");
const githubService = require("../services/github.service");

const linkGitHubAccount = catchAsync(async (req, res) => {
  const result = await githubService.exchangeCodeForToken(
    req.user.id,
    req.body.code
  );
  res.status(httpStatus.OK).json(result);
});

const checkGitHubConnection = catchAsync(async (req, res) => {
  const result = await githubService.isGitHubConnected(req.user.id);
  res.status(httpStatus.OK).json(result);
});

const getRepositories = catchAsync(async (req, res) => {
  const result = await githubService.getRepositories(req.user.id);
  res.status(httpStatus.OK).json(result);
});

const disconnectGitHub = catchAsync(async (req, res) => {
  const result = await githubService.disconnectGitHub(req.user.id);
  res.status(httpStatus.OK).json(result);
});

const getRepositoryBranches = catchAsync(async (req, res) => {
  const { userName, repositoryName } = req.params;
  const repositoryFullName = `${userName}/${repositoryName}`;
  const result = await githubService.getRepositoryBranches(
    req.user.id,
    repositoryFullName
  );
  res.status(httpStatus.OK).json(result);
});

const getRepositoryCommits = catchAsync(async (req, res) => {
  const { userName, repositoryName } = req.params;
  const repositoryFullName = `${userName}/${repositoryName}`;
  const { branch = "main" } = req.query;
  const result = await githubService.getRepositoryCommits(
    req.user.id,
    repositoryFullName,
    branch
  );
  res.status(httpStatus.OK).json(result);
});

const getRepositoryIssues = catchAsync(async (req, res) => {
  const { userName, repositoryName } = req.params;
  const repositoryFullName = `${userName}/${repositoryName}`;
  const { state = "open" } = req.query;
  const result = await githubService.getRepositoryIssues(
    req.user.id,
    repositoryFullName,
    state
  );
  res.status(httpStatus.OK).json(result);
});

const getRepositoryPullRequests = catchAsync(async (req, res) => {
  const { userName, repositoryName } = req.params;
  const repositoryFullName = `${userName}/${repositoryName}`;
  const { state = "open" } = req.query;
  const result = await githubService.getRepositoryPullRequests(
    req.user.id,
    repositoryFullName,
    state
  );
  res.status(httpStatus.OK).json(result);
});

module.exports = {
  linkGitHubAccount,
  checkGitHubConnection,
  getRepositories,
  disconnectGitHub,
  getRepositoryBranches,
  getRepositoryCommits,
  getRepositoryIssues,
  getRepositoryPullRequests,
};
