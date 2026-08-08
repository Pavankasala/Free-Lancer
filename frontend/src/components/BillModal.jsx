import React, { useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "../styles/modal.css";

function BillModal({ bill, onClose }) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [copiedStatus, setCopiedStatus] = useState("");
  const [recipientMobile, setRecipientMobile] = useState(
    bill?.mobile || bill?.mobileNo || ""
  );

  if (!bill) return null;

  const farmerName = bill.kisanName || bill.name || "Kisan";

  // Total Bags Calculation
  const totalBagsCount =
    bill.channels && bill.channels.length > 0
      ? bill.channels.reduce((acc, c) => acc + (Number(c.bags) || 0), 0)
      : Number(bill.bags || bill.no_of_bags) || 0;

  // Financial Breakdown calculations
  const grossTotal = Number(bill.total || (bill.no_of_bags * bill.price)) || 0;
  const hamaliVal =
    bill.hamali !== undefined
      ? Number(bill.hamali)
      : totalBagsCount * 5;
  const commissionVal =
    bill.commission !== undefined
      ? Number(bill.commission)
      : Math.round(grossTotal * 0.04);
  const damagedGoodsVal =
    bill.damagedGoods !== undefined
      ? Number(bill.damagedGoods)
      : Math.round(grossTotal * 0.05);
  const advanceVal = Number(bill.advance) || 0;
  const advanceDateTime =
    bill.advanceDateTime || bill.advanceTime
      ? `${bill.date || "2026-05-29"} ${bill.advanceTime || "10:30 AM"}`
      : bill.date || "2026-05-29";

  const computedNet =
    grossTotal - hamaliVal - commissionVal - damagedGoodsVal - advanceVal;
  const netPayable =
    bill.netTotal !== undefined && !bill.damagedGoods
      ? bill.netTotal - damagedGoodsVal
      : Math.max(0, computedNet);

  // PDF Export Feature
  const handleDownloadPDF = async () => {
    const element = document.getElementById("printable-bill");
    if (!element) return;

    setIsDownloading(true);
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);

      const filename = `Invoice_ILC_${farmerName}_${bill.id || "101"}.pdf`;
      pdf.save(filename);
    } catch (err) {
      console.error("Error generating PDF invoice:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  // SMS Generation per channel
  const handleSendChannelSMS = (ch, idx) => {
    const text = `Hi ${farmerName}, Channel ${idx + 1}: ${ch.bags} Bags @ Rs.${
      ch.price
    }/bag = Total Rs.${ch.bags * ch.price} (${
      ch.date || bill.date || "2026-05-29"
    }). --- I.L.C.`;

    navigator.clipboard.writeText(text);

    if (recipientMobile) {
      setCopiedStatus(`✓ Channel ${idx + 1} SMS ready for ${recipientMobile}!`);
      window.open(
        `sms:${recipientMobile}?body=${encodeURIComponent(text)}`,
        "_self"
      );
    } else {
      setCopiedStatus(`✓ Channel ${idx + 1} SMS text copied to clipboard!`);
    }

    setTimeout(() => setCopiedStatus(""), 4000);
  };

  // SMS Generation for Full Invoice
  const handleSendFullSMS = () => {
    let channelBreakdown = "";
    if (bill.channels && bill.channels.length > 0) {
      channelBreakdown = bill.channels
        .map((ch, idx) => `Ch ${idx + 1}: ${ch.bags} Bags @ Rs.${ch.price}`)
        .join("\n");
    } else {
      channelBreakdown = `Total: ${totalBagsCount} Bags @ Rs.${bill.price || 0}`;
    }

    const text = `Hi ${farmerName}, Invoice ILC-${bill.id || 101} (${
      bill.date || "2026-05-29"
    })\nTotal Bags: ${totalBagsCount}\n${channelBreakdown}\nGross: Rs.${grossTotal}\nDamaged Goods (5%): -Rs.${damagedGoodsVal}\nNet Payable: Rs.${netPayable}\n--- INDIAN LEMON COMPANY`;

    navigator.clipboard.writeText(text);

    if (recipientMobile) {
      setCopiedStatus(`✓ Full Invoice SMS ready for ${recipientMobile}!`);
      window.open(
        `sms:${recipientMobile}?body=${encodeURIComponent(text)}`,
        "_self"
      );
    } else {
      setCopiedStatus("✓ Full Invoice SMS text copied to clipboard!");
    }

    setTimeout(() => setCopiedStatus(""), 4000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <h2 style={{ fontSize: "1.2rem", margin: 0, color: "#1e293b" }}>Invoice Receipt - INDIAN LEMON COMPANY</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        {copiedStatus && (
          <div
            className="badge badge-success margin-bottom"
            style={{ display: "block", textAlign: "center", marginBottom: "10px", backgroundColor: "#dcfce7", color: "#166534", padding: "6px", borderRadius: "6px", fontWeight: "bold" }}
          >
            {copiedStatus}
          </div>
        )}

        {/* Printable Bill Area */}
        <div className="bill-receipt-body" id="printable-bill" style={{ padding: "16px", backgroundColor: "#ffffff" }}>
          <div className="receipt-header" style={{ textAlign: "center", marginBottom: "12px" }}>
            <h3 style={{ margin: 0, color: "#1e3a8a", fontSize: "1.3rem" }}>INDIAN LEMON COMPANY</h3>
            <p className="receipt-sub" style={{ margin: "4px 0", fontSize: "0.85rem", color: "#475569" }}>
              LEMON & FRUIT EXPORTS COMMISSION AGENT, NAKREKAL
            </p>
            <p className="receipt-contact" style={{ margin: 0, fontSize: "0.85rem", fontWeight: "bold", color: "#334155" }}>
              Prop: S. VENKAT REDDY | Ph: 9676886374
            </p>
          </div>

          <hr className="divider-line" style={{ border: "none", borderTop: "1px solid #cbd5e1", margin: "12px 0" }} />

          <div className="receipt-meta" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "0.9rem", marginBottom: "12px" }}>
            <div>
              <span>Receipt No:</span> <strong>ILC-{bill.id || 101}</strong>
            </div>
            <div>
              <span>Date:</span> <strong>{bill.date || "2026-05-29"}</strong>
            </div>
            <div>
              <span>Farmer Name:</span> <strong>{farmerName}</strong>
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <span>Mobile No:</span>
              <input
                type="text"
                placeholder="Enter Mobile No."
                value={recipientMobile}
                onChange={(e) => setRecipientMobile(e.target.value)}
                style={{
                  padding: "4px 8px",
                  fontSize: "0.88rem",
                  borderRadius: "4px",
                  border: "1px solid #cbd5e1",
                  width: "140px",
                  marginLeft: "6px",
                  fontWeight: "bold",
                }}
              />
            </div>
          </div>

          {/* Quality Lots / Channels Breakdown */}
          <table className="data-table receipt-table margin-top" style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", margin: "12px 0" }}>
            <thead>
              <tr style={{ backgroundColor: "#f1f5f9", color: "#1e293b" }}>
                <th style={{ border: "1px solid #cbd5e1", padding: "6px" }}>Channel / Description</th>
                <th style={{ border: "1px solid #cbd5e1", padding: "6px" }}>Bags</th>
                <th style={{ border: "1px solid #cbd5e1", padding: "6px" }}>Price / Bag</th>
                <th style={{ border: "1px solid #cbd5e1", padding: "6px" }}>Date</th>
                <th style={{ border: "1px solid #cbd5e1", padding: "6px" }}>Total (₹)</th>
                <th style={{ border: "1px solid #cbd5e1", padding: "6px" }}>Send SMS</th>
              </tr>
            </thead>
            <tbody>
              {bill.channels && bill.channels.length > 0 ? (
                bill.channels.map((ch, idx) => (
                  <tr key={idx}>
                    <td style={{ border: "1px solid #cbd5e1", padding: "6px" }}>Channel {idx + 1}</td>
                    <td style={{ border: "1px solid #cbd5e1", padding: "6px", textAlign: "center" }}>{ch.bags}</td>
                    <td style={{ border: "1px solid #cbd5e1", padding: "6px", textAlign: "center" }}>₹{ch.price}</td>
                    <td style={{ border: "1px solid #cbd5e1", padding: "6px", textAlign: "center" }}>{ch.date || bill.date || "2026-05-29"}</td>
                    <td style={{ border: "1px solid #cbd5e1", padding: "6px", textAlign: "right" }}>₹{(ch.bags * ch.price).toLocaleString()}</td>
                    <td style={{ border: "1px solid #cbd5e1", padding: "6px", textAlign: "center" }}>
                      <button
                        type="button"
                        className="small-action-btn"
                        onClick={() => handleSendChannelSMS(ch, idx)}
                        style={{ padding: "3px 8px", fontSize: "0.75rem", cursor: "pointer", borderRadius: "4px", border: "1px solid #2563eb", backgroundColor: "#eff6ff", color: "#1d4ed8" }}
                      >
                        📱 Send SMS
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td style={{ border: "1px solid #cbd5e1", padding: "6px" }}>Lemon Bags Lot</td>
                  <td style={{ border: "1px solid #cbd5e1", padding: "6px", textAlign: "center" }}>{bill.bags || bill.no_of_bags || 1}</td>
                  <td style={{ border: "1px solid #cbd5e1", padding: "6px", textAlign: "center" }}>₹{bill.price || (grossTotal / (bill.no_of_bags || 1))}</td>
                  <td style={{ border: "1px solid #cbd5e1", padding: "6px", textAlign: "center" }}>{bill.date || "2026-05-29"}</td>
                  <td style={{ border: "1px solid #cbd5e1", padding: "6px", textAlign: "right" }}>₹{grossTotal.toLocaleString()}</td>
                  <td style={{ border: "1px solid #cbd5e1", padding: "6px", textAlign: "center" }}>
                    <button
                      type="button"
                      className="small-action-btn"
                      onClick={() =>
                        handleSendChannelSMS(
                          {
                            bags: bill.bags || bill.no_of_bags,
                            price: bill.price || grossTotal,
                            date: bill.date,
                          },
                          0
                        )
                      }
                      style={{ padding: "3px 8px", fontSize: "0.75rem", cursor: "pointer", borderRadius: "4px", border: "1px solid #2563eb", backgroundColor: "#eff6ff", color: "#1d4ed8" }}
                    >
                      📱 Send SMS
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Summary Breakdown */}
          <div className="receipt-summary margin-top" style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "0.88rem", marginTop: "12px", borderTop: "1px dashed #cbd5e1", paddingTop: "8px" }}>
            <div className="summary-row highlight-total" style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
              <span>Total Bags:</span>
              <strong>{totalBagsCount} Bags</strong>
            </div>

            <div className="summary-row margin-top" style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Gross Total:</span>
              <strong>₹{grossTotal.toLocaleString()}</strong>
            </div>

            <div className="summary-row" style={{ display: "flex", justifyContent: "space-between", color: "#dc2626" }}>
              <span>Hamali Deduction:</span>
              <span>- ₹{hamaliVal.toLocaleString()}</span>
            </div>

            <div className="summary-row" style={{ display: "flex", justifyContent: "space-between", color: "#dc2626" }}>
              <span>Commission (4%):</span>
              <span>- ₹{commissionVal.toLocaleString()}</span>
            </div>

            <div className="summary-row" style={{ display: "flex", justifyContent: "space-between", color: "#dc2626" }}>
              <span>Damaged Goods (5%):</span>
              <span>- ₹{damagedGoodsVal.toLocaleString()}</span>
            </div>

            {advanceVal > 0 && (
              <div className="summary-row" style={{ display: "flex", justifyContent: "space-between", color: "#dc2626" }}>
                <span>Advance ({advanceDateTime}):</span>
                <span>- ₹{advanceVal.toLocaleString()}</span>
              </div>
            )}

            <div className="summary-row highlight-net" style={{ display: "flex", justifyContent: "space-between", fontSize: "1.05rem", fontWeight: "bold", borderTop: "2px solid #1e293b", paddingTop: "6px", marginTop: "6px", color: "#166534" }}>
              <span>Net Payable Amount:</span>
              <strong>₹{netPayable.toLocaleString()}</strong>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="modal-actions" style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end", marginTop: "16px" }}>
          <button
            type="button"
            className="secondary-btn"
            onClick={handleSendFullSMS}
            style={{ padding: "8px 14px", borderRadius: "6px", border: "1px solid #cbd5e1", backgroundColor: "#f8fafc", cursor: "pointer", fontWeight: "bold" }}
          >
            📱 Send Full SMS
          </button>
          <button
            type="button"
            className="primary-btn"
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            style={{ padding: "8px 14px", borderRadius: "6px", border: "none", backgroundColor: "#2563eb", color: "#ffffff", cursor: "pointer", fontWeight: "bold" }}
          >
            {isDownloading ? "⏳ Generating PDF..." : "📄 Download PDF Invoice"}
          </button>
          <button
            type="button"
            className="secondary-btn"
            onClick={() => window.print()}
            style={{ padding: "8px 14px", borderRadius: "6px", border: "1px solid #cbd5e1", backgroundColor: "#f8fafc", cursor: "pointer", fontWeight: "bold" }}
          >
            🖨️ Print Bill
          </button>
          <button
            type="button"
            className="secondary-btn"
            onClick={onClose}
            style={{ padding: "8px 14px", borderRadius: "6px", border: "1px solid #cbd5e1", backgroundColor: "#ef4444", color: "#ffffff", cursor: "pointer", fontWeight: "bold" }}
          >
            ❌ Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default BillModal;
