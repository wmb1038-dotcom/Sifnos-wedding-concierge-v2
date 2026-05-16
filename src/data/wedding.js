// All times in Greek local time (UTC+3 in September — Greece is on EEST then).
// The 'iso' field is what JavaScript Date will parse for countdowns.

export const WEDDING_DATE_ISO = '2026-09-04';
export const WEDDING_TZ = 'Europe/Athens';

export const SCHEDULE = [
  {
    id: 'welcome-drink',
    start: '2026-09-04T18:00:00+03:00',
    end:   '2026-09-04T18:30:00+03:00',
    title: 'Welcome Drink',
    detail: 'Arrive at Tsapis Tavern. Settle in, say hello, raise a glass.',
    icon: 'glass',
  },
  {
    id: 'ceremony',
    start: '2026-09-04T18:30:00+03:00',
    end:   '2026-09-04T19:00:00+03:00',
    title: 'Ceremony',
    detail: 'On Apokofto beach, with the Chrysopigi monastery just there.',
    icon: 'rings',
    highlight: true,
  },
  {
    id: 'aperitivo',
    start: '2026-09-04T19:00:00+03:00',
    end:   '2026-09-04T20:00:00+03:00',
    title: 'Aperitivo',
    detail: 'Drinks, light bites, golden hour over the water.',
    icon: 'olive',
  },
  {
    id: 'dinner',
    start: '2026-09-04T20:00:00+03:00',
    end:   '2026-09-04T22:00:00+03:00',
    title: 'Dinner',
    detail: 'Long table, long courses — bring your appetite and your stories.',
    icon: 'plate',
  },
  {
    id: 'party',
    start: '2026-09-04T22:00:00+03:00',
    end:   '2026-09-05T02:30:00+03:00',
    title: 'Party',
    detail: 'Until 2:30am. The buses keep running. Dance.',
    icon: 'music',
  },
];

export const VENUE = {
  name: 'Tsapis Tavern',
  address: 'Chrysopigi 840 03, Sifnos, Greece',
  phone: '+302284071272',
  phoneDisplay: '+30 2284 071 272',
  beach: 'Apokofto Beach',
  lat: 36.9492,   // approximate — for map centering
  lng: 24.7488,
  mapsUrl: 'https://maps.app.goo.gl/s81bVCsNfUDx51xi6',
  parking: 'Free on-site parking. Overflow at the free Apokofto beach lot next door.',
};

export const DRESS_CODE = {
  short: 'Confident, comfortable, beach-friendly.',
  long: [
    'The ceremony is on the beach — sand-friendly shoes recommended; leave the stilettos at home.',
    'Evenings on Sifnos can get a little chilly because of the wind. Bring a jacket or wrap.',
    'Beyond that, Caro and Chris want guests to feel like themselves.',
  ],
};

export const BUS_ROUTE = {
  description: 'The couple has arranged a private bus on the wedding night between Tsapis, Apollonia, and Platis Gialos — both directions. Exact pickup times and stops will be confirmed closer to the date.',
  link: 'https://www.caroychris.com/busroute',
  stops: [
    // Placeholder — replace once Caro & Chris confirm exact times.
    { name: 'Apollonia central', detail: 'Pickup times TBD' },
    { name: 'Platis Gialos central square', detail: 'Pickup times TBD' },
    { name: 'Tsapis Tavern (return)', detail: 'Return runs through the night until 2:30am' },
  ],
};

export const PLUS_ONE_POLICY = 'Plus-ones only as indicated on each invitation. The couple is not accepting additional plus-ones beyond those formally invited.';

export const GIFT_POLICY = '"Your presence is the best gift we could have." No registry, no expectations.';

export const RSVP_DEADLINE = 'End of April 2026';
export const RSVP_URL = 'https://www.caroychris.com/rsvp';
export const WEDDING_WEBSITE = 'https://www.caroychris.com';
export const WEDDING_EMAIL = 'hello@caroychris.com';

export const COUPLE_STORY = `They met in early 2020 in Mexico City. Caro was looking for a new apartment; Chris was packing for a move to Washington D.C. Caro went to tour Chris's place — and Chris herself gave the tour.

Then the pandemic locked the world down, and Chris's move was put on hold. The apartment next door to Chris opened up, and Caro moved in next door — no second thought.

From neighbors to friends to wives. Six years, three countries, four cities, one sweet adopted dog, and a lifetime of dreams ahead.`;

export const TAGLINE = {
  greek: 'Ζήτω η αγάπη!',
  english: 'Long live love.',
};
