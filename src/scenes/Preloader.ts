import { Scene } from "phaser";

export class Preloader extends Scene {
  constructor() {
    super("Preloader");
  }

  init() {
    //  A simple progress bar. This is the outline of the bar.
    this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);
    //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
    const bar = this.add.rectangle(512 - 230, 384, 4, 28, 0xffffff);
    //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
    this.load.on("progress", (progress: number) => {
      //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
      bar.width = 4 + 460 * progress;
    });
  }

  preload() {
    this.load.setPath("assets");

    this.load.image("title-screen", "title-screen2.jpeg");
    this.load.image("mask", "mask1.png");

    // human form
    this.load.image("floor-tiles", "tiles/atlas_floor-16x16.png");
    this.load.image("wall-tiles", "tiles/atlas_walls_low-16x16.png");
    this.load.image("scroll", "secret-adaptation.jpeg");
    this.load.tilemapTiledJSON("tilemap", "tiles/secrets3.json");
    this.load.spritesheet(
      "human",
      "sprites/girl-16x18.png",
      // 'sprites/secret-character.png',
      { frameWidth: 16, frameHeight: 18 }
    );

    // infinte runner
    // this.load.image(
    //   "infinite-background",
    //   "public/assets/infinite/bg_repeat_340x640.png"
    // );
    // source: https://legends-games.itch.io/pixel-penguin-32x32-asset-pack
    this.load.atlas(
      "penguin",
      "infinite/penguin-mapped.png",
      "infinite/penguin-map.json"
    );
    this.load.image("urchin", "infinite/urchin.png");

    // credit: alkakrab ("10 Ambient RPG Tracks")
    // this.load.audio('bg-main', "audio/distant-echoes.mp3");
    // credit: rpg maker
    this.load.audio("bg-main", "audio/lonely-departure.m4a");
    // credit: "Minifantasy_Dungeon_SFX"
    this.load.audio("sfx-transform", "audio/transform.wav");
    this.load.audio("sfx-walk", "audio/walk.wav");
  }

  create() {
    //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
    //  For example, you can define global animations here, so we can use them in other scenes.

    //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
    this.sound.play("bg-main", { loop: true, volume: 0.2 });
    this.scene.start("MainMenu");
    //   this.scene.transition({
    //     target: "InfiniteRunner",
    //     duration: 1000,
    //     // moveBelow: true,
    //     // onUpdate: (progress) => {
    //     //     this.cameras.main.setAlpha(1 - progress);
    //     // },
    // });
  }
}
