"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.forgotPasswordEmailTemplate = void 0;
const forgotPasswordEmailTemplate = (forgotPasswordCode) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #3D8C3D, #45a049); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Password Reset</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello,</p>
    
    <p>We received a request to reset your password. If you didn't make this request, please ignore this email.</p>
    <p>To reset your password, please use the following code:</p>
    <div style="text-align: center; margin: 30px 0;">
    <div style="text-align: center; margin: 30px 0;">
      <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #3D8C3D;">${forgotPasswordCode}</span>
    </div>
      
    </div>
    <p>This code will expire in 1 minutes for security reasons.</p>
    <p>Best regards,<br>Tohori foods App Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>
`;
};
exports.forgotPasswordEmailTemplate = forgotPasswordEmailTemplate;
