import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User, 
  signOut 
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

export const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
];

const provider = new GoogleAuthProvider();
SCOPES.forEach((scope) => provider.addScope(scope));
provider.setCustomParameters({
  prompt: 'select_account',
});

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export interface AuthErrorInfo {
  code: string;
  title: string;
  message: string;
  isDomainError: boolean;
  domain: string;
}

export function parseAuthError(error: any): AuthErrorInfo {
  const code = error?.code || '';
  const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';

  if (code === 'auth/unauthorized-domain') {
    return {
      code,
      title: 'Domain Authorization Required',
      message: `Your domain (${currentHost}) needs to be authorized in Firebase Authentication to use live Google Sheets sync. You can either authorize this domain in Firebase Console or use the 1-click Spreadsheet Export button to open your orders in Google Sheets instantly.`,
      isDomainError: true,
      domain: currentHost,
    };
  }

  if (code === 'auth/popup-blocked') {
    return {
      code,
      title: 'Popup Blocked by Browser',
      message: 'Your phone or browser blocked the Google sign-in popup. Please allow popups for this site in your browser settings and try again.',
      isDomainError: false,
      domain: currentHost,
    };
  }

  if (code === 'auth/popup-closed-by-user') {
    return {
      code,
      title: 'Sign-in Cancelled',
      message: 'The Google sign-in window was closed before signing in. Tap Google Sheets again to retry.',
      isDomainError: false,
      domain: currentHost,
    };
  }

  if (code === 'auth/network-request-failed') {
    return {
      code,
      title: 'Connection Issue',
      message: 'Network connection failed. Please check your internet connection and try again.',
      isDomainError: false,
      domain: currentHost,
    };
  }

  return {
    code,
    title: 'Google Sign-in Notice',
    message: error?.message || 'Unable to connect to Google account at this time.',
    isDomainError: false,
    domain: currentHost,
  };
}

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user && cachedAccessToken) {
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to obtain Google access token');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error) {
    console.error('Google Sign-in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const getAuthUser = (): User | null => {
  return auth.currentUser;
};

export const logoutGoogle = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

