import { strong } from "./colors";

export const dialogues = {
  secret1: [
    "There's an inscription on the floor:",
    `<center>The cycle of life<br>
a natural balance comes<br>
to those who seek it</center>`,
    `You gain the knowledge of ${strong("Harmony")}!`,
  ],
  secret1b: [
    "Could this be part of the secret of magic?",
    "You knew these ruins were a good place to look!",
  ],
  secret1c: [
    `Hint: Press ${strong(
      "T"
    )} at any time to transform<br>into an animal form.`,
  ],
  chestScroll: [
    "Inside the chest is a weathered scroll.",
    /* show scroll picture with poem above */
    // "The message on the scroll is showing how creatures must adapt.",
  ],
  chestPoem: [
    [
      `To survive<br>`,
      `you may have to hide<br>`,
      `To breathe<br>`,
      `you may have to squeeze<br><br>`,
      `Adapt to come alive`,
    ].join(""),
  ],
  chestScroll2: [`You learn the secret of ${strong("Adaptation")}!`],
  spikePainting: ["Something is painted here..."],
  spikePainting2: [
    // "This image seems to show you the power of animal instincts.",
    `You learn the secret of ${strong("animal instincts")}!`,
  ],
  rubbleMelody: [
    "Suddenly a song fills the air.",
    // play a tune
    "The melody enlightens you with the secret of inner peace.",
  ],
  secretFinal: [
    "There's a mirror on the wall.",
    // show mirror image
    "The mirror is reflecting your true self, revealing the magic of transformation. It was worth all the time you spent searching, for you have discovered the secret of magic!",
    // rumble screen
    "Oh no! The ruins are collapsing! You will have to escape through the water using your newest form!",
  ],
};
