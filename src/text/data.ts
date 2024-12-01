import { highlight, strong } from "./colors";

export type Location = {
  id: LocationKey;
  description: string;
  connections?: { [key: string]: LocationKey }; // directions you can go from this location
  hiddenConnections?: { [key: string]: LocationKey }; // same as above but not obvious in the UI
  commands?: { [key: string]: string }; // extra commands you can type (other than directions)
  effects?: () => void;
  pressEnterKey?: LocationKey;
  originTiles?: { x: number[]; y: number[] };
  destinationTile?: { x: number; y: number };
};

export type LocationKey = keyof typeof keys;

export const keys = {
  auto: true,
  start: true,
  "1-entrance": true,
  "1-hallway": true,
  "1-west-hallway": true,
  "1-dead-end": true,
  "1-secret-tunnel": true,
  "1-secret-room": true,
  "1-spike-room": true,
  "1-spike-room-squeeze": true,
  "1-spike-room-beyond": true,
  "1-spike-room-return": true,
  "1-rubble": true,
};

// ideas:
//   description: "You hear faint water dripping. It echoes in the tunnels.",
//   "The sound grows louder as you strain your ears.",
//   "You sense vibrations in the ground from the north.",

export const locations: Location[] = [
  {
    id: "start",
    description: "",
    pressEnterKey: "auto",
  },
  {
    id: "1-entrance",
    originTiles: {
      x: [14, 15, 16],
      y: [10, 11, 12, 13, 14, 15, 16, 17, 18],
    },
    destinationTile: { x: 15, y: 14 },
    description: `The area around you is vast. A cold draft tickles your fur from the north.
The smells of the jungle waft down from a hole in the ceiling where you entered the ruins.`,
    connections: { north: "1-hallway" },
    commands: {
      "look jungle": "It was full of predators anyway. Safer down here.",
      "look hole":
        "The hole is well out of reach, especially as a rat. The only way appears to be forward.",
    },
  },
  {
    id: "1-hallway",
    originTiles: {
      x: [14, 15, 16],
      y: [7, 8, 9],
    },
    destinationTile: { x: 15, y: 7 },
    description:
      "Your whiskers brush against cold stone walls. The path diverges ahead.",
    connections: {
      south: "1-entrance",
      west: "1-west-hallway",
      north: "1-rubble",
    },
  },
  {
    id: "1-rubble",
    originTiles: {
      x: [16, 17, 18],
      y: [4, 5, 6],
    },
    destinationTile: { x: 18, y: 5 },
    description:
      "The path is blocked by a pile of rubble. You can see a faint light to the north.",
    connections: { south: "1-hallway" },
    commands: {
      look: "Your instincts tell you there's no way you'll be able to get over or through this rubble in your current form.",
      jump: "The rubble goes all the way to the ceiling.",
    },
  },
  {
    id: "1-west-hallway",
    originTiles: {
      x: [11, 12, 13],
      y: [7],
    },
    destinationTile: { x: 12, y: 7 },
    description:
      "You scurry forward. The air smells damp and earthy. You hear nothing but silence to the west but faint echoes to the north.",
    connections: {
      west: "1-dead-end",
      north: "1-spike-room",
      east: "1-hallway",
    },
  },
  {
    id: "1-spike-room",
    originTiles: {
      x: [12],
      y: [5, 6],
    },
    destinationTile: { x: 12, y: 5 },
    description: `You sense danger. The room ahead smells strongly of metal.
You cautiously scurry forward and find enormous ${strong(
      "spikes"
    )} jutting out of the floor.`,
    connections: { south: "1-west-hallway" },
    hiddenConnections: { squeeze: "1-spike-room-squeeze" },
    commands: {
      look: "The metal spikes are everywhere, but you think you could squeeze between them.",
      // FIXME: the strong doesn't show up because it's not DOM
      "look spikes": `The metal spikes are everywhere, but you think you could ${strong(
        "squeeze"
      )} between them.`,
      "squeeze between":
        "You slowly navigate among the spikes. You nick your tail slightly but manage to make it to the other side.",
      jump: "That seems like a terrible idea. You can't even see where the spikes end.",
    },
  },
  {
    id: "1-spike-room-squeeze",
    // no origin tiles
    description: `You slowly navigate among the spikes. You nick your tail slightly but manage to make it to the other side.`,
    pressEnterKey: "1-spike-room-beyond",
  },
  {
    id: "1-spike-room-beyond",
    originTiles: {
      x: [12],
      y: [1],
    },
    destinationTile: { x: 12, y: 1 },
    description: `You brush up against a cold raised surface. You're too small to get a better look.`,
    connections: { back: "1-spike-room-return" },
  },
  {
    id: "1-spike-room-return",
    description: `You bypass the spikes easily this time. You feel more comfortable than ever as a rat.`,
    connections: { south: "1-west-hallway" },
  },
  {
    id: "1-dead-end",
    originTiles: {
      x: [11],
      y: [8],
    },
    destinationTile: { x: 11, y: 8 },
    description: `You have a good feeling as the tunnel curves, but then you nearly run into a wall. The path is blocked.
Or is it? Your whiskers twitch as you detect a small gap in the base of the wall.`,
    connections: { gap: "1-secret-tunnel", north: "1-west-hallway" },
  },
  {
    id: "1-secret-tunnel",
    // no origin tiles
    description: `You scurry through the gap and discover a narrow earthen tunnel. Following it eventually leads to a small room.`,
    pressEnterKey: "1-secret-room",
  },
  {
    id: "1-secret-room",
    originTiles: {
      x: [3, 4],
      y: [16, 17],
    },
    destinationTile: { x: 3, y: 16 },
    description: `The air here is stale, and you sense that few people have ever visited this place. At the center of the room is a large wooden object.`,
    connections: { tunnel: "1-west-hallway" },
    commands: {
      look: "You see a large wooden object. Smells like oak. Your limited eyesight makes it tough to see the details.",
      "look object":
        "You see a large wooden object. Smells like oak. Your limited eyesight makes it tough to see the details.",
      "look wooden object":
        "You see a large wooden object. Smells like oak. Your limited eyesight makes it tough to see the details.",
      "look tunnel": "It's where you came from.",
      take: "It's too heavy.",
      get: "It's too heavy.",
    },
  },
  // effects: () => this.pulseBackground("#3366cc", 500),
  // effects: () => this.fadeBackground("#ffcc00", 2000),
  // effects: () => this.flashScreen("#555555", 1000),
  // },
];
