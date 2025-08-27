const { z } = require("zod");

const linkGitHub = {
  body: z.object({
    code: z.string().min(1),
  }),
};

module.exports = {
  linkGitHub,
};
