


///  Welcome Email Template /////
export const generateWelcomeEmailTemplate = ({
  userName,
  accountSettingsLink = "#",
  supportLink = "#"
}) => `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f0f8f4;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); text-align: center; padding: 30px;">
                <p style="font-size: 54px; line-height: 54px; font-weight: 800; color: #ffffff; margin: 0;">JoyDataBundle</p>
                <p style="font-size: 16px; color: #d1fae5; margin: 10px 0 0 0; font-weight: 500;">Reseller Program</p>
            </td>
        </tr>
        <tr>
            <td style="padding: 40px 30px;">                
                <h1 style="font-size: 28px; margin-bottom: 25px; color: #10b981; font-weight: 700;">Welcome to the Reseller Program!</h1>
                
                <p style="font-size: 16px; margin-bottom: 25px;">Hello <strong style="color: #10b981;">${userName || 'there'}</strong>,</p>
                
                <p style="font-size: 16px; margin-bottom: 25px;">Congratulations on joining the <strong>JoyDataBundle Reseller Program</strong>! We're thrilled to have you as part of our growing network of data resellers.</p>
                
                <div style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border-left: 4px solid #10b981; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                    <p style="font-size: 18px; font-weight: 600; color: #065f46; margin: 0 0 10px 0;">🎉 You're all set to start earning!</p>
                    <p style="font-size: 14px; color: #047857; margin: 0;">Start reselling data bundles and grow your business with competitive rates and instant delivery.</p>
                </div>
                
                <table cellpadding="15" cellspacing="0" border="0" width="100%" style="background-color: #f0fdf4; border-radius: 10px; margin-bottom: 25px; border: 1px solid #bbf7d0;">
                    <tr>
                        <td style="font-size: 16px; border-bottom: 1px solid #d1fae5; color: #065f46;">
                            <strong>✓ Competitive Pricing</strong> - Buy data at wholesale rates
                        </td>
                    </tr>
                    <tr>
                        <td style="font-size: 16px; border-bottom: 1px solid #d1fae5; color: #065f46;">
                            <strong>✓ Instant Delivery</strong> - Data bundles delivered in seconds
                        </td>
                    </tr>
                    <tr>
                        <td style="font-size: 16px; border-bottom: 1px solid #d1fae5; color: #065f46;">
                            <strong>✓ Multiple Networks</strong> - MTN, Vodafone & AirtelTigo
                        </td>
                    </tr>
                    <tr>
                        <td style="font-size: 16px; border-bottom: 1px solid #d1fae5; color: #065f46;">
                            <strong>✓ Easy Wallet Top-up</strong> - Fund your wallet with MoMo
                        </td>
                    </tr>
                    <tr>
                        <td style="font-size: 16px; color: #065f46;">
                            <strong>✓ Real-time Dashboard</strong> - Track sales and earnings
                        </td>
                    </tr>
                </table>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${accountSettingsLink}" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; padding: 15px 35px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; display: inline-block; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);">Start Reselling Now</a>
                </div>
                
                <div style="background-color: #ecfdf5; border-radius: 8px; padding: 20px; margin: 25px 0;">
                    <p style="font-size: 16px; margin: 0 0 15px 0; color: #065f46; font-weight: 600;">🚀 Quick Start Guide:</p>
                    <ol style="font-size: 15px; color: #047857; margin: 0; padding-left: 20px;">
                        <li style="margin-bottom: 10px;">Top up your wallet using Mobile Money</li>
                        <li style="margin-bottom: 10px;">Browse available data bundles</li>
                        <li style="margin-bottom: 10px;">Purchase bundles for your customers</li>
                        <li>Watch your earnings grow!</li>
                    </ol>
                </div>
                
                <p style="font-size: 16px; margin-bottom: 25px;">Ready to make your first sale? Head to your dashboard and explore our competitive bundle rates!</p>
                
                <p style="font-size: 16px; margin-top: 30px;">Need help getting started? <a href="${supportLink}" style="color: #10b981; text-decoration: none; font-weight: 600;">Contact our support team</a> anytime - we're here to support your success!</p>
                
                <p style="font-size: 16px; margin-top: 30px;">
                    Happy selling,<br>
                    <strong style="color: #10b981;">The JoyDataBundle Team</strong>
                </p>
            </td>
        </tr>
        <tr>
            <td style="background-color: #f0fdf4; padding: 20px; text-align: center; font-size: 14px; border-top: 1px solid #d1fae5;">
                <p style="margin: 0 0 10px; color: #065f46;">
                    JoyDataBundle | Empowering Resellers Across Ghana
                </p>
                <p style="margin: 0;">
                    <a href="#" style="color: #10b981; text-decoration: none; margin: 0 10px; font-weight: 500;">Unsubscribe</a> | 
                    <a href="#" style="color: #10b981; text-decoration: none; margin: 0 10px; font-weight: 500;">Privacy Policy</a> | 
                    <a href="#" style="color: #10b981; text-decoration: none; margin: 0 10px; font-weight: 500;">Terms of Service</a>
                </p>
            </td>
        </tr>
    </table>
</div>
`;



/// OTP Email Template /////
export const generateOTPEmailTemplate = ({
  userName,
  otpCode,
  expiryMinutes,
  supportLink = "https://joydatabundle.com/support"
}) => `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f4f7fa;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); text-align: center; padding: 30px;">
                <p style="font-size: 54px; line-height: 54px; font-weight: 800; color: #ffffff; margin: 0;">JoyDataBundle</p>
            </td>
        </tr>
        <tr>
            <td style="padding: 40px 30px; text-align: center;">                
                <h1 style="font-size: 28px; margin-bottom: 25px; color: #667eea; font-weight: 700;">Verification Code</h1>
                
                <p style="font-size: 16px; margin-bottom: 25px;">Hello <strong style="color: #667eea;">${userName || 'there'}</strong>,</p>
                
                <p style="font-size: 16px; margin-bottom: 30px;">Use the verification code below to complete your action:</p>
                
                <div style="background-color: #f0f5ff; border: 2px dashed #667eea; border-radius: 10px; margin: 30px 0; padding: 25px;">
                    <p style="font-size: 32px; font-weight: 800; color: #667eea; margin: 0; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otpCode}</p>
                </div>
                
                <table cellpadding="15" cellspacing="0" border="0" width="100%" style="background-color: #fff3cd; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #ffc107;">
                    <tr>
                        <td style="font-size: 14px; color: #856404;">
                            <strong>⚠️ Important:</strong><br>
                            • This code expires in <strong>${expiryMinutes} minutes</strong><br>
                            • Do not share this code with anyone<br>
                            • If you didn't request this code, please ignore this email
                        </td>
                    </tr>
                </table>
                
                <p style="font-size: 14px; color: #666; margin-top: 30px;">Having trouble? <a href="${supportLink}" style="color: #667eea; text-decoration: none;">Contact our support team</a></p>
                
                <p style="font-size: 16px; margin-top: 30px;">
                    Best regards,<br>
                    <strong>The JoyDataBundle Team</strong>
                </p>
            </td>
        </tr>
        <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; font-size: 14px;">
                <p style="margin: 0 0 10px; color: #ffffff;">
                    JoyDataBundle | Ghana
                </p>
                <p style="margin: 0;">
                    <a href="https://www.joydatabundle.com/privacy" style="color: #ffffff; text-decoration: none; margin: 0 10px;">Privacy Policy</a> | 
                    <a href="https://www.joydatabundle.com/terms" style="color: #ffffff; text-decoration: none; margin: 0 10px;">Terms of Service</a>
                </p>
            </td>
        </tr>
    </table>
</div>
`;








//TRANSACTION RECEIPT EMAIL TEMPLATE
export const generateTransactionReceiptTemplate = ({
  userName,
  amount,
  bundleName,
  reference,
  date,
  phoneNumber,
  paymentMethod,
}) => {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #0066ff;">JoyBundle - Payment Receipt</h2>

      <p>Hello ${userName || "Customer"},</p>
      <p>
        Your purchase was successful! Below is your payment receipt.
      </p>

      <div style="background:#f7f7f7; padding: 15px; border-radius: 8px; margin-top: 10px;">
        <h3>Transaction Details</h3>
        <p><strong>Bundle:</strong> ${bundleName}</p>
        <p><strong>Amount Paid:</strong> GHS ${amount}</p>
        <p><strong>Phone Number:</strong> ${phoneNumber}</p>
        <p><strong>Payment Method:</strong> ${paymentMethod}</p>
        <p><strong>Reference:</strong> ${reference}</p>
        <p><strong>Date:</strong> ${date}</p>
      </div>

      <p style="margin-top: 20px;">
        If you have any issues, reply to this email or contact support.
      </p>

      <p>Thanks for choosing JoyBundle! 🎉</p>
    </div>
  `;
};




//INVITE EMAIL 
export const generateInviteEmailTemplate = ({
  inviteUrl
}) => `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; background-color: #f0f6ff; padding: 20px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);">
    
    <tr>
      <td style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); text-align: center; padding: 30px;">
        <p style="font-size: 48px; font-weight: 800; color: #ffffff; margin: 0;">JoyDataBundle</p>
        <p style="font-size: 16px; color: #dbeafe; margin-top: 10px;">Reseller Invitation</p>
      </td>
    </tr>

    <tr>
      <td style="padding: 40px 30px;">
        <h1 style="color: #2563eb; font-size: 26px; margin-bottom: 20px;">You’ve Been Invited 🎉</h1>

        <p style="font-size: 16px;">You have been invited to join the <strong>JoyDataBundle Reseller Platform</strong>.</p>

        <p style="font-size: 16px;">Click the button below to accept your invitation and get started:</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${inviteUrl}" style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; padding: 15px 35px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block;">
            Accept Invitation
          </a>
        </div>

        <p style="font-size: 14px; color: #475569;">If you didn’t expect this invitation, you can safely ignore this email.</p>

        <p style="margin-top: 30px;">
          Cheers,<br/>
          <strong style="color: #2563eb;">The JoyDataBundle Team</strong>
        </p>
      </td>
    </tr>

    <tr>
      <td style="background-color: #eff6ff; text-align: center; padding: 18px; font-size: 13px; color: #1e3a8a;">
        JoyDataBundle • Powering Smart Resellers
      </td>
    </tr>

  </table>
</div>
`;



//APPROVAL EMAIL TEMPLATE
export const generateApprovedEmailTemplate = ({
  userName,
  loginUrl = "https://www.joydatabundle.com/auth/login"
}) => `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; background-color: #f0f6ff; padding: 20px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);">

    <tr>
      <td style="background: linear-gradient(135deg, #60a5fa 0%, #2563eb 100%); text-align: center; padding: 30px;">
        <p style="font-size: 48px; font-weight: 800; color: #ffffff; margin: 0;">JoyDataBundle</p>
        <p style="font-size: 16px; color: #e0f2fe; margin-top: 10px;">Account Approval</p>
      </td>
    </tr>

    <tr>
      <td style="padding: 40px 30px;">
        <h1 style="font-size: 26px; color: #2563eb;">You’re Approved! ✅</h1>

        <p style="font-size: 16px;">Hello <strong style="color:#2563eb;">${userName || 'there'}</strong>,</p>

        <p style="font-size: 16px;">
          Great news! Your account has been reviewed and approved. You can now log in and start using the platform.
        </p>

        <div style="background-color: #eff6ff; border-left: 4px solid #2563eb; padding: 18px; border-radius: 8px; margin: 25px 0;">
          <p style="margin: 0; font-size: 15px; color: #1e3a8a;">
            🚀 You now have full access to your reseller dashboard.
          </p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${loginUrl}" style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; padding: 15px 35px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block;">
            Login to Dashboard
          </a>
        </div>

        <p style="margin-top: 30px;">
          Welcome aboard,<br/>
          <strong style="color: #2563eb;">The JoyDataBundle Team</strong>
        </p>
      </td>
    </tr>

    <tr>
      <td style="background-color: #eff6ff; text-align: center; padding: 18px; font-size: 13px; color: #1e3a8a;">
        JoyDataBundle • Secure • Fast • Reliable
      </td>
    </tr>

  </table>
</div>
`;


