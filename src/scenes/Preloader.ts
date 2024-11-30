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
    //  Load the assets for the game - Replace with your own assets
    this.load.setPath("assets");

    // this.load.image("logo", "logo.png");
    this.load.image("title-screen", "title-screen.jpeg");
    this.load.image("mask", "mask1.png");

    // human form
    this.load.image("floor-tiles", "tiles/atlas_floor-16x16.png");
    this.load.image("wall-tiles", "tiles/atlas_walls_low-16x16.png");
    this.load.tilemapTiledJSON("tilemap", "tiles/secrets2.json");

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

    this.load.audio('bg-main', "audio/distant-echoes.mp3");

  }

  create() {
    //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
    //  For example, you can define global animations here, so we can use them in other scenes.

    //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
    this.sound.play("bg-main", { loop: true, volume: 0.2 });
    this.scene.start("TextAdventure");
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
