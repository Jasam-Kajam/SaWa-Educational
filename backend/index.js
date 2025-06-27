// ✅ Updated index.js for Wafula Educational Backend const express = require("express"); const admin = require("firebase-admin"); const cors = require("cors"); const multer = require("multer"); const axios = require("axios"); const dotenv = require("dotenv");

dotenv.config(); const app = express(); app.use(cors()); app.use(express.json());

const serviceAccount = require("./firebase-service-account.json");

admin.initializeApp({ credential: admin.credential.cert(serviceAccount), storageBucket: process.env.FIREBASE_STORAGE_BUCKET });

const db = admin.firestore(); const bucket = admin.storage().bucket();

// 🔐 Basic Auth Middleware function checkAuth(req, res, next) { const auth = req.headers.authorization; if (!auth || !auth.startsWith("Basic ")) return res.status(401).send("Unauthorized");

const credentials = Buffer.from(auth.split(" ")[1], "base64").toString(); const [username, password] = credentials.split(":");

if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) { next(); } else { res.status(401).send("Unauthorized"); } }

const upload = multer({ storage: multer.memoryStorage() });

// 📤 Upload endpoint app.post("/upload", checkAuth, upload.single("file"), async (req, res) => { const { title, category, fileType } = req.body; const file = req.file;

if (!file || !title || !category || !fileType) return res.status(400).send("Missing fields");

const fileName = Date.now() + "_" + file.originalname; const fileRef = bucket.file(fileName);

const stream = fileRef.createWriteStream({ metadata: { contentType: file.mimetype, } });

stream.on("error", (err) => res.status(500).send("Upload error: " + err)); stream.on("finish", async () => { await fileRef.makePublic(); const url = https://storage.googleapis.com/${bucket.name}/${fileName};

const doc = {
  title,
  category,
  fileType,
  url,
  createdAt: admin.firestore.FieldValue.serverTimestamp()
};

await db.collection("materials").add(doc);
res.send("Uploaded successfully");

});

stream.end(file.buffer); });

// 📚 Materials Fetch Endpoint app.get("/materials", async (req, res) => { try { const snapshot = await db.collection("materials").orderBy("createdAt", "desc").get(); const materials = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); res.json(materials); } catch (error) { res.status(500).send("Failed to fetch materials."); } });

// ✅ Verify payment via Paystack app.post("/verify-payment", async (req, res) => { const { reference, materialId } = req.body;

try { const response = await axios.get(https://api.paystack.co/transaction/verify/${reference}, { headers: { Authorization: Bearer ${process.env.PAYSTACK_SECRET_KEY} } });

const status = response.data.data.status;
if (status !== "success") return res.status(400).send("Payment not successful");

const materialRef = db.collection("materials").doc(materialId);
const material = await materialRef.get();

if (!material.exists) return res.status(404).send("Material not found");

res.json({ downloadUrl: material.data().url });

} catch (err) { res.status(500).send("Payment verification failed"); } });

// 🌐 Root route app.get("/", (req, res) => { res.send("✅ Wafula backend is running"); });

const PORT = process.env.PORT || 4000; app.listen(PORT, () => console.log(🚀 Backend running on port ${PORT}));

