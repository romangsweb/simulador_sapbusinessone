import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// We will require the user to paste their RESEND_API_KEY in .env.local
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { lead, quoteDetails } = body;

        if (!lead || !lead.email || !quoteDetails || !quoteDetails.quoteUrl) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // For testing without a verified domain, we must use the sandbox email
        const data = await resend.emails.send({
            from: 'Cecilia Rodríguez <onboarding@resend.dev>', // Temporario hasta que verifiques xamai en Resend
            to: [lead.email],
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
                        <a href="mailto:cecilia.rodriguez@xamai.com.mx" style="color: #4299E1;">cecilia.rodriguez@xamai.com.mx</a>
                    </p>
                </div>
            `
        });

        return NextResponse.json({ success: true, data });

    } catch (error: any) {
        console.error('Error sending email via Resend:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
