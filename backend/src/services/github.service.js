const { status: httpStatus } = require('http-status');
const BaseService = require('./BaseService');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');
const logger = require('../config/logger');
const config = require('../config/config');
const axios = require('axios');

// GitHub OAuth endpoints
const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token';
const GITHUB_USER_URL = 'https://api.github.com/user';

class GitHubService extends BaseService {
  constructor() {
    super(User, "users");
  }

  async exchangeCodeForToken(userId, code) {
    if (!code) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Authorization code is required');
    }

    logger.info('Starting GitHub OAuth exchange:', {
      userId,
      hasCode: !!code,
      codeLength: code.length,
      clientId: config.github.clientId ? 'present' : 'missing',
      clientSecret: config.github.clientSecret ? 'present' : 'missing',
    });

    try {
      // Exchange code for access token
      const tokenResponse = await axios.post(GITHUB_TOKEN_URL, {
        client_id: config.github.clientId,
        client_secret: config.github.clientSecret,
        code,
      }, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      logger.info('GitHub token response:', { 
        hasAccessToken: !!tokenResponse.data.access_token,
        hasError: !!tokenResponse.data.error,
      });

      const { access_token, error, error_description } = tokenResponse.data;
      
      if (error) {
        const errorMessage = error_description ? `${error}: ${error_description}` : error;
        throw new ApiError(httpStatus.BAD_REQUEST, `GitHub OAuth error: ${errorMessage}`);
      }

      if (!access_token) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Failed to obtain access token from GitHub');
      }

      // Get user information from GitHub
      const userResponse = await axios.get(GITHUB_USER_URL, {
        headers: {
          'Authorization': `token ${access_token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      const githubUser = userResponse.data;
      
      // Find the existing user
      const user = await User.findById(userId);
      if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
      }

      // Check if GitHub account is already linked to another user
      const existingUserWithGitHub = await User.findByGitHubId(githubUser.id.toString());
      if (existingUserWithGitHub && existingUserWithGitHub.id !== userId) {
        // If it's linked to another user, we need to unlink it first
        logger.warn(`GitHub account ${githubUser.login} is already linked to user ${existingUserWithGitHub.id}, unlinking...`);
        
        // Unlink from the other user
        existingUserWithGitHub.githubId = null;
        existingUserWithGitHub.githubUsername = null;
        existingUserWithGitHub.githubAccessToken = null;
        await existingUserWithGitHub.save();
        
        logger.info(`Unlinked GitHub account from user ${existingUserWithGitHub.id}`);
      }

      // Link GitHub account to current user
      user.githubId = githubUser.id.toString();
      user.githubUsername = githubUser.login;
      user.githubAccessToken = access_token;
      user.isVerified = true;
      await user.save();

      logger.info(`GitHub account linked to user: ${githubUser.login}`);

      return {
        message: 'GitHub account linked successfully',
        githubUser: {
          id: githubUser.id,
          login: githubUser.login,
          avatar_url: githubUser.avatar_url,
          name: githubUser.name,
          email: githubUser.email
        }
      };

    } catch (error) {
      logger.error('GitHub link account error:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
      });
      
      if (error.response) {
        const errorMessage = error.response.data?.error_description || error.response.data?.message || error.response.data?.error || 'Unknown error';
        throw new ApiError(httpStatus.BAD_REQUEST, `GitHub API error: ${errorMessage}`);
      }
      
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to link GitHub account');
    }
  }

  async isGitHubConnected(userId) {
    const user = await User.findById(userId);
    return {
      connected: !!(user.githubId && user.githubAccessToken),
      githubUsername: user.githubUsername,
    };
  }

  async getRepositories(userId) {
    const user = await User.findById(userId);
    
    if (!user.githubAccessToken) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'No GitHub access token found');
    }

    if (!user.githubUsername) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'GitHub username not found');
    }

    try {
      let allRepositories = [];
      let page = 1;
      const perPage = 100;
      let hasMorePages = true;

      // Fetch all pages of repositories
      while (hasMorePages) {
        const response = await axios.get(`https://api.github.com/user/repos?sort=created&direction=desc&per_page=${perPage}&page=${page}`, {
          headers: {
            'Authorization': `token ${user.githubAccessToken}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        });

        const repositories = response.data;
        
        // If we get fewer repositories than per_page, we've reached the end
        if (repositories.length < perPage) {
          hasMorePages = false;
        }

        // Filter repositories to only include needed fields
        const filteredRepositories = repositories.map(repo => ({
          id: repo.id,
          name: repo.name,
          full_name: repo.full_name,
          description: repo.description,
          html_url: repo.html_url,
          created_at: repo.created_at,
        }));
        
        allRepositories = allRepositories.concat(filteredRepositories);
        page++;

        // Safety check to prevent infinite loops (max 50 pages = 5000 repos)
        if (page > 50) {
          logger.warn(`Reached maximum page limit (50) for user ${user.githubUsername}`);
          break;
        }
      }

      logger.info(`Fetched ${allRepositories.length} repositories for user ${user.githubUsername}`);
      return allRepositories;
    } catch (error) {
      logger.error('GitHub API error:', error);
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to fetch repositories');
    }
  }

  async disconnectGitHub(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    user.githubId = null;
    user.githubUsername = null;
    user.githubAccessToken = null;
    await user.save();

    logger.info(`GitHub account disconnected for user: ${userId}`);

    return {
      message: 'GitHub account disconnected successfully'
    };
  }

  async getRepositoryBranches(userId, repositoryFullName) {
    const user = await User.findById(userId);
    
    if (!user.githubAccessToken) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'No GitHub access token found');
    }

    try {
      const response = await axios.get(`https://api.github.com/repos/${repositoryFullName}/branches`, {
        headers: {
          'Authorization': `token ${user.githubAccessToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      // Filter to only include needed fields
      return response.data.map(branch => ({
        name: branch.name,
        commit: {
          sha: branch.commit.sha,
          url: branch.commit.url,
        },
        protected: branch.protected,
      }));
    } catch (error) {
      logger.error('GitHub branches API error:', error);
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to fetch repository branches');
    }
  }

  async getRepositoryCommits(userId, repositoryFullName, branch = 'main') {
    const user = await User.findById(userId);
    
    if (!user.githubAccessToken) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'No GitHub access token found');
    }

    try {
      const response = await axios.get(`https://api.github.com/repos/${repositoryFullName}/commits?sha=${branch}&per_page=20`, {
        headers: {
          'Authorization': `token ${user.githubAccessToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      // Filter to only include needed fields
      return response.data.map(commit => ({
        sha: commit.sha,
        message: commit.commit.message,
        author: {
          name: commit.commit.author.name,
          email: commit.commit.author.email,
          date: commit.commit.author.date,
        },
        committer: {
          name: commit.commit.committer.name,
          email: commit.commit.committer.email,
          date: commit.commit.committer.date,
        },
        html_url: commit.html_url,
      }));
    } catch (error) {
      logger.error('GitHub commits API error:', error);
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to fetch repository commits');
    }
  }

  async getRepositoryIssues(userId, repositoryFullName, state = 'open') {
    const user = await User.findById(userId);
    
    if (!user.githubAccessToken) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'No GitHub access token found');
    }

    try {
      const response = await axios.get(`https://api.github.com/repos/${repositoryFullName}/issues?state=${state}&per_page=20`, {
        headers: {
          'Authorization': `token ${user.githubAccessToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      // Filter to only include needed fields
      return response.data.map(issue => ({
        id: issue.id,
        number: issue.number,
        title: issue.title,
        body: issue.body,
        state: issue.state,
        locked: issue.locked,
        assignees: issue.assignees,
        labels: issue.labels,
        user: {
          login: issue.user.login,
          avatar_url: issue.user.avatar_url,
        },
        created_at: issue.created_at,
        updated_at: issue.updated_at,
        closed_at: issue.closed_at,
        html_url: issue.html_url,
      }));
    } catch (error) {
      logger.error('GitHub issues API error:', error);
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to fetch repository issues');
    }
  }

  async getRepositoryPullRequests(userId, repositoryFullName, state = 'open') {
    const user = await User.findById(userId);
    
    if (!user.githubAccessToken) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'No GitHub access token found');
    }

    try {
      const response = await axios.get(`https://api.github.com/repos/${repositoryFullName}/pulls?state=${state}&per_page=20`, {
        headers: {
          'Authorization': `token ${user.githubAccessToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      // Filter to only include needed fields
      return response.data.map(pr => ({
        id: pr.id,
        number: pr.number,
        title: pr.title,
        body: pr.body,
        state: pr.state,
        locked: pr.locked,
        draft: pr.draft,
        merged: pr.merged,
        mergeable: pr.mergeable,
        rebaseable: pr.rebaseable,
        mergeable_state: pr.mergeable_state,
        comments: pr.comments,
        review_comments: pr.review_comments,
        commits: pr.commits,
        additions: pr.additions,
        deletions: pr.deletions,
        changed_files: pr.changed_files,
        user: {
          login: pr.user.login,
          avatar_url: pr.user.avatar_url,
        },
        created_at: pr.created_at,
        updated_at: pr.updated_at,
        closed_at: pr.closed_at,
        merged_at: pr.merged_at,
        html_url: pr.html_url,
        head: {
          ref: pr.head.ref,
          sha: pr.head.sha,
          label: pr.head.label,
        },
        base: {
          ref: pr.base.ref,
          sha: pr.base.sha,
          label: pr.base.label,
        },
      }));
    } catch (error) {
      logger.error('GitHub pull requests API error:', error);
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to fetch repository pull requests');
    }
  }
}

// Create singleton instance
const githubService = new GitHubService();

module.exports = githubService;
