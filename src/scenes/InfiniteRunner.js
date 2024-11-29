import { Scene } from "phaser";

export class InfiniteRunner extends Scene {
  background;
  cursors;
  penguin;

  constructor() {
    super({
      key: "InfiniteRunner",
      physics: {
        arcade: {
          // gravity: { y: 200 },
          // debug: true,
        },
      },
    });
  }

  create() {
    const playerStartPosition = 100;
    const width = this.scale.width;
    const height = this.scale.height;

    this.add.rectangle(0, 0, width, height, 0x0000dd).setOrigin(0, 0);

    // add obstacles
    const urchin = this.add.image(100, 200, "urchin");
    this.physics.add.existing(urchin);

    // .group({
    //     classType: Bullet,
    //     maxSize: 10,
    //     runChildUpdate: true,
    // });

    // this.player = this.physics.add.sprite(
    //     playerStartPosition,
    //     game.config.height / 2,
    //     "player"
    // );
    // this.player.setGravityY(100);
    // const sprite = this.add.sprite(50, 300, "penguin");
    // sprite.animations.add(
    //     "dying",
    //     Phaser.Animation.generateFrameNames("dying", 1, 6),
    //     5,
    //     true
    // );
    this.anims.create({
      key: "swim",
      frames: this.anims.generateFrameNames("penguin", {
        prefix: "swim",
        start: 1,
        end: 2,
      }),
      repeat: -1,
      // repeatDelay: 100,
      // yoyo: true,
      frameRate: 8,
    });
    this.anims.create({
      key: "glide",
      frames: this.anims.generateFrameNames("penguin", {
        prefix: "swim",
        start: 2,
        end: 2,
      }),
    });
    this.anims.create({
      key: "hurt",
      frames: this.anims.generateFrameNames("penguin", {
        prefix: "hurt",
        frames: false,
        // start: 1,
        // end: 1,
      }),
    });

    this.penguin = this.physics.add
      .sprite(playerStartPosition, 300, "penuin")
      .play("swim")
      .setScale(2)
      .setBounce(0.2, 0.2)
      .setCollideWorldBounds(true)
      .setDrag(0, 50)
      .setGravity(0, -75);

    this.physics.add.overlap(this.penguin, urchin, (penguin, urchin) => {
      console.log("overlap !!");
      // FIXME@@@@
      this.penguin.play("hurt");
    });

    // this.background = this.add
    //     .tileSprite(0, 0, width, height, "infinite-background")
    //     .setOrigin(0)
    //     .setScrollFactor(0);

    this.cursors = this.input.keyboard.createCursorKeys();
  }

  update() {
    // this.background.setTilePosition(this.cameras.main.scrollX);

    const { up, down } = this.cursors;
    this.penguin.setAcceleration(0, 0);

    if (up.isDown) {
      this.penguin.setAccelerationY(-600);
      this.penguin.play("swim", true);
    } else if (down.isDown) {
      this.penguin.setAccelerationY(600);
      this.penguin.play("swim", true);
    } else {
      this.penguin.play("glide", true);
    }
  }
}
