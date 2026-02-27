import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { firstName, lastName, email, phone, company, role, source, quoteDetails } = body;

        // This is where you actually connect to HubSpot
        // Example hubspot endpoint for creating a contact:
        // https://api.hubapi.com/crm/v3/objects/contacts

        // For now, if the environment variable is not present, we will simulate success.
        const hubspotToken = process.env.HUBSPOT_ACCESS_TOKEN;

        if (hubspotToken) {
            const hubspotRes = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${hubspotToken}`
                },
                body: JSON.stringify({
                    properties: {
                        firstname: firstName,
                        lastname: lastName,
                        email: email,
                        phone: phone,
                        company: company,
                        jobtitle: role,
                        hs_lead_status: 'NEW',
                        message: `Lead from Quotation App. Quote details: ${JSON.stringify(quoteDetails)}`
                    }
                })
            });

            if (!hubspotRes.ok) {
                const errData = await hubspotRes.json();
                console.error("HubSpot API Error:", errData);
                return NextResponse.json({ error: 'Failed to create contact in CRM' }, { status: 500 });
            }
        } else {
            console.log("No HubSpot API key found. Simulating lead creation:");
            console.log(body);
        }

        return NextResponse.json({ success: true, message: 'Lead created successfully' });

    } catch (error) {
        console.error("Internal Server Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
