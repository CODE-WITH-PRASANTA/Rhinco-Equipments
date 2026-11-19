import { jsPDF } from "jspdf";

/**
 * Loads the company logo from /logo.png as a Base64 data URL
 */
const loadLogoBase64 = async () => {
  try {
    const res = await fetch("/logo.png");
    if (!res.ok) return null;
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    return null;
  }
};

/**
 * Formats a number to Indian Rupee currency format (without currency symbol for PDF text)
 */
const formatCurrency = (val) => {
  const num = Number(val || 0);
  return num.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
};

/**
 * Generates and downloads an executive Tax Invoice PDF for an order
 * @param {Object} order - Full order object from MongoDB
 */
export const downloadOrderInvoicePdf = async (order) => {
  if (!order) return;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182mm

  // Fetch logo
  const logoData = await loadLogoBase64();

  // 1. Top Decorative Brand Bar
  doc.setFillColor(22, 101, 52); // #166534
  doc.rect(0, 0, pageWidth, 7, "F");

  let y = 14;

  // 2. Header: Logo & Company Information
  if (logoData) {
    try {
      doc.addImage(logoData, "PNG", margin, y, 22, 22);
    } catch (err) {
      console.warn("Could not render logo in PDF:", err);
    }
  }

  const companyLeft = logoData ? margin + 26 : margin;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(22, 101, 52);
  doc.text("RHINO'S EQUIPMENT", companyLeft, y + 5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text("FarmTech Agro India Private Limited", companyLeft, y + 10);
  doc.text("Plot 42, Kisan Udyog Tech Park, Pune, Maharashtra - 411001", companyLeft, y + 14);
  doc.text("GSTIN: 27AABCR9876F1Z8 | CIN: U01409MH2021PTC123456", companyLeft, y + 18);
  doc.text("Helpline: +91 98765 43210 | Web: www.farmtechagro.in", companyLeft, y + 22);

  // Top Right: Tax Invoice Title Box
  doc.setFillColor(240, 253, 244); // #f0fdf4
  doc.setDrawColor(187, 247, 208); // #bbf7d0
  doc.roundedRect(pageWidth - margin - 58, y, 58, 22, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(22, 101, 52);
  doc.text("ORIGINAL TAX INVOICE", pageWidth - margin - 54, y + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("Agricultural Machinery & Equipment", pageWidth - margin - 54, y + 10);

  const invNum = order.invoiceNumber || `INV-${order.orderId}`;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`Invoice #: ${invNum}`, pageWidth - margin - 54, y + 15);

  const invDate = order.deliveredAt
    ? new Date(order.deliveredAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : new Date(order.createdAt || Date.now()).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Dated: ${invDate}`, pageWidth - margin - 54, y + 19);

  y += 28;

  // 3. Horizontal Divider
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageWidth - margin, y);
  y += 5;

  // 4. Two-Column Metadata Box: (Order & Payment Info) + (Customer & Delivery Info)
  const colWidth = (contentWidth - 6) / 2;
  const infoBoxHeight = 36;

  // Left Box: Order & Payment
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, colWidth, infoBoxHeight, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(22, 101, 52);
  doc.text("ORDER & PAYMENT REFERENCE", margin + 4, y + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);

  doc.text("Order ID:", margin + 4, y + 12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(String(order.orderId || "N/A"), margin + 28, y + 12);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text("Payment Mode:", margin + 4, y + 17);
  doc.text(String(order.paymentMethod || "Razorpay Online"), margin + 28, y + 17);

  doc.text("Transaction Ref:", margin + 4, y + 22);
  const payId = order.razorpayPaymentId || "Verified Online";
  doc.text(String(payId).slice(0, 26), margin + 28, y + 22);

  doc.text("Payment Status:", margin + 4, y + 27);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(22, 101, 52);
  doc.text("PAID & CONFIRMED", margin + 28, y + 27);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text("Order Status:", margin + 4, y + 32);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(String(order.orderStatus || "Delivered"), margin + 28, y + 32);

  // Right Box: Customer & Delivery Address
  const rightColX = margin + colWidth + 6;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(rightColX, y, colWidth, infoBoxHeight, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(22, 101, 52);
  doc.text("BILLED & SHIPPED TO", rightColX + 4, y + 6);

  const customerName = order.user?.name || order.deliveryAddress?.name || "Valued Customer";
  const customerPhone = order.user?.phone || order.deliveryAddress?.phone || "N/A";
  const customerEmail = order.user?.email || "";

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(customerName, rightColX + 4, y + 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Phone: ${customerPhone}`, rightColX + 4, y + 16.5);

  if (customerEmail) {
    doc.text(`Email: ${customerEmail}`, rightColX + 4, y + 21);
  }

  const addr = order.deliveryAddress;
  const addressLine1 = addr
    ? [addr.village, addr.district].filter(Boolean).join(", ")
    : "Delivery Address on File";
  const addressLine2 = addr
    ? `${addr.state || ""} - ${addr.pincode || ""}`.trim()
    : "";

  doc.text(addressLine1, rightColX + 4, y + 25.5);
  doc.text(addressLine2, rightColX + 4, y + 30);

  y += infoBoxHeight + 8;

  // 5. Items Table Header
  const colX = {
    sr: margin,
    desc: margin + 10,
    cat: margin + 92,
    qty: margin + 130,
    rate: margin + 148,
    amount: margin + 168,
  };

  doc.setFillColor(22, 101, 52);
  doc.rect(margin, y, contentWidth, 8, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);

  doc.text("#", colX.sr + 2, y + 5.5);
  doc.text("Product Description", colX.desc + 2, y + 5.5);
  doc.text("Category", colX.cat + 2, y + 5.5);
  doc.text("Qty", colX.qty + 2, y + 5.5);
  doc.text("Rate (INR)", colX.rate + 2, y + 5.5);
  doc.text("Total (INR)", colX.amount + 2, y + 5.5);

  y += 8;

  // 6. Items Table Body
  const items = Array.isArray(order.items) && order.items.length > 0 ? order.items : [];

  items.forEach((item, index) => {
    const isEven = index % 2 === 0;
    const rowHeight = 10;

    if (isEven) {
      doc.setFillColor(255, 255, 255);
    } else {
      doc.setFillColor(248, 250, 252);
    }
    doc.rect(margin, y, contentWidth, rowHeight, "F");

    // Bottom border line
    doc.setDrawColor(241, 245, 249);
    doc.line(margin, y + rowHeight, margin + contentWidth, y + rowHeight);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);

    doc.text(String(index + 1), colX.sr + 2, y + 6.5);

    // Title truncated or split
    const itemTitle = String(item.title || item.name || "Agri Equipment");
    const safeTitle = itemTitle.length > 42 ? itemTitle.slice(0, 40) + "..." : itemTitle;
    doc.setFont("helvetica", "bold");
    doc.text(safeTitle, colX.desc + 2, y + 6.5);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    const cat = String(item.category || "Implement").slice(0, 18);
    doc.text(cat, colX.cat + 2, y + 6.5);

    doc.setTextColor(15, 23, 42);
    doc.text(String(item.quantity || 1), colX.qty + 4, y + 6.5);

    const price = Number(item.price || 0);
    doc.text(formatCurrency(price), colX.rate + 2, y + 6.5);

    const rowTotal = price * Number(item.quantity || 1);
    doc.setFont("helvetica", "bold");
    doc.text(formatCurrency(rowTotal), colX.amount + 2, y + 6.5);

    y += rowHeight;
  });

  // Table outer border
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.line(margin, y, margin + contentWidth, y);

  y += 6;

  // 7. Financial Totals & Summary
  const summaryBoxWidth = 72;
  const summaryBoxX = pageWidth - margin - summaryBoxWidth;
  const summaryBoxY = y;
  const summaryBoxHeight = 36;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(summaryBoxX, summaryBoxY, summaryBoxWidth, summaryBoxHeight, 2, 2, "FD");

  const subtotal = Number(order.subtotal || order.totalAmount || 0);
  const discount = Number(order.discount || 0);
  const grandTotal = Number(order.totalAmount || subtotal - discount);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);

  doc.text("Subtotal:", summaryBoxX + 4, summaryBoxY + 7);
  doc.text(`INR ${formatCurrency(subtotal)}`, summaryBoxX + summaryBoxWidth - 4, summaryBoxY + 7, { align: "right" });

  if (discount > 0) {
    doc.setTextColor(22, 101, 52);
    doc.text("Discount Applied:", summaryBoxX + 4, summaryBoxY + 13);
    doc.text(`- INR ${formatCurrency(discount)}`, summaryBoxX + summaryBoxWidth - 4, summaryBoxY + 13, { align: "right" });
  }

  doc.setTextColor(71, 85, 105);
  doc.text("GST & Delivery:", summaryBoxX + 4, summaryBoxY + 19);
  doc.text("INCLUDED (0.00)", summaryBoxX + summaryBoxWidth - 4, summaryBoxY + 19, { align: "right" });

  doc.setDrawColor(203, 213, 225);
  doc.line(summaryBoxX + 4, summaryBoxY + 23, summaryBoxX + summaryBoxWidth - 4, summaryBoxY + 23);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(22, 101, 52);
  doc.text("Total Paid:", summaryBoxX + 4, summaryBoxY + 30);
  doc.text(`INR ${formatCurrency(grandTotal)}`, summaryBoxX + summaryBoxWidth - 4, summaryBoxY + 30, { align: "right" });

  // Left of Summary: Terms & Verified Seal
  const leftNotesX = margin;
  const leftNotesY = y + 2;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text("DECLARATION & TERMS:", leftNotesX, leftNotesY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("1. All implements & spares covered under 1-year manufacturer warranty.", leftNotesX, leftNotesY + 5);
  doc.text("2. Payment received in full through authorized secure Razorpay gateway.", leftNotesX, leftNotesY + 9.5);
  doc.text("3. This is a system-generated electronic tax invoice and needs no physical signature.", leftNotesX, leftNotesY + 14);

  // Authenticity Seal
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(leftNotesX, leftNotesY + 18, 64, 12, 1.5, 1.5, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(22, 101, 52);
  doc.text("✓ VERIFIED DIGITAL RECEIPT", leftNotesX + 4, leftNotesY + 23.5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);
  doc.text("FarmTech Agro Certified Equipment", leftNotesX + 4, leftNotesY + 27.5);

  // 8. Footer
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(
    "Thank you for farming with Rhino's Equipment! Questions? Call support: +91 98765 43210 or email farmershelpline.in@gmail.com",
    margin,
    pageHeight - 8
  );
  doc.text(
    `Page 1 of 1`,
    pageWidth - margin,
    pageHeight - 8,
    { align: "right" }
  );

  // 9. Save PDF directly to user's device
  const cleanId = String(order.orderId || "Order").replace(/[^a-zA-Z0-9-_]/g, "");
  doc.save(`Invoice-${cleanId}.pdf`);
};

export default downloadOrderInvoicePdf;
