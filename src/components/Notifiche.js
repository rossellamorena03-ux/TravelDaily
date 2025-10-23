import { getFirestore, updateDoc } from "firebase/firestore";
import { app } from "../firebaseConfig";
import { getAuth } from "firebase/auth";

const db = getFirestore(app);

async function saveSubscription(subscription) {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return;

  const userRef = doc(db, "users", user.uid);
  await updateDoc(userRef, {
    pushSubscription: subscription
  });
}

export async function subscribeUserToPush() {
  try{
    if (!("serviceWorker" in navigator)) {
    console.error("Service Worker non supportato dal browser.");
    return;
  }

  const registration = await navigator.serviceWorker.ready;

  // 1️⃣ Chiedi permesso all’utente
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    console.warn("Permesso notifiche negato.");
    return;
  }

  // 2️⃣ Crea la subscription
  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    console.log("Chiave Uint8Array:", urlBase64ToUint8Array("BD6F_U4GZy8cifQMwDWwd-LAKkNelfYs6dnXs61Ojlejz1myc_wh7Z79iOEkZur_E7S6mdocC8PUGTPnEkXvkSc"));

    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array("BD6F_U4GZy8cifQMwDWwd-LAKkNelfYs6dnXs61Ojlejz1myc_wh7Z79iOEkZur_E7S6mdocC8PUGTPnEkXvkSc"),
    });

    console.log("✅ Nuova subscription creata!");
  } else {
    console.log("ℹ️ Subscription già esistente.");
  }
console.log("avvio iscrizione");
  // 3️⃣ Invia la subscription al backend
  await fetch("http://localhost:3001/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(subscription.toJSON()),
  });

  saveSubscription(subscription);
  console.log("✅ Utente iscritto alle notifiche push!", subscription);
  }catch(e){
    console.log(e);
  }
  
}

// 🔧 funzione helper (necessaria per convertire la chiave)
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}

