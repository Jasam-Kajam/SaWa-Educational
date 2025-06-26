// backend/index.js

const express = require("express"); const admin = require("firebase-admin"); const cors = require("cors"); const multer = require("multer"); const axios = require("axios"); const dotenv = require("dotenv"); const path = require("path");

dotenv.config(); const app = express(); app.use(cors()); app.use(express.json()); app.use(express.static("public"));

// Initialize Firebase Admin SDK const serviceAccount = require("./serviceAccountKey.json"); admin.initializeApp({ credential: admin.credential.cert(serviceAccount), storageBucket: process.env.FIREBASE_STORAGE_BUCKET, databaseURL: "https://wafula-s-educational-posts-default-rtdb.firebaseio.com" });

const dbRTDB = admin.database(); const db = admin.firestore(); const bucket = admin.storage().bucket();

// Basic Auth middleware function checkAuth(req, res, next) { const auth = req.headers.authorization; if (!auth || !auth.startsWith("Basic ")) return res.status(401).send("Unauthorized");

const credentials = Buffer.from(auth.split(" ")[1], "base64").toString(); const [username, password] = credentials.split(":");

if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) { next(); } else { res.status(401).send("Unauthorized"); } }

// Upload handler using multer in-memory const upload = multer({ storage: multer.memoryStorage() });

// Upload route app.post("/upload", checkAuth, upload.single("file"), async (req, res) => { const { title, category, fileType } = req.body; const file = req.file;

if (!file || !title || !category || !fileType) return res.status(400).send("Missing fields");

const fileName = Date.now() + "_" + file.originalname; const fileRef = bucket.file(fileName);

const stream = fileRef.createWriteStream({ metadata: { contentType: file.mimetype } });

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

// Get materials (from Firestore) app.get("/materials", async (req, res) => { const snapshot = await db.collection("materials").orderBy("createdAt", "desc").get(); const materials = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); res.json(materials); });

// Verify Paystack payment app.post("/verify-payment", async (req, res) => { const { reference, materialId } = req.body;

try

