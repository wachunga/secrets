import { strong } from "./colors";

export const dialogues = {
  intro: [
    `A cloaked girl with the unpredictable ability to<br>transform into a rat has spent all of her life<br>trying to gain control of her power.`,
    `Years of research have led her here,<br>jungle ruins on a remote island.`,
    `<p style="margin-top: 200px">The secret of magic awaits,<br>but finding it will not be easy!`,
  ],
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
  chestScroll: ["Inside the chest is a weathered scroll."],
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
    `After studying it for a while...<br><br>You learn the secret of ${strong(
      "Animal Instincts"
    )}!`,
  ],
  rubbleMelody: ["Suddenly a song fills the air..."],
  rubbleMelody2: [
    `The beautiful melody teaches you<br>the secret of ${strong(
      "Inner Peace"
    )}!`,
  ],
  secretFinal: [
    // show mirror image
    "The mirror is reflecting your true self, revealing the magic of transformation. It was worth all the time you spent searching, for you have discovered the secret of magic!",
    // rumble screen
    "Oh no! The ruins are collapsing! You will have to escape through the water using your newest form!",
  ],
};
