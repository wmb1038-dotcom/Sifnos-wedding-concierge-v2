// Travel-related reference data — pre-trip and on-arrival logistics.

export const ARRIVAL = {
  airport: {
    name: 'Athens International Airport',
    code: 'ATH',
    formalName: 'Eleftherios Venizelos International Airport',
    note: 'Located outside the city. Allow time for the transfer to Piraeus port.',
  },
  athensTip: 'If your schedule allows, spend a couple of days in Athens. It\'s one of history\'s great cultural centers — the birthplace of democracy, with thousands of years of stories.',
};

export const FERRIES = {
  description: 'Ferries depart daily from the Port of Piraeus (the main Athens port) to Sifnos. Travel time is about 2 hours 30 minutes on a fast ferry.',
  bookingUrl: 'https://ferries.gr/',
  stepByStepUrl: 'https://www.caroychris.com/stepbystep',
  tip: 'Book early — prices rise as the date approaches and September is busy for Greek domestic travel.',
  returnNote: 'After Sifnos, you can return to Athens by ferry, or hop to other islands. Santorini, Mykonos, Milos, Naxos, and Paros all have airports if you\'d rather fly back.',
};

export const GETTING_AROUND = [
  {
    method: 'Rent a car, scooter, or ATV',
    detail: 'Strongly recommended. Caro &amp; Chris used Suntrail (suntrail.gr/en). Most rentals are manual — if you want an automatic, book ahead.',
    icon: 'car',
    recommended: true,
  },
  {
    method: 'Public buses',
    detail: 'They exist, but are limited. The 2026 schedule will eventually be at dimos.sifnos.gr.',
    icon: 'bus',
  },
  {
    method: 'Taxis',
    detail: 'Very few on the island. Don\'t rely on them — book in advance if needed.',
    icon: 'taxi',
  },
  {
    method: 'Wedding-night private bus',
    detail: 'On the wedding night, the couple has arranged a private bus between Tsapis, Apollonia, and Platis Gialos (both directions).',
    icon: 'heart',
    recommended: true,
  },
];

export const PACKING_LIST = [
  {
    category: 'Wedding day',
    items: [
      'Sand-friendly footwear for the beach ceremony (no stilettos)',
      'Light layer or wrap — evenings on Sifnos can be windy',
      'Something to dance in for the late party',
    ],
  },
  {
    category: 'Beach &amp; day-to-day',
    items: [
      'Swimwear (multiple — they\'ll be wet a lot)',
      'A wide-brimmed hat &amp; sunglasses',
      'Reef-safe sunscreen',
      'Walking sandals that handle stone paths and beach scramble',
      'A light cover-up for moving between beach and taverna',
    ],
  },
  {
    category: 'Practical',
    items: [
      'European Type C/F plug adapters (two round pins)',
      'A small day bag for ferry &amp; beach',
      'Cash in euros for small tavernas and parking',
      'A reusable water bottle (tap water isn\'t for drinking; refill bottled)',
      'A light jacket or sweater for ferry crossings and breezy nights',
    ],
  },
  {
    category: 'Optional but nice',
    items: [
      'A book for ferry rides and quiet beach mornings',
      'A small notebook — Sifnos invites writing things down',
      'Snorkel mask if you\'re a swimmer — the water is clear',
    ],
  },
];

export const CURRENCY = {
  unit: 'Euro (€)',
  notes: [
    'ATMs are available throughout the island, especially in Apollonia and Kamares.',
    'Most places take cards, but smaller tavernas may prefer cash.',
    'Tipping: rounding up or 5–10% is generous. Not expected like in the US.',
  ],
};

export const PHRASEBOOK = [
  { greek: 'Καλημέρα',     romanized: 'Kalimera',     english: 'Good morning' },
  { greek: 'Καλησπέρα',    romanized: 'Kalispera',    english: 'Good evening' },
  { greek: 'Γεια σας',     romanized: 'Yia sas',      english: 'Hello (formal)' },
  { greek: 'Γεια',         romanized: 'Yia',          english: 'Hi (informal)' },
  { greek: 'Ευχαριστώ',    romanized: 'Efharisto',    english: 'Thank you' },
  { greek: 'Παρακαλώ',     romanized: 'Parakalo',     english: 'Please / you\'re welcome' },
  { greek: 'Ναι',          romanized: 'Ne',           english: 'Yes' },
  { greek: 'Όχι',          romanized: 'Ohi',          english: 'No' },
  { greek: 'Συγγνώμη',     romanized: 'Sygnomi',      english: 'Sorry / excuse me' },
  { greek: 'Γειά μας!',    romanized: 'Yamas!',       english: 'Cheers!' },
  { greek: 'Πόσο κάνει;',  romanized: 'Poso kani?',   english: 'How much is it?' },
  { greek: 'Δεν μιλάω ελληνικά', romanized: 'Den milao ellinika', english: 'I don\'t speak Greek' },
  { greek: 'Μιλάτε αγγλικά;', romanized: 'Milate anglika?', english: 'Do you speak English?' },
  { greek: 'Νερό',         romanized: 'Nero',         english: 'Water' },
  { greek: 'Κρασί',        romanized: 'Krasi',        english: 'Wine' },
  { greek: 'Παραλία',      romanized: 'Paralia',      english: 'Beach' },
  { greek: 'Λογαριασμό, παρακαλώ', romanized: 'Logariasmo, parakalo', english: 'The bill, please' },
  { greek: 'Ζήτω η αγάπη!', romanized: 'Zito i agapi!', english: 'Long live love!' },
];

export const EMERGENCY = {
  primary: {
    number: '112',
    label: 'European emergency line',
    detail: 'Works for police, fire, ambulance — anywhere in Greece.',
  },
  secondary: [
    { number: '166', label: 'Ambulance (direct)' },
    { number: '100', label: 'Police' },
    { number: '199', label: 'Fire department' },
  ],
  weddingContact: {
    label: 'Wedding logistics &amp; questions',
    detail: 'For anything wedding-specific, email Caro &amp; Chris directly:',
    email: 'hello@caroychris.com',
  },
  health: 'Sifnos has a small health center (Kentro Ygeias) in Apollonia. For anything serious you\'d be transferred to Athens by air ambulance — the system works, but the simplest step is always: dial 112.',
};

export const ISLAND_HOPPING = {
  intro: 'If you\'re extending the trip, here are the islands Caro &amp; Chris love most. Each has its own character.',
  favorites: [
    { name: 'Folegandros', note: 'The most beautiful "chora" they\'ve ever seen. Church on a hill, wild terrain.' },
    { name: 'Koufonissia', note: 'Small, few establishments, spectacular beaches.' },
    { name: 'Kimolos',     note: 'Small, few establishments, spectacular beaches.' },
    { name: 'Serifos',     note: 'Charming island with stunning beaches and an incredible chora.' },
  ],
  others: [
    { name: 'Santorini',   note: 'For the iconic Oia sunset — but one of the busiest Cyclades islands.' },
    { name: 'Mykonos',     note: 'If you want to party.' },
    { name: 'Ios / Paros', note: 'Also good for nightlife.' },
  ],
};

export const FAQ = [
  {
    q: 'When should I RSVP?',
    a: 'By the end of April 2026. Use the RSVP page on caroychris.com.',
  },
  {
    q: 'Is there a dress code?',
    a: 'Caro &amp; Chris want guests to feel confident and comfortable. The ceremony is on the beach, so plan for sand and a possible breeze. Bring a layer for the evening.',
  },
  {
    q: 'Can I bring a plus-one?',
    a: 'Unless it\'s indicated on your invitation, no additional plus-ones are being added — the couple is keeping the guest list to those formally invited.',
  },
  {
    q: 'Do I need to speak Greek?',
    a: 'No. English is widely spoken across Sifnos, especially in tourist-facing places. A few phrases (see the Travel tab) go a long way socially.',
  },
  {
    q: 'What about gifts?',
    a: '"Your presence is the best gift we could have." No registry. The couple is not expecting gifts.',
  },
  {
    q: 'Is there parking at the venue?',
    a: 'Yes — free on-site parking at Tsapis. The free Apokofto beach lot next door is good for overflow or overnight.',
  },
  {
    q: 'Any other questions?',
    a: 'Email Caro &amp; Chris directly at hello@caroychris.com — they\'ll respond as soon as they can.',
  },
];
