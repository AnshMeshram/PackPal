'use client';

import { Trip } from '@/types';

const STORAGE_KEY = 'packpal_trips';

export const DEFAULT_DEMO_TRIP: Trip = {
  id: 'demo-trip',
  name: 'Goa Getaway',
  destination: 'Goa, India',
  startDate: '2026-10-15',
  endDate: '2026-10-18',
  durationDays: 4,
  tripType: 'vacation',
  baggageLimitKg: 7,
  luggage: {
    id: 'lug-1',
    bagType: 'cabin',
    bagName: 'Cabin Trolley',
    maxWeightKg: 7,
    pieces: 1,
    dimensions: { lengthCm: 55, widthCm: 40, heightCm: 20 },
  },
  members: [
    { id: 'm1', name: 'Ansh', preferences: { notes: 'Packs light, carries daypack' } },
    { id: 'm2', name: 'Rahul', preferences: { dietary: ['Vegetarian'], notes: 'Carries first-aid kit' } },
    { id: 'm3', name: 'Aman', preferences: { dietary: ['No Seafood'] } },
    { id: 'm4', name: 'Riya', preferences: { notes: 'Brings camera & drone gear' } },
  ],
  activities: [
    { id: 'a1', name: 'Beach & Swimming', day: 2, time: '09:00', category: 'beach', requiredGear: ['Swimwear', 'Beach Towel', 'Waterproof pouch'] },
    { id: 'a2', name: 'Coastal Trekking', day: 3, time: '07:00', category: 'hiking', requiredGear: ['Hiking shoes', 'Hydration pack'] },
    { id: 'a3', name: 'Heritage Walk', day: 3, time: '15:00', category: 'sightseeing', requiredGear: ['Walking shoes', 'Hat'] },
    { id: 'a4', name: 'Sunset Dining', day: 1, time: '20:00', category: 'dining', requiredGear: ['Evening casuals'] },
  ],
  itinerary: [
    {
      id: 'it1', day: 1, date: '2026-10-15',
      activities: [
        { id: 'ia1', name: 'Arrival at Dabolim Airport', time: '10:00', notes: 'Prepaid taxi stand at exit' },
        { id: 'ia2', name: 'Hotel Check-in & Settle in', time: '14:00', notes: 'Villa near Calangute' },
        { id: 'ia3', name: 'Sunset Drinks & Welcome Dinner', time: '19:30', notes: 'Reserved table by the water' },
      ],
    },
    {
      id: 'it2', day: 2, date: '2026-10-16',
      activities: [
        { id: 'ia4', name: 'Baga Beach & Water Sports', time: '09:00', notes: 'Jet ski & parasailing booking' },
        { id: 'ia5', name: 'Seaside Cafe Lunch', time: '13:30', notes: 'Try coastal curry' },
        { id: 'ia6', name: 'Catamaran Sunset Cruise', time: '17:30', notes: 'Boarding at 17:15 sharp' },
      ],
    },
    {
      id: 'it3', day: 3, date: '2026-10-17',
      activities: [
        { id: 'ia7', name: 'Fort Aguada & Coastal Trek', time: '07:30', notes: 'Carry water and sun protection' },
        { id: 'ia8', name: 'Old Goa Heritage Walk & Churches', time: '14:00', notes: 'Modest attire required' },
      ],
    },
    {
      id: 'it4', day: 4, date: '2026-10-18',
      activities: [
        { id: 'ia9', name: 'Local Spice & Flea Market', time: '10:00', notes: 'Cashews and souvenirs' },
        { id: 'ia10', name: 'Hotel Checkout & Departure', time: '13:00', notes: 'Flight at 16:30' },
      ],
    },
  ],
  packingItems: [
    { id: 'p1', name: 'Government ID & Flight Passes', category: 'documents', quantity: 1, packed: true, essential: true, priority: 'essential', weightEstimateKg: 0.1, source: 'ai' },
    { id: 'p2', name: 'Phone Charger & Universal Adapter', category: 'electronics', quantity: 1, packed: true, essential: true, priority: 'essential', weightEstimateKg: 0.15, source: 'ai' },
    { id: 'p3', name: 'Quick-Dry Swimwear & Microfiber Towel', category: 'beach', quantity: 2, packed: true, essential: true, priority: 'essential', weightEstimateKg: 0.45, source: 'ai' },
    { id: 'p4', name: 'Broad Spectrum Sunscreen SPF 50+', category: 'toiletries', quantity: 1, packed: true, essential: true, priority: 'essential', weightEstimateKg: 0.2, source: 'ai' },
    { id: 'p5', name: 'Breathable Cotton T-Shirts', category: 'clothing', quantity: 4, packed: true, essential: false, priority: 'recommended', weightEstimateKg: 0.6, source: 'ai' },
    { id: 'p6', name: 'Linen Shorts & Evening Chinos', category: 'clothing', quantity: 2, packed: false, essential: false, priority: 'recommended', weightEstimateKg: 0.5, source: 'ai' },
    { id: 'p7', name: 'Trail Hiking Shoes & Grip Socks', category: 'hiking', quantity: 1, packed: false, essential: true, priority: 'essential', weightEstimateKg: 0.85, source: 'activity' },
    { id: 'p8', name: '10,000mAh Power Bank & Cables', category: 'electronics', quantity: 1, packed: false, essential: false, priority: 'recommended', weightEstimateKg: 0.25, source: 'ai' },
    { id: 'p9', name: 'Polarized Sunglasses & Case', category: 'accessories', quantity: 1, packed: false, essential: false, priority: 'recommended', weightEstimateKg: 0.08, source: 'ai' },
  ],
  expenses: [
    { id: 'e1', description: 'Group Welcome Dinner', amountPaise: 240000, paidBy: 'Rahul', participants: ['Ansh', 'Rahul', 'Aman', 'Riya'], category: 'Food', splitMethod: 'equal', timestamp: '2026-10-15T20:00:00' },
    { id: 'e2', description: 'Airport Prepaid Cab', amountPaise: 120000, paidBy: 'Ansh', participants: ['Ansh', 'Rahul', 'Aman', 'Riya'], category: 'Transport', splitMethod: 'equal', timestamp: '2026-10-15T10:30:00' },
    { id: 'e3', description: 'Beachfront Villa Booking', amountPaise: 400000, paidBy: 'Aman', participants: ['Ansh', 'Rahul', 'Aman', 'Riya'], category: 'Accommodation', splitMethod: 'equal', timestamp: '2026-10-15T14:00:00' },
    { id: 'e4', description: 'Jet Ski & Water Sports Tickets', amountPaise: 160000, paidBy: 'Riya', participants: ['Ansh', 'Rahul', 'Aman', 'Riya'], category: 'Activities', splitMethod: 'equal', timestamp: '2026-10-16T10:00:00' },
  ],
  createdAt: '2026-10-15T00:00:00.000Z',
  updatedAt: '2026-10-15T00:00:00.000Z',
};

export function getTrips(): Trip[] {
  if (typeof window === 'undefined') return [DEFAULT_DEMO_TRIP];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [DEFAULT_DEMO_TRIP];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [DEFAULT_DEMO_TRIP];
  } catch {
    console.error('Failed to parse trips from localStorage');
    return [DEFAULT_DEMO_TRIP];
  }
}

export function getTrip(id: string): Trip | null {
  const trips = getTrips();
  const found = trips.find((t) => t.id === id);
  if (found) return found;
  if (id === 'demo-trip' || id === 'goa-getaway') return DEFAULT_DEMO_TRIP;
  return null;
}

export function saveTrip(trip: Trip): void {
  const trips = getTrips();
  const existingIndex = trips.findIndex((t) => t.id === trip.id);
  if (existingIndex >= 0) {
    trips[existingIndex] = trip;
  } else {
    trips.push(trip);
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
  }
}

export function updateTrip(id: string, updates: Partial<Trip>): Trip | null {
  const trips = getTrips();
  const idx = trips.findIndex((t) => t.id === id);
  if (idx < 0) {
    if (id === 'demo-trip' || id === 'goa-getaway') {
      const updated = { ...DEFAULT_DEMO_TRIP, ...updates, updatedAt: new Date().toISOString() };
      saveTrip(updated);
      return updated;
    }
    return null;
  }
  trips[idx] = { ...trips[idx], ...updates, updatedAt: new Date().toISOString() };
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
  }
  return trips[idx];
}

export function deleteTrip(id: string): void {
  const trips = getTrips().filter((t) => t.id !== id);
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
  }
}

export function clearTrips(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
