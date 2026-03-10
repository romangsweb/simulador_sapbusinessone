import { NextResponse } from 'next/server';

export async function OPTIONS(request: Request) {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { lead, quoteDetails, proposalId } = body;

        const webhookUrl = process.env.SLACK_WEBHOOK_URL;
        if (!webhookUrl) {
            console.error('SLACK_WEBHOOK_URL is not set');
            return NextResponse.json({ error: 'Webhook URL not configured' }, { status: 500 });
        }

        const industryFormatted = quoteDetails.industry
            ? quoteDetails.industry.charAt(0).toUpperCase() + quoteDetails.industry.slice(1)
            : 'No especificada';

        const slackMessage = {
            blocks: [
                {
                    type: "header",
                    text: {
                        type: "plain_text",
                        text: "🔥 ¡Cotización Abierta en Pantalla!",
                        emoji: true
                    }
                },
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: `*${lead.firstName} ${lead.lastName}* de la empresa *${lead.company}* acaba de abrir su propuesta interactiva (*#${proposalId}*).\n\n*Detalles del Prospecto:*\n• *Empresa:* ${lead.company} (${industryFormatted})\n• *Ubicación:* ${lead.city}\n• *Correo:* ${lead.email}\n• *Teléfono:* ${lead.phone || 'No proporcionado'}\n\n*Cotización Vista:*\n• *Solución:* ${quoteDetails.solution.toUpperCase()}\n• *Usuarios:* ${quoteDetails.proUsers} Pro / ${quoteDetails.limitedUsers} Lim`
                    }
                },
                {
                    type: "divider"
                },
                {
                    type: "context",
                    elements: [
                        {
                            type: "mrkdwn",
                            text: "⏱️ _Es el momento ideal para contactarlo._"
                        }
                    ]
                }
            ]
        };

        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(slackMessage)
        });

        if (!response.ok) {
            throw new Error(`Slack API error: ${response.statusText}`);
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error sending Slack alert:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
