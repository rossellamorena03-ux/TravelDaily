import express from "express";
import webpush from "web-push";
import bodyParser from "body-parser";
import cors from "cors";


const app = express();
app.use(bodyParser.json());
app.use(cors({
  origin: ["https://viaggia-ancora.web.app"], // dominio del tuo sito
}));
// ⚙️ Inserisci le tue chiavi generate con web-push
const PUBLIC_VAPID_KEY = import.meta.env.VITE_PUBLIC_VAPID_KEY;
const PRIVATE_VAPID_KEY =import.meta.env.VITE_PRIVATE_VAPID_KEY;

webpush.setVapidDetails(
  "mailto:rossella@example.com",
  PUBLIC_VAPID_KEY,
  PRIVATE_VAPID_KEY
);

const subscribers = [];

// 👉 riceve la subscription dal client
app.post("/subscribe", (req, res) => {
  const subscription = req.body;
  subscribers.push(subscription);
  console.log("✅ Nuovo utente iscritto:", subscription.endpoint);

  const payload = JSON.stringify({
    title: "Iscrizione OK 🎉",
    body: "Hai completato correttamente la subscription!",
  });

  webpush.sendNotification(subscription, payload)
    .then(() => console.log("📨 Notifica inviata con successo"))
    .catch(err => console.error("Errore invio:", err));

  //aggiungi iscrizione a db!!!
  res.status(201).json({ message: "Iscritto alle notifiche!" });
});

// 👉 invia una notifica a tutti gli iscritti
app.post("/send", async (req, res) => {
  const { title, body } = req.body;
  const payload = JSON.stringify({ title, body });

  try {
    for (const sub of subscribers) {
      await webpush.sendNotification(sub, payload);
    }
    res.status(200).json({ message: "Notifiche inviate!" });
  } catch (err) {
    console.error("Errore invio notifiche:", err);
    res.status(500).json({ error: err });
    //cancella sottoscrizione del client!!!!
  }
});

app.listen(3001, () => console.log("🚀 Server avviato su http://localhost:3001"));






// funzione per inviare la notifica
/*async function sendDailyNotifications() {
  const subsSnapshot = await db.collection("subscriptions").get();
  subsSnapshot.forEach(doc => {
    const subscription = doc.data();
    webpush.sendNotification(subscription, JSON.stringify({
      title: "Notifica giornaliera 🌞",
      body: "Ehi! Torna a dare un’occhiata oggi 👋"
    })).catch(err => console.error("Errore invio:", err));
  });
  console.log("📨 Notifiche giornaliere inviate!");
}

// esegui ogni giorno alle 10:00
cron.schedule("0 10 * * *", () => {
  console.log("⏰ Invio notifiche giornaliere...");
  sendDailyNotifications();
});*/