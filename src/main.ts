import { Boot } from "./scenes/Boot";
import { TopDown } from "./scenes/TopDown";
import { Preloader } from "./scenes/Preloader";
import { GameOver } from "./scenes/GameOver";
import { MainMenu } from "./scenes/MainMenu";
import { TextAdventure } from "./scenes/TextAdventure";
import { InfiniteRunner } from "./scenes/InfiniteRunner";
import { Dialogue } from "./scenes/Dialogue";

import { Game, Types } from "phaser";

//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1024,
  height: 768,
  parent: "game-container",
  backgroundColor: "#000000",
  pixelArt: true,
  roundPixels: false,
  scale: {
    // mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  dom: {
    createContainer: true,
  },
  scene: [
    Boot,
    Preloader,
    MainMenu,
    TopDown,
    Dialogue,
    TextAdventure,
    GameOver,
    InfiniteRunner,
  ],
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 0 },
      // debug: true,
    },
  },
};

export default new Game(config);
