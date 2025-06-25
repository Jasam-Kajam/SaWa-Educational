const axios = require('axios');

// Payment verification route
app.post('/verify-payment', async (req, res) => {
  const { reference, materialId } = req.body;

  try {
    // Verify payment with Paystack API
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } }
    );

    const paymentData = response.data.data;

    if (paymentData.status === 'success' && paymentData.amount >= 5000) { // 50 KES * 100
      // Payment verified, fetch material
      const doc = await db.collection('materials').doc(materialId).get();
      if (!doc.exists) {
        return res.status(404).send('Material not found');
      }
      const material = doc.data();
      res.json({ downloadUrl: material.url });
    } else {
      res.status(400).send('Payment not valid');
    }
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).send('Payment verification failed');
  }
});