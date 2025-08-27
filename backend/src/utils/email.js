const nodemailer = require("nodemailer");
const config = require("../config/config");
const logger = require("../config/logger");

const createTransporter = async () => {
  // For development, use Gmail with App Password if configured
  if (config.env === "development") {
    // Check if Gmail credentials are available and valid for development
    if (
      config.email.user &&
      config.email.pass &&
      config.email.pass.length === 16
    ) {
      logger.info(`📧 Using Gmail for development: ${config.email.user}`);

      return nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: config.email.user,
          pass: config.email.pass, // Your App Password
        },
      });
    } else {
      // Fallback to Ethereal if no valid Gmail credentials
      try {
        const testAccount = await nodemailer.createTestAccount();
        logger.info(`📧 Using Ethereal test account: ${testAccount.user}`);

        return nodemailer.createTransport({
          host: "smtp.ethereal.email",
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
      } catch (error) {
        logger.error("Failed to create Ethereal account:", error);
        return null;
      }
    }
  }

  // For production, use Gmail with OAuth 2.0 or App Password
  if (!config.email.user) {
    logger.warn(
      "Email user not configured, email functionality will be disabled"
    );
    return null;
  }

  // Check if Service Account credentials are available
  if (config.email.serviceClient && config.email.privateKey) {
    return nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        type: "OAuth2",
        user: config.email.user,
        serviceClient: config.email.serviceClient,
        privateKey: config.email.privateKey,
      },
    });
  }

  // Check if OAuth 2.0 credentials are available
  if (
    config.email.clientId &&
    config.email.clientSecret &&
    config.email.refreshToken
  ) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: config.email.user,
        clientId: config.email.clientId,
        clientSecret: config.email.clientSecret,
        refreshToken: config.email.refreshToken,
      },
    });
  }

  // Fallback to App Password
  if (!config.email.pass) {
    logger.warn(
      "Email password not configured, email functionality will be disabled"
    );
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: config.email.user,
      pass: config.email.pass, // This should be an App Password
    },
  });
};

const sendVerificationEmail = async (email, code) => {
  const transporter = await createTransporter();
  if (!transporter) {
    logger.warn("Email transporter not available, skipping email send");
    return false;
  }

  const mailOptions = {
    from: config.email.user,
    to: email,
    subject: "Mini Trello - Verification Code",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Mini Trello Verification</h2>
        <p>Your verification code is:</p>
        <h1 style="color: #007bff; font-size: 48px; text-align: center; letter-spacing: 8px;">${code}</h1>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info(`Verification email sent to ${email}`);

    // For development with Ethereal, log the preview URL
    if (config.env === "development" && info.messageId) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      logger.info(`📧 Email preview URL: ${previewUrl}`);
    }

    return true;
  } catch (error) {
    logger.error("Email sending error:", error);
    return false;
  }
};

module.exports = { sendVerificationEmail };
