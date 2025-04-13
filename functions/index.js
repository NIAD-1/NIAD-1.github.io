/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();

const transporter = nodemailer.createTransport({
  host: "mail.nafdac.gov.ng",
  port: 587,
  secure: false,
  auth: {
    user: "enilama.oshoriamhe@nafdac.gov.ng",
    pass: functions.config().email.password,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Workflow Email Trigger
exports.handleWorkflowUpdate = functions.firestore
  .document("audits/{auditId}")
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const currentUser = context.auth || { email: "system@nafdac.gov.ng" };

    if (before.status === after.status) return null;

    const latestStep = after.workflow.steps[after.workflow.steps.length - 1];
    let emailTemplate;
    let recipients = [];

    switch (after.status) {
    case "submitted_for_approval": {
      emailTemplate = {
        subject: `Audit Submitted for Approval - ${after.directorateUnit}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0;">
              <div style="background-color: #005f73; padding: 20px; color: white; text-align: center;">
                <h2 style="margin: 0;">NAFDAC QMS Internal Audit System</h2>
              </div>
              <div style="padding: 25px; background-color: #ffffff;">
                <h3 style="color: #005f73; margin-top: 0;">New Audit Requires Your Approval</h3>
                <p>Dear Lead Auditor,</p>
                <p>An audit has been submitted for your review and approval:</p>
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
                  <p style="margin: 5px 0;"><strong>Directorate/Unit:</strong> ${after.directorateUnit}</p>
                  <p style="margin: 5px 0;"><strong>Reference No:</strong> ${after.refNo || "N/A"}</p>
                  <p style="margin: 5px 0;"><strong>Submitted by:</strong> ${after.createdByEmail}</p>
                  <p style="margin: 5px 0;"><strong>Date Submitted:</strong> ${
  new Date().toLocaleDateString()
}</p>
                </div>
                <div style="text-align: center; margin: 25px 0;">
                  <a href="https://NIAD-1.github.io${context.params.auditId}"
                    style="display: inline-block; padding: 12px 24px; background-color: #0a9396; color: white; 
                          text-decoration: none; border-radius: 4px; font-weight: bold;">
                    Review Audit Now
                  </a>
                </div>
                <p style="color: #6c757d; font-size: 14px;">
                  <strong>Note:</strong> Please review this audit within 5 working days.
                </p>
              </div>
              <div style="background-color: #343a40; padding: 15px; color: white; 
                text-align: center; font-size: 12px;">
                <p>This is an automated notification from NAFDAC QMS Internal Audit System.</p>
                <p>Please do not reply to this email.</p>
              </div>
            </div>
          `,
      };
      recipients = after.leadAuditors.map(a => a.email);
      break;
    }

    case "lead_approved": {
      emailTemplate = {
        subject: `Audit Recommended for Approval - ${after.directorateUnit}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0;">
              <div style="background-color: #005f73; padding: 20px; color: white; text-align: center;">
                <h2 style="margin: 0;">NAFDAC QMS Internal Audit System</h2>
              </div>
              <div style="padding: 25px; background-color: #ffffff;">
                <h3 style="color: #005f73; margin-top: 0;">Audit Recommended for Final Approval</h3>
                <p>Dear Admin,</p>
                <p>The following audit has been reviewed and recommended for final approval:</p>
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
                  <p style="margin: 5px 0;"><strong>Directorate/Unit:</strong> ${after.directorateUnit}</p>
                  <p style="margin: 5px 0;"><strong>Reference No:</strong> ${after.refNo || "N/A"}</p>
                  <p style="margin: 5px 0;"><strong>Lead Auditor:</strong> ${currentUser.email}</p>
                  <p style="margin: 5px 0;"><strong>Date Recommended:</strong> ${
  new Date().toLocaleDateString()
}</p>
                  ${latestStep.comments ? `
                    <p style="margin: 5px 0;"><strong>Comments:</strong> ${latestStep.comments}</p>
                  ` : ""}
                </div>
                <div style="text-align: center; margin: 25px 0;">
                  <a href="https://NIAD-1.github.io${context.params.auditId}"
                    style="display: inline-block; padding: 12px 24px; background-color: #2a9d8f; color: white; 
                          text-decoration: none; border-radius: 4px; font-weight: bold;">
                    Approve Audit Now
                  </a>
                </div>
              </div>
              <div style="background-color: #343a40; padding: 15px; color: white; 
                text-align: center; font-size: 12px;">
                <p>This is an automated notification from NAFDAC QMS Internal Audit System.</p>
              </div>
            </div>
          `,
      };
      recipients = ["oluwaseun.adesanya@nafdac.gov.ng"];
      break;
    }

    case "admin_approved": {
      emailTemplate = {
        subject: `Audit Approved - ${after.directorateUnit}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0;">
              <div style="background-color: #005f73; padding: 20px; color: white; text-align: center;">
                <h2 style="margin: 0;">NAFDAC QMS Internal Audit System</h2>
              </div>
              <div style="padding: 25px; background-color: #ffffff;">
                <div style="text-align: center; margin-bottom: 20px;">
                  <div style="display: inline-block; background-color: #d4edda; color: #155724; 
                        padding: 10px 20px; border-radius: 20px; font-weight: bold;">
                    AUDIT APPROVED
                  </div>
                </div>
                <p>Dear Auditor,</p>
                <p>Your audit has been fully approved by the Quality Management System:</p>
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
                  <p style="margin: 5px 0;"><strong>Directorate/Unit:</strong> ${after.directorateUnit}</p>
                  <p style="margin: 5px 0;"><strong>Reference No:</strong> ${after.refNo || "N/A"}</p>
                  <p style="margin: 5px 0;"><strong>Approved by:</strong> ${currentUser.email}</p>
                  <p style="margin: 5px 0;"><strong>Date Approved:</strong> ${
  new Date().toLocaleDateString()
}</p>
                  ${latestStep.comments ? `
                    <p style="margin: 5px 0;"><strong>Admin Comments:</strong> ${latestStep.comments}</p>
                  ` : ""}
                </div>
                <div style="text-align: center; margin: 25px 0;">
                  <a href="https://NIAD-1.github.io${context.params.auditId}"
                    style="display: inline-block; padding: 12px 24px; background-color: #28a745; color: white; 
                          text-decoration: none; border-radius: 4px; font-weight: bold;">
                    View Approved Audit
                  </a>
                </div>
                <p>You may now proceed with sending the final results to the relevant stakeholders.</p>
              </div>
              <div style="background-color: #343a40; padding: 15px; color: white; 
                text-align: center; font-size: 12px;">
                <p>This is an automated notification from NAFDAC QMS Internal Audit System.</p>
              </div>
            </div>
          `,
      };
      recipients = [after.createdByEmail];
      break;
    }

    case "rejected": {
      emailTemplate = {
        subject: `Audit Requires Changes - ${after.directorateUnit}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0;">
              <div style="background-color: #005f73; padding: 20px; color: white; text-align: center;">
                <h2 style="margin: 0;">NAFDAC QMS Internal Audit System</h2>
              </div>
              <div style="padding: 25px; background-color: #ffffff;">
                <div style="text-align: center; margin-bottom: 20px;">
                  <div style="display: inline-block; background-color: #f8d7da; color: #721c24; 
                        padding: 10px 20px; border-radius: 20px; font-weight: bold;">
                    AUDIT REQUIRES CHANGES
                  </div>
                </div>
                <p>Dear ${latestStep.type === "lead_review" ? "Auditor" : "Lead Auditor"},</p>
                <p>The following audit requires your attention:</p>
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
                  <p style="margin: 5px 0;"><strong>Directorate/Unit:</strong> ${after.directorateUnit}</p>
                  <p style="margin: 5px 0;"><strong>Reference No:</strong> ${after.refNo || "N/A"}</p>
                  <p style="margin: 5px 0;"><strong>Returned by:</strong> ${latestStep.byEmail}</p>
                  <p style="margin: 5px 0;"><strong>Date Returned:</strong> ${
  new Date(latestStep.at.toDate()).toLocaleString()
}</p>
                  <p style="margin: 5px 0;"><strong>Reason:</strong> ${
  latestStep.comments || "Please review the requested changes"
}</p>
                </div>
                <div style="text-align: center; margin: 25px 0;">
                  <a href="https://NIAD-1.github.io/audits/${context.params.auditId}"
                    style="display: inline-block; padding: 12px 24px; background-color: #e76f51; color: white; 
                          text-decoration: none; border-radius: 4px; font-weight: bold;">
                    Review and Update
                  </a>
                </div>
                <p style="color: #6c757d; font-size: 14px;">
                  Please address the issues and resubmit for review.
                </p>
              </div>
              <div style="background-color: #343a40; padding: 15px; color: white; 
                text-align: center; font-size: 12px;">
                <p>This is an automated notification from NAFDAC QMS Internal Audit System.</p>
              </div>
            </div>
          `,
      };
      recipients = latestStep.type === "lead_review" ?
        [after.createdByEmail] :
        after.leadAuditors.map(a => a.email);
      break;
    }

    default:
      return null;
    }

    try {
      await transporter.sendMail({
        from: "\"NAFDAC QMS Audit System\" <enilama.oshoriamhe@nafdac.gov.ng>",
        to: recipients.join(","),
        subject: emailTemplate.subject,
        html: emailTemplate.html,
      });
      console.log(`Workflow email sent for audit ${context.params.auditId}`);
    } catch (error) {
      console.error("Error sending workflow email:", error);
    }
  });

// Custom Email Function
exports.sendAuditResultsEmail = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Authentication required");
  }

  const auditDoc = await admin.firestore().collection("audits").doc(data.auditId).get();
  if (!auditDoc.exists) {
    throw new functions.https.HttpsError("not-found", "Audit not found");
  }

  const audit = auditDoc.data();

  try {
    await transporter.sendMail({
      from: "\"NAFDAC QMS Audit System\" <enilama.oshoriamhe@nafdac.gov.ng>",
      to: data.to,
      cc: data.cc,
      subject: data.subject,
      html: `
        <p>${data.body.replace(/\n/g, "<br>")}</p>
        <p>---</p>
        <p><strong>Audit Details:</strong></p>
        <ul>
          <li>Directorate: ${audit.directorateUnit}</li>
          <li>Reference: ${audit.refNo}</li>
          <li>Date: ${new Date(audit.date).toLocaleDateString()}</li>
        </ul>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error("Error sending results email:", error);
    throw new functions.https.HttpsError("internal", "Failed to send email");
  }
});
