const sgMail = require('@sendgrid/mail');

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

class EmailService {
  constructor() {
    this.fromEmail = process.env.FROM_EMAIL || 'sandeep.cse2026@gmail.com';
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  async sendEmail(to, subject, html, text = null, forceInDev = false) {
    try {
      if (this.isDevelopment && !forceInDev) {
        console.log('📧 [DEV] Email would be sent:');
        console.log('To:', to);
        console.log('Subject:', subject);
        return { success: true, dev: true };
      }

      if (!process.env.SENDGRID_API_KEY) {
        console.warn('SendGrid API key not configured, skipping email');
        return { success: false, error: 'Email service not configured' };
      }

      const msg = {
        to,
        from: {
          email: this.fromEmail,
          name: 'AuctionHub'
        },
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, '') // Strip HTML for text version
      };

      await sgMail.send(msg);
      console.log('✅ Email sent successfully to:', to);
      return { success: true };
    } catch (error) {
      console.error('❌ Email send failed:', error);
      return { success: false, error: error.message };
    }
  }

  async sendBidAcceptedEmail(buyer, seller, auction, finalAmount) {
    const subject = `🎉 Congratulations! Your bid has been accepted - ${auction.itemName}`;
    
    const buyerHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Congratulations! Your bid has been accepted!</h1>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="margin-top: 0;">Auction Details</h2>
          <p><strong>Item:</strong> ${auction.itemName}</p>
          <p><strong>Description:</strong> ${auction.description}</p>
          <p><strong>Final Amount:</strong> $${finalAmount}</p>
          <p><strong>Seller:</strong> ${seller.name}</p>
          <p><strong>Seller Email:</strong> ${seller.email}</p>
        </div>
        
        <h3>Next Steps:</h3>
        <ol>
          <li>You will receive an invoice shortly</li>
          <li>Please contact the seller to arrange payment and delivery</li>
          <li>Complete the transaction as agreed</li>
        </ol>
        
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          Thank you for using AuctionHub!<br>
          If you have any questions, please contact our support team.
        </p>
      </div>
    `;

    const sellerHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Sale Confirmed! Your auction was successful</h1>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="margin-top: 0;">Sale Details</h2>
          <p><strong>Item:</strong> ${auction.itemName}</p>
          <p><strong>Final Amount:</strong> $${finalAmount}</p>
          <p><strong>Buyer:</strong> ${buyer.name}</p>
          <p><strong>Buyer Email:</strong> ${buyer.email}</p>
        </div>
        
        <h3>Next Steps:</h3>
        <ol>
          <li>You will receive an invoice shortly</li>
          <li>Please contact the buyer to arrange payment and delivery</li>
          <li>Complete the transaction as agreed</li>
        </ol>
        
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          Thank you for using AuctionHub!<br>
          If you have any questions, please contact our support team.
        </p>
      </div>
    `;

    // Send emails to both buyer and seller
    const buyerResult = await this.sendEmail(buyer.email, subject, buyerHtml);
    const sellerResult = await this.sendEmail(seller.email, `✅ Sale Confirmed - ${auction.itemName}`, sellerHtml);

    return { buyerResult, sellerResult };
  }

  async sendBidRejectedEmail(buyer, auction, bidAmount) {
    const subject = `Your bid was not accepted - ${auction.itemName}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #dc2626;">Bid Not Accepted</h1>
        
        <p>Dear ${buyer.name},</p>
        
        <p>We regret to inform you that your bid on <strong>${auction.itemName}</strong> was not accepted by the seller.</p>
        
        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <h3 style="margin-top: 0;">Bid Details</h3>
          <p><strong>Item:</strong> ${auction.itemName}</p>
          <p><strong>Your Bid:</strong> $${bidAmount}</p>
          <p><strong>Status:</strong> Not Accepted</p>
        </div>
        
        <p>Don't worry! There are many other great items available for auction. Feel free to browse our current listings and place bids on items that interest you.</p>
        
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          Thank you for using AuctionHub!<br>
          If you have any questions, please contact our support team.
        </p>
      </div>
    `;

    return await this.sendEmail(buyer.email, subject, html);
  }

  async sendCounterOfferEmail(buyer, auction, originalBid, counterAmount) {
    const subject = `Counter-offer received - ${auction.itemName}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #f59e0b;">Counter-Offer Received!</h1>
        
        <p>Dear ${buyer.name},</p>
        
        <p>Great news! The seller has made a counter-offer on your bid for <strong>${auction.itemName}</strong>.</p>
        
        <div style="background: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <h3 style="margin-top: 0;">Counter-Offer Details</h3>
          <p><strong>Item:</strong> ${auction.itemName}</p>
          <p><strong>Your Original Bid:</strong> $${originalBid}</p>
          <p><strong>Seller's Counter-Offer:</strong> $${counterAmount}</p>
        </div>
        
        <h3>What happens next?</h3>
        <p>You can:</p>
        <ul>
          <li><strong>Accept</strong> the counter-offer and proceed with the purchase</li>
          <li><strong>Reject</strong> the counter-offer and end the negotiation</li>
        </ul>
        
        <p>Please log into your AuctionHub account to respond to this counter-offer.</p>
        
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          Thank you for using AuctionHub!<br>
          This counter-offer will expire in 24 hours if not responded to.
        </p>
      </div>
    `;

    return await this.sendEmail(buyer.email, subject, html);
  }

  async sendCounterOfferResponseEmail(seller, buyer, auction, counterAmount, response) {
    const isAccepted = response === 'accepted';
    const subject = `Counter-offer ${isAccepted ? 'accepted' : 'rejected'} - ${auction.itemName}`;
    
    const color = isAccepted ? '#10b981' : '#dc2626';
    const bgColor = isAccepted ? '#f0fdf4' : '#fef2f2';
    
    const sellerHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: ${color};">Counter-offer ${isAccepted ? 'Accepted!' : 'Rejected'}</h1>
        
        <p>Dear Seller,</p>
        
        <p>The buyer ${buyer.name} has <strong>${response}</strong> your counter-offer for <strong>${auction.itemName}</strong>.</p>
        
        <div style="background: ${bgColor}; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${color};">
          <h3 style="margin-top: 0;">Transaction Details</h3>
          <p><strong>Item:</strong> ${auction.itemName}</p>
          <p><strong>Counter-offer Amount:</strong> $${counterAmount}</p>
          <p><strong>Buyer:</strong> ${buyer.name}</p>
          <p><strong>Status:</strong> ${isAccepted ? 'Sale Confirmed' : 'No Sale'}</p>
        </div>
        
        ${isAccepted ? `
          <h3>Next Steps:</h3>
          <ol>
            <li>You will receive an invoice shortly</li>
            <li>Contact the buyer to arrange payment and delivery</li>
            <li>Buyer Contact: ${buyer.email}</li>
          </ol>
        ` : `
          <p>The negotiation has ended. You may choose to relist the item or accept other bids if available.</p>
        `}
        
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          Thank you for using AuctionHub!
        </p>
      </div>
    `;

    return await this.sendEmail(seller.email, subject, sellerHtml);
  }

  async sendInvoiceEmail(userEmail, userName, auction, amount, isSellerInvoice = false) {
    const invoiceId = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const invoiceDate = new Date().toLocaleDateString();
    
    const subject = `Invoice for ${auction.itemName} - ${invoiceId}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; padding: 20px; background: #f8fafc; border-bottom: 3px solid #2563eb;">
          <h1 style="color: #2563eb; margin: 0;">AuctionHub Invoice</h1>
          <p style="margin: 5px 0; color: #6b7280;">Invoice #${invoiceId}</p>
        </div>
        
        <div style="padding: 30px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
            <div>
              <h3>Bill To:</h3>
              <p><strong>${userName}</strong><br>
              ${userEmail}</p>
            </div>
            <div style="text-align: right;">
              <h3>Invoice Details:</h3>
              <p><strong>Date:</strong> ${invoiceDate}<br>
              <strong>Type:</strong> ${isSellerInvoice ? 'Sale Receipt' : 'Purchase Invoice'}</p>
            </div>
          </div>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background: #f8fafc;">
                <th style="border: 1px solid #e5e7eb; padding: 12px; text-align: left;">Description</th>
                <th style="border: 1px solid #e5e7eb; padding: 12px; text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="border: 1px solid #e5e7eb; padding: 12px;">
                  <strong>${auction.itemName}</strong><br>
                  <small style="color: #6b7280;">${auction.description}</small><br>
                  <small style="color: #6b7280;">${isSellerInvoice ? 'Sale of item' : 'Purchase of item'}</small>
                </td>
                <td style="border: 1px solid #e5e7eb; padding: 12px; text-align: right;">
                  <strong>$${amount}</strong>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr style="background: #f8fafc;">
                <td style="border: 1px solid #e5e7eb; padding: 12px; text-align: right;"><strong>Total:</strong></td>
                <td style="border: 1px solid #e5e7eb; padding: 12px; text-align: right;"><strong>$${amount}</strong></td>
              </tr>
            </tfoot>
          </table>
          
          <div style="margin-top: 30px; padding: 20px; background: #f0f9ff; border-radius: 8px;">
            <h4 style="margin-top: 0;">Important Notes:</h4>
            <ul style="margin: 0;">
              <li>This invoice is for record-keeping purposes</li>
              <li>Payment arrangement should be made directly between buyer and seller</li>
              <li>AuctionHub facilitates the auction but is not responsible for payment processing</li>
              ${isSellerInvoice ? 
                '<li>Please ensure you deliver the item as described</li>' : 
                '<li>Please ensure payment is made as agreed with the seller</li>'
              }
            </ul>
          </div>
        </div>
        
        <div style="text-align: center; padding: 20px; background: #f8fafc; color: #6b7280; font-size: 14px;">
          <p>Thank you for using AuctionHub!<br>
          For support, contact us at support@auctionhub.com</p>
        </div>
      </div>
    `;

    // Force sending invoice emails even in development mode
    return await this.sendEmail(userEmail, subject, html, null, true);
  }
}

module.exports = new EmailService();
