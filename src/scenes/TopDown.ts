import { Scene } from "phaser";
import { locations, type LocationKey } from "../text/data";

let isMoving = false;

const TILE_SIZE = 16;

type MoveDirection = 'up' | 'down' | 'left' | 'right'

export class TopDown extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  background: Phaser.GameObjects.Image;
  msg_text: Phaser.GameObjects.Text;
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  rt: Phaser.GameObjects.RenderTexture;
  eventsLayer: Phaser.Tilemaps.ObjectLayer;
  collisionLayer: Phaser.Tilemaps.TilemapLayer;
  objectLayer: Phaser.Tilemaps.TilemapLayer;

  constructor() {
    super("TopDown");
  }

  create(data: any): void {
    this.camera = this.cameras.main;
    this.camera.setBackgroundColor(0x222222); // match tileset darkness
    this.camera.setZoom(2);

    const x = data.coordinates?.x || 240;
    const y = data.coordinates?.y || 288;

    this.anims.create({
      key: 'up-idle',
      frames: this.anims.generateFrameNumbers('human', { frames: [1] }),
    });
    this.anims.create({
      key: 'right-idle',
      frames: this.anims.generateFrameNumbers('human', { frames: [4] }),
    });
    this.anims.create({
      key: 'down-idle',
      frames: this.anims.generateFrameNumbers('human', { frames: [7] }),
    });
    this.anims.create({
      key: 'left-idle',
      frames: this.anims.generateFrameNumbers('human', { frames: [10] }),
    });

    const frameRate = {
      frameRate: 8,
      // repeat: -1,
      repeatDelay: 0
    }
    this.anims.create({
      key: 'up',
      frames: this.anims.generateFrameNumbers('human', { start: 0, end: 2 }),
      ...frameRate,
    });
    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('human', { start: 3, end: 5 }),
      ...frameRate
    });
    this.anims.create({
      key: 'down',
      frames: this.anims.generateFrameNumbers('human', { start: 6, end: 8 }),
      ...frameRate
    });
    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('human', { start: 9, end: 11 }),
      ...frameRate
    });
    this.player = this.physics.add.sprite(x + TILE_SIZE / 2, y + TILE_SIZE / 2, 'human');
    this.player.setOrigin(0.5, 0.6);
    this.player.setCollideWorldBounds(true);

    this.camera.startFollow(this.player, true);
    this.player.depth = 1; // appear on top of the tileset

    // tilesets

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
    this.objectLayer = map
      .createLayer("objects", tilesetImage)
      ?.setCollisionByProperty({ collide: true })!;
    map.createLayer("rubble", tilesetImage);
    this.eventsLayer = map.getObjectLayer("events")!;

    const tilesetImage2 = map.addTilesetImage("walls", "wall-tiles")!;
    this.collisionLayer = map.createLayer("walls", tilesetImage2)!;
    this.collisionLayer.setCollisionByProperty({ collide: true });

    // const debugGraphics = this.add.graphics().setAlpha(0.3);
    // this.collisionLayer.renderDebug(debugGraphics, {
    //   tileColor: null,
    //   collidingTileColor: new Phaser.Display.Color(243, 234, 48, 255),
    //   faceColor: new Phaser.Display.Color(40, 39, 37, 255),
    // });


    // TODO? const score = this.registry.get('highscore');
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
      this.attemptMove(-1, 0, 'left');
    } else if (right.isDown) {
      this.attemptMove(1, 0, 'right');
    } else if (up.isDown) {
      this.attemptMove(0, -1, 'up');
    } else if (down.isDown) {
      this.attemptMove(0, 1, 'down');
    }

    // TODO: Check if space bar is pressed while facing a specific tile
    // if (Phaser.Input.Keyboard.JustDown(space)) {
    //   this.checkSpaceEvent();
    // }
    if (Phaser.Input.Keyboard.JustDown(this.input.keyboard!.addKey("T"))) {
      const destination = this.findTransformDestination();
      if (destination) {
        this.sound.play("sfx-transform", { seek: 0.3 });
        this.scene.start("TextAdventure", { destination });
      } else {
        // TODO: show message that you can't transform here
      }
    }
  }

  findTransformDestination() {
    const x = Math.floor(this.player.x / 16);
    const y = Math.floor(this.player.y / 16);
    const destination = locations.find((location) => {
      return (
        location.originTiles?.x.includes(x) &&
        location.originTiles.y.includes(y)
      );
    });
    console.log("found", x, y, destination?.id);
    return destination?.id;
  }

  attemptMove(dx: number, dy: number, direction: MoveDirection): void {
    const targetX = this.player.x + dx * TILE_SIZE;
    const targetY = this.player.y + dy * TILE_SIZE;

    const targetTile = this.collisionLayer.getTileAtWorldXY(targetX, targetY);
    const targetTile2 = this.objectLayer.getTileAtWorldXY(targetX, targetY);

    if (targetTile?.properties.collide || targetTile2?.properties.collide) {
      this.player.play(`${direction}-idle`);
      return; // Block movement if the tile collides
    }

    this.movePlayer(targetX, targetY, direction);
  }

  movePlayer(targetX: number, targetY: number, direction: MoveDirection): void {
    isMoving = true;
    // this.sound.play("sfx-walk", { volume: 0.2 });
    this.player.play(direction, true).once('animationcomplete', () => {
      this.player.play(`${direction}-idle`);
    })

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
        const hasTrigger = object.properties?.find(
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
