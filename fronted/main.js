async function fetchMaterials() {
  const res = await fetch('https://sawa-educational-backend.onrender.com/materials');
  const materials = await res.json();
  const container = document.getElementById('materials');

  container.innerHTML = materials.map(mat => `
    <div class="material">
      <h3>${mat.title}</h3>
      <p>Category: ${mat.category}</p>
      <button onclick="pay('${mat.id}')">Pay KES 50 to Download</button>
    </div>
  `).join('');
}

async function pay(id) {
  const email = prompt('Enter your email:');
  const res = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer pk_live_3b95d82d975d8cd88f2e0059b1d6dca62c1db036'
    },
    body: JSON.stringify({ email, amount: 5000 }) // KES 50 = 5000 kobo
  });

  const data = await res.json();
  const ref = data.data.reference;

  window.location.href = data.data.authorization_url;

  setTimeout(async () => {
    const verify = await fetch('https://sawa-educational-backend.onrender.com/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reference: ref, materialId: id })
    });

    const result = await verify.json();
    if (result.downloadUrl) window.open(result.downloadUrl, '_blank');
    else alert('Payment verification failed.');
  }, 5000);
}

fetchMaterials();