import { Scene, GameObjects } from "phaser";

export class MainMenu extends Scene {
  background: GameObjects.Image;
  logo: GameObjects.Image;
  title: GameObjects.Text;

  constructor() {
    super("MainMenu");
  }

  create() {
    this.background = this.add.image(512, 384, "background");
    this.logo = this.add.image(512, 300, "title-screen");
    this.title = this.add
      .text(350, 115, "Cloak and Danger", {
        fontFamily: "monospace",
        fontSize: 50,
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 8,
        align: "center",
      })
      .setOrigin(0.5);
    this.input.once("pointerdown", () => {
      this.scene.start("TextAdventure");
    });
  }
}
