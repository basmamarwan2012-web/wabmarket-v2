import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/firebase/client";

export const createUserDocument = async (
  userId: string,
  data: Record<string, unknown>,
) => {
  await setDoc(doc(db, "users", userId), data);
};

export const getUserDocument = async (
  userId: string,
) => {
  const snapshot = await getDoc(
    doc(db, "users", userId),
  );

  return snapshot.data();
};

export const updateUserDocument = async (
  userId: string,
  data: Record<string, unknown>,
) => {
  await updateDoc(
    doc(db, "users", userId),
    data,
  );
};