import jsPDF from 'jspdf';
import dayjs from 'dayjs';

interface AuctionData {
  id: string;
  itemName: string;
  description: string;
  startPrice: string;
  currentBid?: string;
  bidIncrement: string;
  category?: string;
  goLiveAt: string;
  durationMins: number;
  status: string;
  seller?: {
    id: string;
    name: string;
    email?: string;
  };
  highestBid?: {
    amount: string;
    bidder?: {
      name: string;
      email?: string;
    };
  };
}

interface BidData {
  id: string;
  amount: string;
  createdAt: string;
  bidder?: {
    id?: string;
    name: string;
    email?: string;
  };
}

interface UserData {
  id: string;
  name: string;
  email?: string;
  role: string;
}

export function generateAuctionInvoice(
  auction: AuctionData,
  bids: BidData[],
  currentUser: UserData,
  winningBid?: BidData
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  
  // Company Header
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("Real-Time Auctions", pageWidth / 2, 30, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Professional Auction Services", pageWidth / 2, 40, { align: 'center' });
  
  // Draw header line
  doc.setLineWidth(0.5);
  doc.line(20, 50, pageWidth - 20, 50);
  
  // Invoice Title
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  const isSellerInvoice = currentUser.id === auction.seller?.id;
  const isBuyer = !isSellerInvoice && winningBid && winningBid.bidder && 
    (winningBid.bidder.id === currentUser.id || winningBid.bidder.name === currentUser.name);
  
  let invoiceTitle = "AUCTION INVOICE";
  if (isSellerInvoice) {
    invoiceTitle = "SELLER INVOICE";
  } else if (isBuyer && auction.status === "sold") {
    invoiceTitle = "BUYER INVOICE";
  } else {
    invoiceTitle = "BIDDING RECEIPT";
  }
  
  doc.text(invoiceTitle, pageWidth / 2, 65, { align: 'center' });
  
  // Invoice Details
  let yPos = 85;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  
  // Invoice Info Box
  doc.rect(20, yPos, pageWidth - 40, 35);
  doc.setFont("helvetica", "bold");
  doc.text("Invoice Information", 25, yPos + 10);
  doc.setFont("helvetica", "normal");
  
  const invoiceDate = dayjs().format('MMM D, YYYY');
  const invoiceNumber = `INV-${auction.id.substring(0, 8)}-${dayjs().format('YYMMDD')}`;
  
  // Split long text to avoid overflow
  const invoiceNumberLines = doc.splitTextToSize(`Invoice #: ${invoiceNumber}`, pageWidth - 50);
  doc.text(invoiceNumberLines, 25, yPos + 20);
  
  doc.text(`Date: ${invoiceDate}`, 25, yPos + 27);
  doc.text(`Auction: ${auction.id.substring(0, 12)}...`, pageWidth - 85, yPos + 20);
  doc.text(`Status: ${auction.status.toUpperCase()}`, pageWidth - 85, yPos + 27);
  
  yPos += 50;
  
  // Customer Information
  doc.rect(20, yPos, (pageWidth - 50) / 2, 50);
  doc.setFont("helvetica", "bold");
  let customerTitle = "Customer Information";
  if (isSellerInvoice) {
    customerTitle = "Seller Information";
  } else if (isBuyer) {
    customerTitle = "Buyer Information";
  } else {
    customerTitle = "Bidder Information";
  }
  doc.text(customerTitle, 25, yPos + 10);
  doc.setFont("helvetica", "normal");
  doc.text(`Name: ${currentUser.name}`, 25, yPos + 20);
  if (currentUser.email) {
    const emailLines = doc.splitTextToSize(`Email: ${currentUser.email}`, (pageWidth - 50) / 2 - 10);
    doc.text(emailLines, 25, yPos + 27);
  }
  doc.text(`Role: ${currentUser.role.toUpperCase()}`, 25, yPos + 34);
  const userIdLines = doc.splitTextToSize(`ID: ${currentUser.id.substring(0, 16)}...`, (pageWidth - 50) / 2 - 10);
  doc.text(userIdLines, 25, yPos + 41);
  
  // Auction Information
  const rightBoxX = pageWidth / 2 + 5;
  doc.rect(rightBoxX, yPos, (pageWidth - 50) / 2, 50);
  doc.setFont("helvetica", "bold");
  doc.text("Auction Details", rightBoxX + 5, yPos + 10);
  doc.setFont("helvetica", "normal");
  
  const itemLines = doc.splitTextToSize(`Item: ${auction.itemName}`, (pageWidth - 50) / 2 - 10);
  doc.text(itemLines, rightBoxX + 5, yPos + 20);
  
  doc.text(`Category: ${auction.category || 'General'}`, rightBoxX + 5, yPos + 27);
  doc.text(`Start: ${dayjs(auction.goLiveAt).format('MMM D, YYYY')}`, rightBoxX + 5, yPos + 34);
  doc.text(`Duration: ${auction.durationMins}min`, rightBoxX + 5, yPos + 41);
  
  yPos += 65;
  
  // Item Description
  doc.setFont("helvetica", "bold");
  doc.text("Item Description:", 20, yPos);
  yPos += 7;
  doc.setFont("helvetica", "normal");
  
  // Split description into lines
  const descLines = doc.splitTextToSize(auction.description, pageWidth - 40);
  doc.text(descLines, 20, yPos);
  yPos += descLines.length * 5 + 10;
  
  // Financial Summary
  doc.rect(20, yPos, pageWidth - 40, 80);
  doc.setFont("helvetica", "bold");
  doc.text("Financial Summary", 25, yPos + 10);
  
  yPos += 20;
  doc.setFont("helvetica", "normal");
  
  const startPrice = parseFloat(auction.startPrice);
  const finalAmount = winningBid ? parseFloat(winningBid.amount) : parseFloat(auction.currentBid || auction.startPrice);
  const bidIncrement = parseFloat(auction.bidIncrement);
  
  // Financial details
  doc.text(`Starting Price:`, 25, yPos);
  doc.text(`$${startPrice.toFixed(2)}`, pageWidth - 50, yPos);
  
  yPos += 7;
  doc.text(`Bid Increment:`, 25, yPos);
  doc.text(`$${bidIncrement.toFixed(2)}`, pageWidth - 50, yPos);
  
  yPos += 7;
  doc.text(`Total Bids Placed:`, 25, yPos);
  doc.text(`${bids.length}`, pageWidth - 50, yPos);
  
  yPos += 7;
  if (auction.status === 'sold' && winningBid) {
    doc.setFont("helvetica", "bold");
    doc.text(`Final Sale Amount:`, 25, yPos);
    doc.text(`$${finalAmount.toFixed(2)}`, pageWidth - 50, yPos);
    
    if (isSellerInvoice) {
      yPos += 10;
      const commission = finalAmount * 0.05; // 5% commission
      doc.setFont("helvetica", "normal");
      doc.text(`Platform Commission (5%):`, 25, yPos);
      doc.text(`-$${commission.toFixed(2)}`, pageWidth - 50, yPos);
      
      yPos += 7;
      doc.setFont("helvetica", "bold");
      doc.text(`Net Amount (Seller):`, 25, yPos);
      doc.text(`$${(finalAmount - commission).toFixed(2)}`, pageWidth - 50, yPos);
    } else if (isBuyer) {
      yPos += 10;
      const processingFee = finalAmount * 0.025; // 2.5% processing fee for buyer
      doc.setFont("helvetica", "normal");
      doc.text(`Processing Fee (2.5%):`, 25, yPos);
      doc.text(`$${processingFee.toFixed(2)}`, pageWidth - 50, yPos);
      
      yPos += 7;
      doc.setFont("helvetica", "bold");
      doc.text(`Total Amount (Buyer):`, 25, yPos);
      doc.text(`$${(finalAmount + processingFee).toFixed(2)}`, pageWidth - 50, yPos);
    }
  } else {
    doc.text(`Current Highest Bid:`, 25, yPos);
    doc.text(`$${finalAmount.toFixed(2)}`, pageWidth - 50, yPos);
    
    if (!isSellerInvoice && bids.length > 0) {
      yPos += 10;
      const userBids = bids.filter(bid => 
        bid.bidder && (bid.bidder.id === currentUser.id || bid.bidder.name === currentUser.name)
      );
      const userHighestBid = userBids.length > 0 ? 
        Math.max(...userBids.map(bid => parseFloat(bid.amount))) : 0;
      
      doc.text(`Your Highest Bid:`, 25, yPos);
      doc.text(`$${userHighestBid.toFixed(2)}`, pageWidth - 50, yPos);
      
      yPos += 7;
      doc.text(`Your Total Bids:`, 25, yPos);
      doc.text(`${userBids.length}`, pageWidth - 50, yPos);
    }
  }
  
  yPos += 25;
  
  // Transaction Status
  doc.setFont("helvetica", "bold");
  doc.text("Transaction Status:", 25, yPos);
  yPos += 7;
  doc.setFont("helvetica", "normal");
  
  if (auction.status === 'sold' && winningBid) {
    if (isSellerInvoice) {
      doc.text("✓ Auction completed successfully. Awaiting payment processing.", 25, yPos);
    } else if (isBuyer) {
      doc.text("✓ Congratulations! You won this auction. Payment processing required.", 25, yPos);
    } else {
      doc.text("✗ Auction completed. You did not win this auction.", 25, yPos);
    }
  } else if (auction.status === 'closed_no_winner') {
    doc.text("✗ Auction ended with no winner. No payment required.", 25, yPos);
  } else {
    doc.text("⏳ Auction participation record. Final status pending.", 25, yPos);
  }
  
  // Footer
  yPos = pageHeight - 40;
  doc.setLineWidth(0.5);
  doc.line(20, yPos, pageWidth - 20, yPos);
  
  yPos += 10;
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("This is a computer-generated invoice. No signature required.", pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 7;
  doc.text(`Generated on ${dayjs().format('MMMM D, YYYY [at] h:mm A')}`, pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 7;
  doc.text("Real-Time Auctions - Professional Auction Services", pageWidth / 2, yPos, { align: 'center' });
  
  // Generate filename
  let userType = 'participant';
  if (isSellerInvoice) {
    userType = 'seller';
  } else if (isBuyer) {
    userType = 'buyer';
  } else {
    userType = 'bidder';
  }
  
  const filename = `auction-invoice-${userType}-${auction.id}-${dayjs().format('YYYYMMDD')}.pdf`;
  
  // Save the PDF
  doc.save(filename);
}

export function generateBidReceipt(
  auction: AuctionData,
  bid: BidData,
  currentUser: UserData
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  
  // Header
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("BID RECEIPT", pageWidth / 2, 30, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Real-Time Auctions", pageWidth / 2, 40, { align: 'center' });
  
  // Receipt details
  let yPos = 60;
  
  doc.setFont("helvetica", "bold");
  doc.text("Receipt Information", 20, yPos);
  yPos += 10;
  
  doc.setFont("helvetica", "normal");
  const receiptNumber = `BID-${bid.id.substring(0, 8)}-${dayjs().format('YYMMDD')}`;
  const receiptNumberLines = doc.splitTextToSize(`Receipt #: ${receiptNumber}`, pageWidth - 40);
  doc.text(receiptNumberLines, 20, yPos);
  yPos += 7;
  doc.text(`Date: ${dayjs(bid.createdAt).format('MMM D, YYYY [at] h:mm A')}`, 20, yPos);
  yPos += 15;
  
  doc.setFont("helvetica", "bold");
  doc.text("Bidder Information", 20, yPos);
  yPos += 10;
  
  doc.setFont("helvetica", "normal");
  doc.text(`Name: ${currentUser.name}`, 20, yPos);
  yPos += 7;
  if (currentUser.email) {
    const emailLines = doc.splitTextToSize(`Email: ${currentUser.email}`, pageWidth - 40);
    doc.text(emailLines, 20, yPos);
    yPos += 7;
  }
  const userIdLines = doc.splitTextToSize(`User ID: ${currentUser.id.substring(0, 20)}...`, pageWidth - 40);
  doc.text(userIdLines, 20, yPos);
  yPos += 15;
  
  doc.setFont("helvetica", "bold");
  doc.text("Auction Details", 20, yPos);
  yPos += 10;
  
  doc.setFont("helvetica", "normal");
  const itemLines = doc.splitTextToSize(`Item: ${auction.itemName}`, pageWidth - 40);
  doc.text(itemLines, 20, yPos);
  yPos += 7;
  const auctionIdLines = doc.splitTextToSize(`Auction ID: ${auction.id.substring(0, 20)}...`, pageWidth - 40);
  doc.text(auctionIdLines, 20, yPos);
  yPos += 15;
  
  doc.setFont("helvetica", "bold");
  doc.text("Bid Details", 20, yPos);
  yPos += 10;
  
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`Bid Amount: $${parseFloat(bid.amount).toFixed(2)}`, 20, yPos);
  
  const filename = `bid-receipt-${bid.id}-${dayjs().format('YYYYMMDD')}.pdf`;
  doc.save(filename);
}