import { Scene } from "phaser";
import { locations } from "../text/data";
import { dialogues } from "../text/dialogue";
import { strong } from "../text/colors";

let isMoving = false;
let displayQueuePaused = false;

const TILE_SIZE = 16;

type MoveDirection = "up" | "down" | "left" | "right";

const switches = {
  introText: false,
  secret1Found: false,
  chestOpened: false,
  paintingSeen: false,
  melodyHeard: false,
  rubbleCleared: false,
  endingTriggered: false,
};

const displayQueue: Function[] = [];

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
    this.camera.setZoom(3);

    // 240, 288
    const x = data.coordinates?.x || Math.floor(15 * 16);
    const y = data.coordinates?.y || Math.floor(18 * 16);

    this.anims.create({
      key: "up-idle",
      frames: this.anims.generateFrameNumbers("human", { frames: [1] }),
    });
    this.anims.create({
      key: "right-idle",
      frames: this.anims.generateFrameNumbers("human", { frames: [4] }),
    });
    this.anims.create({
      key: "down-idle",
      frames: this.anims.generateFrameNumbers("human", { frames: [7] }),
    });
    this.anims.create({
      key: "left-idle",
      frames: this.anims.generateFrameNumbers("human", { frames: [10] }),
    });

    const frameRate = {
      frameRate: 8,
      repeatDelay: 0,
      // repeat: -1,
    };
    this.anims.create({
      key: "up",
      frames: this.anims.generateFrameNumbers("human", { start: 0, end: 2 }),
      ...frameRate,
    });
    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("human", { start: 3, end: 5 }),
      ...frameRate,
    });
    this.anims.create({
      key: "down",
      frames: this.anims.generateFrameNumbers("human", { start: 6, end: 8 }),
      ...frameRate,
    });
    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("human", { start: 9, end: 11 }),
      ...frameRate,
    });
    this.player = this.physics.add.sprite(
      x + TILE_SIZE / 2,
      y + TILE_SIZE / 2,
      "human"
    );
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
    if (!displayQueuePaused && displayQueue.length) {
      const next = displayQueue.shift()!;
      next();
    }

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

    if (!switches.introText) {
      this.showDialogueBox(dialogues.intro);
      switches.introText = true;
    }

    if (isMoving) return; // Prevent new input while moving

    if (left.isDown) {
      this.attemptMove(-1, 0, "left");
    } else if (right.isDown) {
      this.attemptMove(1, 0, "right");
    } else if (up.isDown) {
      this.attemptMove(0, -1, "up");
    } else if (down.isDown) {
      this.attemptMove(0, 1, "down");
    }

    if (Phaser.Input.Keyboard.JustDown(space)) {
      this.checkSpaceEvent();
    }
    if (Phaser.Input.Keyboard.JustDown(this.input.keyboard!.addKey("T"))) {
      const destination = this.findTransformDestination();
      if (destination) {
        this.sound.play("sfx-transform", { seek: 0.3 });
        this.scene.start("TextAdventure", { destination });
      } else {
        // TODO: show message that you can't transform here
      }
    }

    // if all secrets have been found, update tileset to remove rubble
    // console.log("switches", JSON.stringify(switches, null, 2));
    if (
      switches.secret1Found &&
      switches.chestOpened &&
      switches.paintingSeen &&
      switches.melodyHeard &&
      !switches.rubbleCleared
    ) {
      this.objectLayer.forEachTile((tile) => {
        if (tile.properties.collide && tile.properties.rubble) {
          this.time.delayedCall(1000, () => {
            displayQueue.push(() => {
              this.showDialogueBox(["You feel a might rumble..."]);
            });
            displayQueue.push(() => {
              this.cameras.main.shake(500, 0.01);
              tile.setCollision(false);
              tile.setVisible(false);
            });
          });
          switches.rubbleCleared = true;
        }
      });
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
    return destination?.id;
  }

  attemptMove(dx: number, dy: number, direction: MoveDirection): void {
    const targetX = this.player.x + dx * TILE_SIZE;
    const targetY = this.player.y + dy * TILE_SIZE;

    const targetTile = this.collisionLayer.getTileAtWorldXY(targetX, targetY);
    const targetTile2 = this.objectLayer.getTileAtWorldXY(targetX, targetY);

    if (targetTile?.canCollide || targetTile2?.canCollide) {
      this.player.play(`${direction}-idle`);
      return; // Block movement if the tile collides
    }

    this.movePlayer(targetX, targetY, direction);
  }

  movePlayer(targetX: number, targetY: number, direction: MoveDirection): void {
    isMoving = true;
    // this.sound.play("sfx-walk", { volume: 0.2 });
    this.player.play(direction, true).once("animationcomplete", () => {
      this.player.play(`${direction}-idle`);
    });

    this.tweens.add({
      targets: this.player,
      x: targetX,
      y: targetY,
      duration: 150, // Adjust for speed
      onComplete: () => {
        isMoving = false; // Allow movement again

        // FIXME: this is happening twice for some reason
        this.checkTileEvent();
      },
    });
  }

  checkSpaceEvent(): void {
    const tileX = Math.floor(this.player.x / 16);
    const tileY = Math.floor(this.player.y / 16);

    const openChest = () => {
      if (switches.chestOpened) {
        displayQueue.push(() => this.showDialogueBox(["The chest is empty."]));
      } else {
        displayQueue.push(() => this.showDialogueBox(dialogues.chestScroll));
        displayQueue.push(() =>
          this.showDialogueBox(dialogues.chestPoem, "scroll")
        );
        displayQueue.push(() => this.showDialogueBox(dialogues.chestScroll2));
      }
      switches.chestOpened = true;
    };

    const playerDirection = this.player.anims.currentAnim?.key;
    if (tileX === 3 && tileY === 17 && playerDirection?.startsWith("right")) {
      openChest();
    }
    if (tileX === 4 && tileY === 16 && playerDirection?.startsWith("down")) {
      openChest();
    }

    if (tileX === 16 && tileY === 14 && playerDirection?.startsWith("right")) {
      displayQueue.push(() =>
        this.showDialogueBox([
          `There's rubble in the way.<br><br>You're not strong enough to clear a path.`,
        ])
      );
    }

    if (tileX === 18 && tileY === 14 && playerDirection?.startsWith("right")) {
      displayQueue.push(() => {
        this.showDialogueBox([`There's no way but down. You jump!`]);

        // teleport the player to the bottom floor
        this.player.setPosition(31 * 16 + 8, 3 * 16 + 8);
        this.camera.flash(500);
      });
    }

    if (tileX === 12 && tileY === 5 && playerDirection?.startsWith("up")) {
      displayQueue.push(() =>
        this.showDialogueBox([
          `Yikes! There's no way to get over or through<br>these spikes in your current form.`,
        ])
      );
    }
  }

  checkTileEvent(): void {
    const tileX = Math.floor(this.player.x / 16);
    const tileY = Math.floor(this.player.y / 16);

    // console.log(tileX, tileY);
    if (tileX === 15 && tileY === 13) {
      if (!switches.secret1Found) {
        displayQueue.push(() => this.showDialogueBox(dialogues.secret1));
        displayQueue.push(() => this.showDialogueBox(dialogues.secret1b));
        displayQueue.push(() => this.showDialogueBox(dialogues.secret1c));
      }
      switches.secret1Found = true;
    } else if (tileX === 11 && tileY === 1) {
      if (!switches.paintingSeen) {
        displayQueue.push(() => this.showDialogueBox(dialogues.spikePainting));
        displayQueue.push(() => this.showDialogueBox([""], "painting"));
        displayQueue.push(() => this.showDialogueBox(dialogues.spikePainting2));
      }
      switches.paintingSeen = true;
    }

    if (tileX === 18 && tileY === 2) {
      if (!switches.melodyHeard) {
        displayQueue.push(() => this.showDialogueBox(dialogues.rubbleMelody));
        displayQueue.push(() => this.showDialogueBox(dialogues.rubbleMelody2));
      }
      switches.melodyHeard = true;
    }

    if ((tileX === 32 && tileY === 3) || (tileX === 30 && tileY === 3)) {
      if (!switches.endingTriggered) {
        displayQueue.push(() =>
          this.showDialogueBox(["You see a mirror on the wall."])
        );
        displayQueue.push(() => this.showDialogueBox([""], "mirror"));
        displayQueue.push(() => {
          this.showDialogueBox([
            `The mirror is reflecting your true self, revealing the magic of transformation.`,
            `It was worth all the time you spent searching, for you have discovered the ${strong(
              "Secret of Magic"
            )}!`,
          ]);

          // restart the game from the main menu
          this.cameras.main.fadeOut(3000, 0, 0, 0);
          this.time.delayedCall(3000, () => {
            this.scene.start("MainMenu");
          });
        });
      }
      switches.endingTriggered = true;
    }
  }

  showDialogueBox(text: string[], className?: string): void {
    displayQueuePaused = true;

    // launch scene in parallel to this one
    this.scene.pause();
    this.scene.launch("Dialogue", { text, className });
    this.scene.get("Dialogue").events.once("shutdown", () => {
      // console.log("shutdown");
      this.scene.resume();
      displayQueuePaused = false;
    });
  }
}
