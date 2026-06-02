import { db, handleFirestoreError, OperationType } from "./firebase";
import { doc, getDoc, setDoc, getDocs, collection, deleteDoc } from "firebase/firestore";
import { User, PolishedCV, JobApplication } from "../types";

/**
 * Saves or updates a user profile document in Firestore at /users/{userId}.
 */
export async function saveUserProfile(userId: string, profile: User): Promise<void> {
  const path = `users/${userId}`;
  try {
    const docRef = doc(db, "users", userId);
    const existingSnap = await getDoc(docRef);
    
    // Construct sanitized profile matching the firestore.rules expected shape:
    const sanitizedProfile: any = {
      id: profile.id,
      email: profile.email || "",
      fullName: profile.fullName || "",
      createdAt: profile.createdAt || new Date().toISOString()
    };
    
    if (profile.picture !== undefined) {
      sanitizedProfile.picture = profile.picture;
    }
    
    if (profile.preferences !== undefined) {
      sanitizedProfile.preferences = profile.preferences;
    }

    if (existingSnap.exists()) {
      const existingData = existingSnap.data() as User;
      if (existingData.createdAt) {
        sanitizedProfile.createdAt = existingData.createdAt;
      }
    }
    
    await setDoc(docRef, sanitizedProfile, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Retrieves a user profile document from Firestore at /users/{userId}.
 */
export async function getUserProfile(userId: string): Promise<User | null> {
  const path = `users/${userId}`;
  try {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as User;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/**
 * Retrieves all cv documents from a user's subcollection at /users/{userId}/cvs.
 */
export async function getUserCVs(userId: string): Promise<PolishedCV[]> {
  const path = `users/${userId}/cvs`;
  try {
    const collRef = collection(db, "users", userId, "cvs");
    const querySnapshot = await getDocs(collRef);
    const cvs: PolishedCV[] = [];
    querySnapshot.forEach((docSnap) => {
      cvs.push(docSnap.data() as PolishedCV);
    });
    return cvs;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

/**
 * Saves or updates a CV document in a user's subcollection at /users/{userId}/cvs/{cvId}.
 */
export async function saveUserCV(userId: string, cv: PolishedCV): Promise<void> {
  const path = `users/${userId}/cvs/${cv.id}`;
  try {
    const docRef = doc(db, "users", userId, "cvs", cv.id);
    await setDoc(docRef, cv, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Deletes a CV document from a user's subcollection at /users/{userId}/cvs/{cvId}.
 */
export async function deleteUserCV(userId: string, cvId: string): Promise<void> {
  const path = `users/${userId}/cvs/${cvId}`;
  try {
    const docRef = doc(db, "users", userId, "cvs", cvId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Retrieves all submitted job applications from a user's subcollection at /users/{userId}/applications.
 */
export async function getUserApplications(userId: string): Promise<JobApplication[]> {
  const path = `users/${userId}/applications`;
  try {
    const collRef = collection(db, "users", userId, "applications");
    const querySnapshot = await getDocs(collRef);
    const apps: JobApplication[] = [];
    querySnapshot.forEach((docSnap) => {
      apps.push(docSnap.data() as JobApplication);
    });
    return apps;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

/**
 * Saves a job application record in a user's subcollection at /users/{userId}/applications/{applicationId}.
 */
export async function saveUserApplication(userId: string, app: JobApplication): Promise<void> {
  const path = `users/${userId}/applications/${app.id}`;
  try {
    const docRef = doc(db, "users", userId, "applications", app.id);
    await setDoc(docRef, app, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Deletes a job application record from a user's subcollection at /users/{userId}/applications/{applicationId}.
 */
export async function deleteUserApplication(userId: string, appId: string): Promise<void> {
  const path = `users/${userId}/applications/${appId}`;
  try {
    const docRef = doc(db, "users", userId, "applications", appId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
