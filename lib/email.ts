import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.FROM_EMAIL || "onboarding@resend.dev";

interface ApplicationEmailData {
  to: string;
  applicantName: string;
  positionTitle: string;
  companyName: string;
  isCollaboration: boolean;
}

function buildHeader() {
  return `
    <div style="background:linear-gradient(135deg,#7042f8,#00d1ff);border-radius:12px;padding:24px;text-align:center;margin-bottom:28px">
      <h1 style="margin:0;font-size:24px;color:#fff">TechFolio</h1>
      <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.7)">Ministry Tech Incubator</p>
    </div>`;
}

export async function sendApplicationAccepted(data: ApplicationEmailData) {
  const subject = data.isCollaboration
    ? `You accepted a collaboration request — ${data.applicantName}`
    : `You accepted an application — ${data.applicantName}`;

  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#0a0414;color:#e2e8f0;border-radius:16px">
      ${buildHeader()}
      <h2 style="color:#4ade80;font-size:20px;margin:0 0 16px">${data.isCollaboration ? "🤝 Collaboration Request Accepted" : "✅ Application Accepted"}</h2>
      <p style="color:rgba(226,232,240,0.75);font-size:14px;line-height:1.6;margin:0 0 16px">
        You accepted the ${data.isCollaboration ? "collaboration request" : "application"} from <strong style="color:#e2e8f0">${data.applicantName}</strong> for <strong style="color:#e2e8f0">${data.positionTitle}</strong>.
      </p>
      <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:16px;margin-bottom:20px">
        <p style="margin:0 0 6px;font-size:12px;color:rgba(226,232,240,0.4);text-transform:uppercase;letter-spacing:0.05em">Contact Details</p>
        <p style="margin:0;font-size:15px;font-weight:600;color:#e2e8f0">${data.applicantName}</p>
        <p style="margin:4px 0 0;font-size:14px;color:#67e8f9">${data.to}</p>
      </div>
      <p style="color:rgba(226,232,240,0.5);font-size:13px;margin:0">Reach out to them directly to move forward.</p>
      <p style="margin:28px 0 0;font-size:12px;color:rgba(226,232,240,0.3)">TechFolio — Ministry Tech Incubator Directory</p>
    </div>`;

  await resend.emails.send({ from: FROM, to: data.to, subject, html });
}

export async function sendApplicationRejected(data: ApplicationEmailData) {
  const subject = data.isCollaboration
    ? `You declined a collaboration request — ${data.applicantName}`
    : `You declined an application — ${data.applicantName}`;

  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#0a0414;color:#e2e8f0;border-radius:16px">
      ${buildHeader()}
      <h2 style="color:#e2e8f0;font-size:20px;margin:0 0 16px">Application Declined</h2>
      <p style="color:rgba(226,232,240,0.75);font-size:14px;line-height:1.6;margin:0 0 16px">
        You declined the ${data.isCollaboration ? "collaboration request" : "application"} from <strong style="color:#e2e8f0">${data.applicantName}</strong> for <strong style="color:#e2e8f0">${data.positionTitle}</strong>.
      </p>
      <p style="color:rgba(226,232,240,0.5);font-size:13px;margin:0">This is just a confirmation — no further action needed.</p>
      <p style="margin:28px 0 0;font-size:12px;color:rgba(226,232,240,0.3)">TechFolio — Ministry Tech Incubator Directory</p>
    </div>`;

  await resend.emails.send({ from: FROM, to: data.to, subject, html });
}
