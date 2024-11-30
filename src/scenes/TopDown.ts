import { Scene } from "phaser";

let isMoving = false;

const TILE_SIZE = 16;

export const DIRECTION = Object.freeze({
  LEFT: "LEFT",
  RIGHT: "RIGHT",
  UP: "UP",
  DOWN: "DOWN",
  NONE: "NONE",
});

export class TopDown extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  background: Phaser.GameObjects.Image;
  msg_text: Phaser.GameObjects.Text;
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  player: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
  rt: Phaser.GameObjects.RenderTexture;
  eventsLayer: Phaser.Tilemaps.ObjectLayer;
  collisionLayer: Phaser.Tilemaps.TilemapLayer;

  constructor() {
    super("TopDown");
  }

  create(data: any): void {
    this.camera = this.cameras.main;
    this.camera.setBackgroundColor(0x000000);
    this.camera.setZoom(2);

    // this.player = this.add.rectangle(16 * 15, 16 * 15, 16, 16, 0xff0000);
    const x = data.coordinates?.x || 240;
    const y = data.coordinates?.y || 288;
    this.player = this.physics.add.image(
      x + TILE_SIZE / 2,
      y + TILE_SIZE / 2,
      "non-existing-image-for-testing"
    );
    this.player.setDisplaySize(12, 12);
    this.player.setTintFill(0xff0000);
    this.player.setCollideWorldBounds(true);

    const map = this.make.tilemap({ key: "tilemap" });
    const tilesetImage = map.addTilesetImage(
      "floor",
      "floor-tiles",
      16,
      16
      // 1,
      // 2
    )!;
    map.createLayer("floor", tilesetImage);
    map.createLayer("objects", tilesetImage);
    this.eventsLayer = map.getObjectLayer("events")!;

    this.camera.startFollow(this.player, true);
    // this.camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    const tilesetImage2 = map.addTilesetImage("walls", "wall-tiles")!;
    this.collisionLayer = map.createLayer("walls", tilesetImage2)!;
    this.collisionLayer.setCollisionByProperty({ collide: true });

    // const debugGraphics = this.add.graphics().setAlpha(0.3);
    // this.collisionLayer.renderDebug(debugGraphics, {
    //   tileColor: null,
    //   collidingTileColor: new Phaser.Display.Color(243, 234, 48, 255),
    //   faceColor: new Phaser.Display.Color(40, 39, 37, 255),
    // });

    this.player.depth = 1; // appear on top of the tileset

    // const score = this.registry.get('highscore');
    // const textStyle = { fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff', stroke: '#000000', strokeThickness: 8 };

    this.cursors = this.input.keyboard!.createCursorKeys();

    // fog around player
    this.rt = this.add.renderTexture(0, 0, this.scale.width, this.scale.height);
    //  Make sure it doesn't scroll with the camera
    this.rt.setOrigin(0, 0);
    this.rt.setScrollFactor(0, 0);
  }

  update(time: number, delta: number): void {
    const { left, right, up, down, space } = this.cursors;

    // draw spotlight on player
    this.rt.clear();
    this.rt.fill(0x000000);
    //  Erase the 'mask' texture from it based on the player position
    //  We - 107, because the mask image is 213px wide, so this puts it on the middle of the player
    //  We then minus the scrollX/Y values, because the RenderTexture is pinned to the screen and doesn't scroll
    this.rt.erase(
      "mask",
      this.player.x - 107 - this.cameras.main.scrollX,
      this.player.y - 107 - this.cameras.main.scrollY
    );

    if (isMoving) return; // Prevent new input while moving

    if (left.isDown) {
      this.attemptMove(-1, 0);
    } else if (right.isDown) {
      this.attemptMove(1, 0);
    } else if (up.isDown) {
      this.attemptMove(0, -1);
    } else if (down.isDown) {
      this.attemptMove(0, 1);
    }

    // TODO: Check if space bar is pressed while facing a specific tile
    // if (Phaser.Input.Keyboard.JustDown(space)) {
    //   this.checkSpaceEvent();
    // }
    if (Phaser.Input.Keyboard.JustDown(this.input.keyboard!.addKey('SPACE'))) {
      this.sound.play("sfx-transform", { seek: 0.3 });
      this.scene.start("TextAdventure");
    }
  }

  attemptMove(dx: number, dy: number): void {
    const targetX = this.player.x + dx * TILE_SIZE;
    const targetY = this.player.y + dy * TILE_SIZE;

    // Calculate the target tile
    const targetTile = this.collisionLayer.getTileAtWorldXY(targetX, targetY);

    // Check for collision
    if (targetTile && targetTile.properties.collide) {
      return; // Block movement if the tile collides
    }

    // Move player if no collision
    this.movePlayer(targetX, targetY);
  }

  movePlayer(targetX: number, targetY: number): void {
    isMoving = true;
    this.sound.play('sfx-walk', { volume: 0.2 });

    this.tweens.add({
      targets: this.player,
      x: targetX,
      y: targetY,
      duration: 150, // Adjust for speed
      onComplete: () => {
        isMoving = false; // Allow movement again
        // FIXME: this is happening twice for some reason
        this.checkTileEvent(targetX, targetY);
      },
    });
  }

  checkTileEvent(targetX: number, targetY: number): void {
    // const tile = this.eventsLayer.
    // // getTileAtWorldXY(targetX, targetY);
    // if (tile && tile.properties.trigger) {
    //   console.log("Triggered event at tile:", tile);
    //   // Trigger custom event here
    //   this.triggerTileEvent(tile);
    // }

    // Iterate over the objects in the object layer
    this.eventsLayer.objects.forEach(
      (object: Phaser.Types.Tilemaps.TiledObject) => {
        const objectBounds = new Phaser.Geom.Rectangle(
          object.x,
          object.y,
          object.width || TILE_SIZE,
          object.height || TILE_SIZE
        );
        const hasTrigger = object.properties.find(
          (p: any) => p.name === "trigger"
        );
        if (!hasTrigger) return;
        // if (shouldTrigger) {
        //   console.log(
        //     "Checking object",
        //     object.name,
        //     this.player.x,
        //     this.player.y,
        //     objectBounds
        //   );
        // }

        // Check if the player is within the bounds of the object
        console.log(targetX, targetY, object.x, object.y);
        if (objectBounds.contains(targetX, targetY)) {
          console.log("Triggered event at object:", object);
          this.triggerObjectEvent(object);
        }
      }
    );
  }

  // Example of triggering event when walking on a specific object
  triggerObjectEvent(object: Phaser.Types.Tilemaps.TiledObject): void {
    console.log("You triggered an event at the object!", object);
    // Add event logic here
  }

  triggerTileEvent(tile: Phaser.Tilemaps.Tile): void {
    console.log("You walked on a special tile!", tile);
    // Add event logic here
  }
}
