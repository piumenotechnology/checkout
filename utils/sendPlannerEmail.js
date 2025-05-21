const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

const TO_EMAILS = [
    'izzudinfasya@gmail.com',
    'neel@strategyinstitute.com',
    'arya.r@piumeno.co',
];

function formatParticipant(participant) {
    const gross = participant.price + participant.hst;

    return `
Conference: ${participant.conference || '-'}  
Code: ${participant.code || '-'}
Name: ${participant.firstName} ${participant.lastName}
Title: ${participant.jobTitle || '-'}
Company: ${participant.company || '-'}
Email: ${participant.email}
Phone: ${participant.phone || '-'}
Type: ${participant.regTypeLabel || participant.regType || '-'}
Discount Code: ${participant.discount || '-'}

Individual Net: CA$ ${participant.price.toFixed(2)}
Individual Tax: CA$ ${participant.hst.toFixed(2)}
Individual Gross: CA$ ${gross.toFixed(2)}
  `.trim();
}

function generateEmailBody(participants) {
    const formattedParticipants = participants.map(formatParticipant).join('\n\n');
    const groupNet = participants.reduce((sum, p) => sum + p.price, 0);
    const groupTax = participants.reduce((sum, p) => sum + p.hst, 0);
    const groupGross = groupNet + groupTax;

    return `
Registrants Checkout Notification

${formattedParticipants}

Group Size: ${participants.length}
Group Net: CA$ ${groupNet.toFixed(2)}
Group Tax: CA$ ${groupTax.toFixed(2)}
Group Gross: CA$ ${groupGross.toFixed(2)}
  `.trim();
}

async function sendPlannerEmail(participants) {
    if (!Array.isArray(participants) || participants.length === 0) {
        console.warn('No participants to email.');
        return;
    }

    const emailBody = generateEmailBody(participants);

    try {
        await resend.emails.send({
            from: 'test@strategyinstitute.com',
            to: TO_EMAILS,
            subject: 'CHECKOUT TEST has Closed in Swoogo (CHECKOUT TEST)',
            text: emailBody,
        });
    } catch (error) {
        console.error('Failed to send checkout email:', error);
    }
}

module.exports = sendPlannerEmail;
