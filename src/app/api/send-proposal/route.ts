import { NextResponse } from 'next/server';
import { Resend } from 'resend';

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
        const { lead, quoteDetails } = body;

        if (!lead || !lead.email || !quoteDetails || !quoteDetails.quoteUrl) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const resendApiKey = process.env.RESEND_API_KEY;
        if (!resendApiKey) {
            console.error('Missing RESEND_API_KEY configuration');
            return NextResponse.json({ error: 'Mail server configuration missing' }, { status: 500 });
        }

        const resend = new Resend(resendApiKey);

        // 1. Send proposal to the client using verified domain
        const data = await resend.emails.send({
            from: 'Cecilia Rodríguez <cecilia.rodriguez@xamai.com>',
            to: [lead.email],
            cc: ['cecilia.rodriguez@scanda.com.mx', 'jessica.lopez@scanda.com.mx', 'roman.garcia@scanda.com.mx', 'karen.vera@scanda.com.mx'],
            subject: `Tu cotización interactiva SAP para ${lead.company}`,
            html: `
                <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-w-lg mx-auto; padding: 20px;">
                    <img src="https://media.canva.com/v2/image-resize/format:PNG/nd:rboM8rQpwM-vR_2Q1q-mHAo191B2hU_zT1q1eQ4_nU/watermark:F/rt:auto/rs:fit:1200:1200/czM6Ly9tZWRpYS1wcml2YXRlLmNhbnZhLmNvbS9vUEg1NC9NQUdYcDhvUEg1NC8xL3AucG5n?exp=1708892400&sig=SOME_SIGNATURE" alt="Xamai Logo" style="height: 40px; margin-bottom: 20px;" />
                    
                    <h2 style="color: #2D3748; margin-bottom: 16px;">¡Hola ${lead.firstName}!</h2>
                    
                    <p>Soy Cecilia Rodríguez, SDR Leader de Xamai. Es un gusto tener la oportunidad de presentarte nuestro presupuesto preliminar de <strong>${quoteDetails.solution === 'business-one' ? 'SAP Business One' : quoteDetails.solution === 'bydesign' ? 'SAP ByDesign' : 'SAP S/4HANA'}</strong> para el giro de <strong>${quoteDetails.industry.charAt(0).toUpperCase() + quoteDetails.industry.slice(1)}</strong>.</p>
                    
                    <p>Hemos habilitado un portal interactivo para que puedas consultar tu documento financiero detallado a tu propio ritmo. El documento es seguro y privado para tu empresa, <strong>${lead.company}</strong>.</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${quoteDetails.quoteUrl}" style="background-color: #EA580C; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
                            Ver Cotización Interactiva
                        </a>
                    </div>
                    
                    <p>Si tienes alguna duda técnica o quieres agendar una demo formal del sistema, puedes responder directamente a este correo o escribirme al WhatsApp.</p>
                    
                    <hr style="border: 0; border-top: 1px solid #E2E8F0; margin: 30px 0;" />
                    
                    <p style="font-size: 12px; color: #718096; text-align: center;">
                        <strong>Cecilia Rodríguez</strong><br/>
                        SDR Leader | Xamai - Gold Partner SAP<br/>
                        <a href="mailto:cecilia.rodriguez@xamai.com" style="color: #4299E1;">cecilia.rodriguez@xamai.com</a>
                    </p>
                </div>
            `
        });

        // 2. Send internal copy to the team (separate call, error-isolated)
        try {
            await resend.emails.send({
                from: 'Cecilia Rodríguez <cecilia.rodriguez@xamai.com>',
                to: ['cecilia.rodriguez@scanda.com.mx', 'jessica.lopez@scanda.com.mx', 'roman.garcia@scanda.com.mx', 'karen.vera@scanda.com.mx'],
                subject: `[Copia] Tu cotización interactiva SAP para ${lead.company}`,
                html: `
                <div style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 20px; border-bottom: 2px solid #e2e8f0; margin-bottom: 20px;">
                    <h3 style="color: #2b6cb0; margin-top: 0;">📋 Nueva Cotización Enviada</h3>
                    <p style="color: #4a5568; margin-bottom: 10px;">Se ha enviado una cotización al siguiente prospecto:</p>
                    <ul style="list-style-type: none; padding: 0; color: #2d3748;">
                        <li><strong>Contacto:</strong> ${lead.firstName} ${lead.lastName || ''}</li>
                        <li><strong>Email:</strong> <a href="mailto:${lead.email}">${lead.email}</a></li>
                        ${lead.phone ? `<li><strong>Teléfono:</strong> ${lead.phone}</li>` : ''}
                        <li><strong>Empresa:</strong> ${lead.company}</li>
                        <li><strong>Solución:</strong> ${quoteDetails.solution}</li>
                        <li><strong>Industria:</strong> ${quoteDetails.industry}</li>
                    </ul>
                    <div style="margin-top: 20px;">
                        <a href="${quoteDetails.quoteUrl}" style="background-color: #3182ce; color: #ffffff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">
                            Ver Cotización Generada
                        </a>
                    </div>
                </div>`
            });
        } catch (internalError) {
            console.error('Internal copy failed (client email was sent):', internalError);
        }

        return NextResponse.json({ success: true, data });

    } catch (error) {
        console.error('Error sending email via Resend:', error);
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
    }
}

