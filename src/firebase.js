import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, getDocs, deleteDoc, collection, query } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBWH0w2tDWVuL1ITtL85zEbe6s4ONWII14",
  authDomain: "perfect-darts-946d5.firebaseapp.com",
  projectId: "perfect-darts-946d5",
  storageBucket: "perfect-darts-946d5.firebasestorage.app",
  messagingSenderId: "755103407172",
  appId: "1:755103407172:web:c8fd616421c3d38b9d3011"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function sanitize(obj) {
  return JSON.parse(JSON.stringify(obj, (k, v) => v === undefined ? null : v));
}

export async function loadAllPlayers() {
  try {
    const q = query(collection(db, "players"));
    const snapshot = await getDocs(q);
    const players = [];
    snapshot.forEach(d => players.push(d.data()));
    return players.sort((a, b) => (b.lastPlayed || 0) - (a.lastPlayed || 0));
  } catch (e) {
    console.error("Load failed:", e);
    return [];
  }
}

export async function getPlayer(id) {
  try {
    const snap = await getDoc(doc(db, "players", id));
    if (snap.exists()) return snap.data();
    return null;
  } catch (e) {
    console.error("Get player failed:", e);
    return null;
  }
}

export async function savePlayer(player) {
  try {
    await setDoc(doc(db, "players", player.id), sanitize(player));
  } catch (e) {
    console.error("Save failed:", e);
  }
}

export async function removePlayer(id) {
  try {
    await deleteDoc(doc(db, "players", id));
  } catch (e) {
    console.error("Delete failed:", e);
  }
}

export async function saveGameSession(sessionData) {
  try {
    await setDoc(doc(db, "sessions", "current"), { data: JSON.stringify(sessionData), updatedAt: Date.now() });
  } catch (e) {
    console.error("Save session failed:", e);
  }
}

export async function loadGameSession() {
  try {
    const snap = await getDoc(doc(db, "sessions", "current"));
    if (snap.exists()) {
      const raw = snap.data();
      if (raw.data) return JSON.parse(raw.data);
      return raw;
    }
    return null;
  } catch (e) {
    console.error("Load session failed:", e);
    return null;
  }
}

export async function deleteGameSession() {
  try {
    await deleteDoc(doc(db, "sessions", "current"));
  } catch (e) {
    console.error("Delete session failed:", e);
  }
}
