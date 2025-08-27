const express = require("express");
const auth = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const githubValidation = require("../validations/github.validation");
const githubController = require("../controllers/github.controller");

const router = express.Router();

router.post(
  "/auth/link",
  auth(),
  validate(githubValidation.linkGitHub),
  githubController.linkGitHubAccount
);
router.get("/connection", auth(), githubController.checkGitHubConnection);

router.get("/repositories", auth(), githubController.getRepositories);

router.delete("/disconnect", auth(), githubController.disconnectGitHub);

router.get(
  "/repos/:userName/:repositoryName/branches",
  auth(),
  githubController.getRepositoryBranches
);
router.get(
  "/repos/:userName/:repositoryName/commits",
  auth(),
  githubController.getRepositoryCommits
);
router.get(
  "/repos/:userName/:repositoryName/issues",
  auth(),
  githubController.getRepositoryIssues
);
router.get(
  "/repos/:userName/:repositoryName/pulls",
  auth(),
  githubController.getRepositoryPullRequests
);

module.exports = router;
