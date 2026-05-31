export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    try {
        const { valor, nomeParticipante, emailParticipante, rateioId } = req.body;

        const response = await fetch('https://api.abacatepay.com/v1/billing/create', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.ABACATEPAY_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                frequency: 'ONE_TIME',
                methods: ['PIX'],
                products: [{
                    externalId: rateioId,
                    name: `Rateio ${rateioId}`,
                    description: 'Pagamento via Pague Junto',
                    quantity: 1,
                    price: Math.round(valor * 100)
                }],
                customer: {
                    name: nomeParticipante,
                    email: emailParticipante,
                    cellphone: '11999999999',
                    taxId: '00000000000'
                },
                returnUrl: `https://pague-junto-beige.vercel.app/public/comprovante.html?id=${rateioId}`,
                completionUrl: `https://pague-junto-beige.vercel.app/public/comprovante.html?id=${rateioId}`
            })
        });

        const data = await response.json();

        if (data?.data?.url) {
            return res.status(200).json({ success: true, url: data.data.url });
        } else {
            return res.status(500).json({ success: false, error: data });
        }

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}