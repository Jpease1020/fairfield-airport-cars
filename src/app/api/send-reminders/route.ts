import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { sendSms } from '@/lib/twilio-service';
import { sendConfirmationEmail } from '@/lib/email-service';

const BOOKINGS_COL = collection(db, 'bookings');

export async function POST() {
  const now = new Date();
  const in24hStart = new Date(now.getTime() + 23 * 60 * 60 * 1000);
  const in24hEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000);

  const soonStart = now;
  const soonEnd = new Date(now.getTime() + 30 * 60 * 1000);

  let reminders = 0;
  let onMyWay = 0;

  // 24-hour reminders
  const q1 = query(
    BOOKINGS_COL,
    where('pickupDateTime', '>=', in24hStart),
    where('pickupDateTime', '<=', in24hEnd),
    where('reminderSent', '!=', true),
    where('status', 'in', ['pending', 'confirmed'])
  );
  const remindSnap = await getDocs(q1);
  for (const docSnap of remindSnap.docs) {
    const b = docSnap.data() as any;
    const msg = `Reminder: Your ride is scheduled for ${new Date(b.pickupDateTime).toLocaleString()}. See details: ${process.env.NEXT_PUBLIC_BASE_URL}/status/${docSnap.id}`;
    await Promise.all([
      sendSms({ to: b.phone, body: msg }),
      sendConfirmationEmail({ ...(b as any), id: docSnap.id }),
      updateDoc(doc(db, 'bookings', docSnap.id), { reminderSent: true, updatedAt: new Date() }),
    ]);
    reminders++;
  }

  // On-my-way (30-min) notices
  const q2 = query(
    BOOKINGS_COL,
    where('pickupDateTime', '>=', soonStart),
    where('pickupDateTime', '<=', soonEnd),
    where('onMyWaySent', '!=', true),
    where('status', '==', 'confirmed')
  );
  const waySnap = await getDocs(q2);
  for (const docSnap of waySnap.docs) {
    const b = docSnap.data() as any;
    const msg = `Your driver is on the way and will arrive around ${new Date(b.pickupDateTime).toLocaleTimeString()}.`;
    await Promise.all([
      sendSms({ to: b.phone, body: msg }),
      updateDoc(doc(db, 'bookings', docSnap.id), { onMyWaySent: true, updatedAt: new Date() }),
    ]);
    onMyWay++;
  }

  return NextResponse.json({ reminders, onMyWay });
} 