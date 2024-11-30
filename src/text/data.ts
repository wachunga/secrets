
export type Location = {
  id: LocationKey;
  description: string;
  connections?: { [key: string]: LocationKey }; // directions you can go from this location
  commands?: { [key: string]: string }; // extra commands you can type (other than directions)
  effects?: () => void;
  coordinates?: { x: number; y: number };
  pressEnterKey?: LocationKey;
}

const colors = {
  dark: '#121212',
  primary: '#a6bf9e',
  primary2: '#91B087',
  tertiary: '#aaaaaa',
  card: '#282828',
  text: '#FFFFFF'
}

export function colored(text: string, color: keyof typeof colors) {
  return `<span style="color: ${colors[color]}; font-weight: bold;">${text}</span>`;
}

export function highlight(text: string) {
  return `<span style="font-weight: bold;">${text}</span>`;
}

export function strong(text: string) {
  return `<span style="color: ${colors.primary2};">${text}</span>`;
}
export function weak(text: string) {
  return `<span style="color: ${colors.tertiary};">${text}</span>`;
}

export type LocationKey = keyof typeof keys;

export const keys = {
  'auto': true,
  'start': true,
  '1-entrance': true,
  '1-stairs-up': true,
  '1-hallway': true,
  '1-west-hallway': true,
  '1-dead-end': true,
  '1-secret-tunnel': true,
  '1-secret-room': true,
  '1-spike-room': true,
  '1-spike-room-beyond': true,
  '1-rubble': true,
}

// ideas:
//   description: "You hear faint water dripping. It echoes in the tunnels.",
// "You hear faint squeaks in the distance.",
//     "The cheese smells enticing, but there's a faint metallic scent as well.",
//     "A predator might be nearby.",
//   "The sound grows louder as you strain your ears.",
//   "You sense vibrations in the ground from the north.",

export const locations: Location[] = [
  {
    id: "start",
    description: '',
    pressEnterKey: 'auto',
  },
  {
    id: "1-entrance",
    description: `The area around you is vast. A cold draft tickles your fur from the north.
To the south, the smells of the jungle waft down the stairs.`,
    connections: { north: "1-hallway", south: '1-stairs-up' },
    coordinates: { x: 248 - 8, y: 232 - 8 },
    commands: {
      "look stairs": "The stairs are ancient... and way too steep for a rat to comfortably climb.",
    }
  },
  {
    id: "1-stairs-up",
    description: `The jungle is full of predators. You decide to stay on this level for now.`,
    connections: { back: '1-entrance' },
  },
  {
    id: "1-hallway",
    description:
      "Your whiskers brush against cold stone walls. The path diverges ahead.",
    connections: { south: "1-entrance", west: '1-west-hallway', north: '1-rubble' },
  },
  {
    id: "1-west-hallway",
    description:
      "You scurry forward. The air smells damp and earthy. You hear nothing but silence to the west but faint echoes to the north.",
    connections: { west: '1-dead-end', north: '1-spike-room', east: '1-hallway' },
  },
  {
    id: '1-spike-room',
    description:
      `You sense danger. The room ahead smells strongly of metal.
You cautiously scurry forward and find enormous spikes jutting out of the floor.`,
    connections: { south: '1-west-hallway' },
    commands: {
      "look": "The metal spikes are everywhere, but you think you could squeeze between them.",
      "look spikes": "The metal spikes are everywhere, but you think you could squeeze between them.",
      "squeeze": "You slowly navigate among the spikes. You nick your tail slightly but manage to make it to the other side.",
      "squeeze between": "You slowly navigate among the spikes. You nick your tail slightly but manage to make it to the other side.",
      "jump": "That seems like a terrible idea. You can't even see where the spikes end.",
    },
  },
  {
    id: "1-dead-end",
    description:
      `You have a good feeling as the tunnel curves, but then you nearly run into a wall. The path is blocked.
Or is it? Your whiskers twitch as you detect a small gap in the base of the wall.`,
    connections: { hole: '1-secret-tunnel', north: '1-west-hallway' },
  },
  {
    id: "1-secret-tunnel",
    description:
      `You scurry through the gap and discover a winding tunnel. You eventually find yourself in a small room.`,
    pressEnterKey: '1-secret-room',
  },
  {
    id: "1-secret-room",
    description:
      `You scurry through the crack and follow a winding tunnel. You eventually find yourself in a small room.
The air is stale, and you sense that few people have ever visited this place. At the center of the room is a large wooden object.`,
    connections: { tunnel: '1-west-hallway' },
    commands: {
      "look": "You see a large wooden object. Smells like oak. Your limited eyesight makes it tough to see the details.",
      "look object": "You see a large wooden object. Smells like oak. Your limited eyesight makes it tough to see the details.",
      "look wooden object": "You see a large wooden object. Smells like oak. Your limited eyesight makes it tough to see the details.",
      "look tunnel": "It's where you came from.",
      "take": "It's too heavy.",
    },
    coordinates: { x: 184 - 8, y: 200 - 8 },
  },
  // effects: () => this.pulseBackground("#3366cc", 500),
  // effects: () => this.fadeBackground("#ffcc00", 2000),
  // effects: () => this.flashScreen("#555555", 1000),
  // },
];

