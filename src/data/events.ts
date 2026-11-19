export interface MemberEvent {
  id: string;
  title: string;
  category: 'Community' | 'Training' | 'Wellness' | 'Leadership';
  date: string;
  time: string;
  location: string;
  description: string;
  meaning: string;
  image: string;
}

export const MEMBER_EVENTS: MemberEvent[] = [
  {
    id: 'evt-campfire-night',
    title: 'Hellobee Campfire Night',
    category: 'Community',
    date: '2026-12-12',
    time: '6:30 PM',
    location: 'Lakeside Camp, Austin, TX',
    description:
      'An evening around the bonfire with music, group dances, and stories from members across every rank, LV1 to LV10.',
    meaning:
      'Joined hands around one fire show that every member stands equal in the circle. The warmth belongs to everyone, and the circle grows stronger with each person who joins.',
    image: '/images/events/campfire.webp',
  },
  {
    id: 'evt-hydration-workshop',
    title: 'Hydration & Alkaline Water Workshop',
    category: 'Training',
    date: '2026-12-05',
    time: '10:00 AM',
    location: 'Hellobee Studio, San Jose, CA',
    description:
      'Hands-on pH and ORP demonstrations, filter maintenance, and how to guide new customers through their first machine.',
    meaning:
      'Knowledge shared openly makes every member a confident, trustworthy guide for the people they invite.',
    image: '/images/events/campfire.webp',
  },
  {
    id: 'evt-wellness-hike',
    title: 'Sunrise Wellness Hike',
    category: 'Wellness',
    date: '2027-01-17',
    time: '6:00 AM',
    location: 'Griffith Park, Los Angeles, CA',
    description:
      'A guided morning hike with a hydration station, stretching session, and a healthy breakfast for members and guests.',
    meaning: 'Healthy habits are easier together. We walk, hydrate, and recharge as a community.',
    image: '/images/events/campfire.webp',
  },
  {
    id: 'evt-leadership-summit',
    title: 'Network Leadership Summit',
    category: 'Leadership',
    date: '2027-02-20',
    time: '9:00 AM',
    location: 'Downtown Conference Center, Dallas, TX',
    description:
      'Rank-up celebrations, team-building sessions, and strategy talks for LV3 to LV10 leaders and rising consultants.',
    meaning:
      'Leaders grow by lifting others. This summit recognizes the members whose teams have grown the network.',
    image: '/images/events/campfire.webp',
  },
];
