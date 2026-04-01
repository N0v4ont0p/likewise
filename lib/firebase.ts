import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const configFromEnv = () => {
  const envConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  const missingKeys = Object.entries(envConfig)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingKeys.length) {
    throw new Error(
      `Missing Firebase environment variables: ${missingKeys.join(', ')}. ` +
        'Set them in your .env.local file to configure authentication.'
    );
  }

  return envConfig as FirebaseOptions;
};

const app = getApps().length === 0 ? initializeApp(configFromEnv()) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
