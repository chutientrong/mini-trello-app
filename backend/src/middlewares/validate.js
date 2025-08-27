const { status: httpStatus } = require("http-status");
const ApiError = require("../utils/ApiError");
const logger = require("../config/logger");

const validate = (schema) => (req, res, next) => {
  try {
    logger.debug("Validate middleware called with schema:", {
      schema: schema.constructor.name,
    });
    const validSchema = pick(schema, ["params", "query", "body"]);
    const object = pick(req, Object.keys(validSchema));
    // Validate each part of the schema
    Object.keys(validSchema).forEach((key) => {
      if (validSchema[key]) {
        const dataToValidate = object[key] || {};
        logger.debug(`Validating ${key}:`, { [key]: dataToValidate });
        const result = validSchema[key].safeParse(dataToValidate);
        if (!result.success) {
          const errorMessage =
            result.error.errors?.map((err) => err.message).join(", ") ||
            "Validation failed";
          throw new ApiError(httpStatus.BAD_REQUEST, errorMessage);
        }
        // Replace the request object with parsed data
        req[key] = result.data;
      }
    });

    return next();
  } catch (error) {
    logger.error("Validation error:", error);
    if (error instanceof ApiError) {
      return next(error);
    }
    return next(new ApiError(httpStatus.BAD_REQUEST, "Validation error"));
  }
};

const pick = (object, keys) => {
  return keys.reduce((obj, key) => {
    if (object && object[key] !== undefined) {
      obj[key] = object[key];
    }
    return obj;
  }, {});
};

module.exports = validate;
