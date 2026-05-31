const functions = require("firebase-functions");
const axios = require("axios");

const ABACATEPAY_KEY = process.env.ABACATEPAY_KEY;

exports.criarCobrancaPix = functions.https.onRequest(async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "POST");
    res.set("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        res.status(204).send("");
        return;
    }

    try {
        const { valor, nomeParticipante, emailParticipante, rateioId } = req.body;

        const response = await axios.post(
            "https://api.abacatepay.com/v1/billing/create",
            {
                frequency: "ONE_TIME",
                methods: ["PIX"],
                products: [{
                    externalId: rateioId,
                    name: `Rateio - ${rateioId}`,
                    description: "Pagamento via Pague Junto",
                    quantity: 1,
                    price: Math.round(valor * 100)
                }],
                customer: {
                    name: nomeParticipante,
                    email: emailParticipante,
                    cellphone: "11999999999",
                    taxId: "00000000000"
                },
                returnUrl: `https://pague-junto-web.web.app/comprovante.html?id=${rateioId}`,
                completionUrl: `https://pague-junto-web.web.app/comprovante.html?id=${rateioId}`
            },
            {
                headers: {
                    "Authorization": `Bearer ${ABACATEPAY_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        res.json({ success: true, url: response.data.data.url });

    } catch (error) {
        console.error("Erro AbacatePay:", error.response?.data || error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});