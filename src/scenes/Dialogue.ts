import { Scene, GameObjects } from "phaser";

export class Dialogue extends Scene {
  background: GameObjects.Image;
  logo: GameObjects.Image;
  title: GameObjects.Text;

  constructor() {
    super("Dialogue");
  }

  create({ text, className }: { text: string[]; className: string }): void {
    const dialogueBox = this.add
      .graphics()
      .fillStyle(0x000000, 0.7)
      .fillRect(0, 0, this.scale.width, this.scale.height);
    dialogueBox.depth = 2;

    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2 - 100;
    let divX = centerY;
    let divY = centerY;

    if (className === "scroll") {
      console.log("shoing scroll");
      // show scroll picture with poem written on top of it
      const scrollImage = this.add
        .image(centerX, this.scale.height / 2, "scroll")
        .setScale(0.8);
      scrollImage.depth = 3;

      divX = 450;
      divY = 250;
    }

    const div = this.add.dom(divX, divY, "div").setOrigin(0.5, 0.5);
    div
      .setHTML(text.map((line) => `<p>${line}</p>`).join(""))
      .setClassName(["dialogue", className].join(" "));

    this.input.keyboard!.once("keydown", () => {
      this.scene.stop();
    });
  }
}
