import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

let adminDb: any = null;
let adminAuth: any = null;

// Only initialize Firebase Admin on the server side
if (typeof window === 'undefined') {
  try {
    // Check if Firebase Admin is already initialized
    if (!getApps().length) {
      // Check if we have the required environment variables
      const projectId = process.env.FIREBASE_PROJECT_ID;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      const privateKey = process.env.FIREBASE_PRIVATE_KEY;

      if (!projectId || !clientEmail || !privateKey) {
        console.warn('⚠️ Firebase Admin environment variables not found. Using mock admin services.');
        // Create mock admin services for development
        adminDb = {
          collection: () => ({
            doc: () => ({
              get: () => Promise.resolve({ exists: false, data: () => null }),
              set: () => Promise.resolve(),
              update: () => Promise.resolve(),
              delete: () => Promise.resolve()
            }),
            add: () => Promise.resolve({ id: 'mock-id' }),
            where: () => ({
              get: () => Promise.resolve({ docs: [] }),
              orderBy: () => ({
                get: () => Promise.resolve({ docs: [] }),
                limit: () => ({
                  get: () => Promise.resolve({ docs: [] })
                })
              })
            })
          })
        };
        adminAuth = {
          verifyIdToken: () => Promise.resolve({ uid: 'mock-uid', email: 'mock@example.com' }),
          createCustomToken: () => Promise.resolve('mock-token'),
          getUser: () => Promise.resolve({ uid: 'mock-uid', email: 'mock@example.com' })
        };
      } else {
        // Initialize Firebase Admin with proper credentials
        const app = initializeApp({
          credential: cert({
            projectId,
            clientEmail,
            privateKey: privateKey.replace(/\\n/g, '\n'),
          }),
        });
        
        adminDb = getFirestore(app);
        adminAuth = getAuth(app);
        console.log('✅ Firebase Admin initialized successfully');
      }
    } else {
      // Use existing app
      const app = getApps()[0];
      adminDb = getFirestore(app);
      adminAuth = getAuth(app);
      console.log('✅ Firebase Admin using existing app');
    }
  } catch (error) {
    console.error('❌ Firebase Admin initialization failed:', error);
    
    // Create mock services as fallback
    adminDb = {
      collection: () => ({
        doc: () => ({
          get: () => Promise.resolve({ exists: false, data: () => null }),
          set: () => Promise.resolve(),
          update: () => Promise.resolve(),
          delete: () => Promise.resolve()
        }),
        add: () => Promise.resolve({ id: 'mock-id' }),
        where: () => ({
          get: () => Promise.resolve({ docs: [] }),
          orderBy: () => ({
            get: () => Promise.resolve({ docs: [] }),
            limit: () => ({
              get: () => Promise.resolve({ docs: [] })
            })
          })
        })
      })
    };
    adminAuth = {
      verifyIdToken: () => Promise.resolve({ uid: 'mock-uid', email: 'mock@example.com' }),
      createCustomToken: () => Promise.resolve('mock-token'),
      getUser: () => Promise.resolve({ uid: 'mock-uid', email: 'mock@example.com' })
    };
  }
} else {
  // Client-side: provide mock services
  console.warn('⚠️ Firebase Admin should not be used on the client side');
  adminDb = {
    collection: () => ({
      doc: () => ({
        get: () => Promise.resolve({ exists: false, data: () => null }),
        set: () => Promise.resolve(),
        update: () => Promise.resolve(),
        delete: () => Promise.resolve()
      }),
      add: () => Promise.resolve({ id: 'mock-id' }),
      where: () => ({
        get: () => Promise.resolve({ docs: [] }),
        orderBy: () => ({
          get: () => Promise.resolve({ docs: [] }),
          limit: () => ({
            get: () => Promise.resolve({ docs: [] })
          })
        })
      })
    })
  };
  adminAuth = {
    verifyIdToken: () => Promise.resolve({ uid: 'mock-uid', email: 'mock@example.com' }),
    createCustomToken: () => Promise.resolve('mock-token'),
    getUser: () => Promise.resolve({ uid: 'mock-uid', email: 'mock@example.com' })
  };
}

export { adminDb, adminAuth }; 