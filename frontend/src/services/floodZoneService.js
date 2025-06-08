// src/services/floodZoneService.js
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export async function saveFloodZonesToFirestore(userId, geoJson) {
  const docRef = doc(db, "floodZones", userId);
  await setDoc(docRef, {
    geoJson,
    lastUpdated: new Date(),
  });
}

export async function getFloodZonesFromFirestore(userId) {
  const docRef = doc(db, "floodZones", userId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data().geoJson;
  }
  return null;
}
