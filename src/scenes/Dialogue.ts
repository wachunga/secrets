import { Scene, GameObjects } from "phaser";

export class Dialogue extends Scene {
  background: GameObjects.Image;
  logo: GameObjects.Image;
  title: GameObjects.Text;

  constructor() {
    super("Dialogue");
  }

  create({ text, className }: { text: string[]; className: string }): void {
    const overlay = this.add
      .graphics()
      .fillStyle(0x000000, 0.7)
      .fillRect(0, 0, this.scale.width, this.scale.height);
    overlay.depth = 2;

    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2 - 100;
    let divX = centerX;
    let divY = centerY;

    if (className === "scroll") {
      const scrollImage = this.add
        .image(centerX, this.scale.height / 2, "scroll")
        .setScale(0.8);
      scrollImage.depth = 3;

      divX = 440;
      divY = 240;
    }
    if (className === "painting") {
      const paintingImage = this.add
        .image(centerX, centerY, "painting")
        .setScale(0.8);
      paintingImage.depth = 3;
    }
    if (className === "mirror") {
      const paintingImage = this.add
        .image(centerX, centerY, "mirror")
        .setScale(0.8);
      paintingImage.depth = 3;
    }

    const div = this.add.dom(divX, divY, "div").setOrigin(0.5, 0.5);
    div
      .setHTML(text.map((line) => `<p>${line}</p>`).join(""))
      .setClassName(["dialogue", className].join(" "));
  }

  update() {
    if (
      Phaser.Input.Keyboard.JustDown(this.input.keyboard!.addKey("SPACE")) ||
      Phaser.Input.Keyboard.JustDown(this.input.keyboard!.addKey("ENTER")) ||
      Phaser.Input.Keyboard.JustDown(this.input.keyboard!.addKey("ESC"))
    ) {
      this.scene.stop();
    }
  }
}
