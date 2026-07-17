import { readFileSync } from 'fs';
import { join } from 'path';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { afterAll, beforeAll, describe, it } from 'vitest';

// Exercises the real, deployed rules file against a local Firestore emulator — the only way to
// actually prove what these rules allow, rather than reasoning about them by eye. That reasoning
// failed once already: a flat `match /{document=**} { allow read, write: if true; }` catch-all
// silently overrode the restrictive users/{uid} and config/{document} rules above it, since
// Firestore grants access if ANY matching rule allows it. This suite would have caught that.
let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'firestore-rules-test',
    firestore: {
      rules: readFileSync(join(__dirname, '../../firestore.rules'), 'utf8'),
      host: '127.0.0.1',
      port: 8081,
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

describe('firestore.rules — users/{uid}', () => {
  it('lets a signed-in user read their own profile', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await ctx.firestore().collection('users').doc('alice').set({ role: 'customer', permissions: [] });
    });
    const alice = testEnv.authenticatedContext('alice').firestore();
    await assertSucceeds(alice.collection('users').doc('alice').get());
  });

  it('blocks a signed-in user from reading a different user\'s profile', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await ctx.firestore().collection('users').doc('bob').set({ role: 'customer', permissions: [] });
    });
    const alice = testEnv.authenticatedContext('alice').firestore();
    await assertFails(alice.collection('users').doc('bob').get());
  });

  it('lets a signed-in user update their own non-privileged fields', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await ctx.firestore().collection('users').doc('alice').set({ role: 'customer', permissions: [], name: 'Alice' });
    });
    const alice = testEnv.authenticatedContext('alice').firestore();
    await assertSucceeds(
      alice.collection('users').doc('alice').update({ name: 'Alice Smith' })
    );
  });

  it('blocks a signed-in user from escalating their own role to admin (regression: the catch-all rule below used to silently override this check entirely, since Firestore grants access if ANY matching rule allows it — this is the exact vulnerability this rules file exists to close)', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await ctx.firestore().collection('users').doc('alice').set({ role: 'customer', permissions: [] });
    });
    const alice = testEnv.authenticatedContext('alice').firestore();
    await assertFails(
      alice.collection('users').doc('alice').update({ role: 'admin' })
    );
  });

  it('blocks a signed-in user from granting themselves extra permissions', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await ctx.firestore().collection('users').doc('alice').set({ role: 'customer', permissions: [] });
    });
    const alice = testEnv.authenticatedContext('alice').firestore();
    await assertFails(
      alice.collection('users').doc('alice').update({ permissions: ['admin:all'] })
    );
  });

  it('blocks an unauthenticated request from reading or writing any user profile', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await ctx.firestore().collection('users').doc('alice').set({ role: 'customer', permissions: [] });
    });
    const anon = testEnv.unauthenticatedContext().firestore();
    await assertFails(anon.collection('users').doc('alice').get());
    await assertFails(anon.collection('users').doc('alice').update({ role: 'admin' }));
  });
});

describe('firestore.rules — config/{document}', () => {
  it('blocks a non-admin signed-in user from writing business-rules config (regression: same catch-all-override bug as users/{uid})', async () => {
    const alice = testEnv.authenticatedContext('alice').firestore();
    await assertFails(alice.collection('config').doc('pricing').set({ baseFare: 0 }));
  });

  it('lets an admin user write business-rules config', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await ctx.firestore().collection('users').doc('admin-1').set({ role: 'admin', permissions: [] });
    });
    const admin = testEnv.authenticatedContext('admin-1').firestore();
    await assertSucceeds(admin.collection('config').doc('pricing').set({ baseFare: 20 }));
  });
});

describe('firestore.rules — everything else (unrestricted catch-all)', () => {
  it('still allows unrestricted access to a non-users, non-config collection (the documented, intentional scoping — server routes on the client SDK with no Firebase Auth session depend on this)', async () => {
    const anon = testEnv.unauthenticatedContext().firestore();
    await assertSucceeds(anon.collection('reviews').doc('r1').set({ rating: 5 }));
  });
});
