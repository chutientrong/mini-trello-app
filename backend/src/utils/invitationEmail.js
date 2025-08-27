const nodemailer = require('nodemailer');
const config = require('../config/config');
const logger = require('../config/logger');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: config.email.user,
      pass: config.email.pass,
    },
  });
};

// Send board invitation email
const sendBoardInvitationEmail = async (inviteeEmail, inviterName, boardName, invitationLink) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: config.email.user,
      to: inviteeEmail,
      subject: `${inviterName} invited you to join "${boardName}" board`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">You're Invited!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Join the board and start collaborating</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-bottom: 20px;">Board Invitation</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              <strong>${inviterName}</strong> has invited you to join the board 
              <strong>"${boardName}"</strong> on Mini Trello.
            </p>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">
              Click the button below to accept the invitation and start collaborating with your team.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${invitationLink}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 25px; 
                        display: inline-block; 
                        font-weight: bold;
                        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                Accept Invitation
              </a>
            </div>
            
            <div style="background: #e9ecef; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #666; font-size: 14px;">
                <strong>Note:</strong> This invitation link will expire in 7 days. 
                If you don't have a Mini Trello account, you'll be prompted to create one.
              </p>
            </div>
            
            <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
              If you're having trouble with the button above, copy and paste this link into your browser:<br>
              <a href="${invitationLink}" style="color: #667eea;">${invitationLink}</a>
            </p>
          </div>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    logger.info(`Board invitation email sent to ${inviteeEmail}`);
    return true;
  } catch (error) {
    logger.error('Failed to send board invitation email:', error);
    return false;
  }
};

// Send invitation reminder email
const sendInvitationReminderEmail = async (inviteeEmail, inviterName, boardName, invitationLink) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: config.email.user,
      to: inviteeEmail,
      subject: `Reminder: You're invited to join "${boardName}" board`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #ffc107; color: #333; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">Reminder</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.8;">You still have a pending invitation</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-bottom: 20px;">Board Invitation Reminder</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              <strong>${inviterName}</strong> invited you to join the board 
              <strong>"${boardName}"</strong> on Mini Trello.
            </p>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">
              This invitation is still waiting for your response. Click the button below to accept it.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${invitationLink}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 25px; 
                        display: inline-block; 
                        font-weight: bold;
                        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                Accept Invitation
              </a>
            </div>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #856404; font-size: 14px;">
                <strong>Important:</strong> This invitation will expire soon. 
                Please respond to avoid missing out on this collaboration opportunity.
              </p>
            </div>
          </div>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    logger.info(`Board invitation reminder email sent to ${inviteeEmail}`);
    return true;
  } catch (error) {
    logger.error('Failed to send board invitation reminder email:', error);
    return false;
  }
};

module.exports = {
  sendBoardInvitationEmail,
  sendInvitationReminderEmail,
};
