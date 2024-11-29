import Phaser from "phaser";

const margin = 50;

export class TextAdventure extends Phaser.Scene {
  private background!: Phaser.GameObjects.Graphics;
  private storyText!: Phaser.GameObjects.Text;
  private inputText!: Phaser.GameObjects.Text;
  private historyText!: Phaser.GameObjects.Text;
  private playerInput: string = "";
  private currentScene: string = "";
  private history: string[] = [];
  private introSeen = false;

  private locations: {
    id: string;
    description: string;
    connections: { [key: string]: string };
    effects?: () => void;
  }[] = [
    {
      id: "1-entrance",
      description: `The area around you is vast. A cold draft tickles your fur from the north.
From the south, you smell the jungle.`,
      // ideas:
      // "You awaken in a cramped, dark space. Your whiskers brush against cold stone walls.",
      // "The air smells damp and earthy.",
      // "You hear faint squeaks in the distance.",
      //     "The cheese smells enticing, but there's a faint metallic scent as well.",
      //     "A predator might be nearby.",
      //   "The sound grows louder as you strain your ears.",
      //   "You sense vibrations in the ground from the north.",
      // actions: { north: 3 },
      connections: { north: "1-hallway" },
      effects: () => this.fadeBackground("#ffcc00", 2000),
    },
    {
      id: "1-hallway",
      description:
        "You sniff the air and detect the sharp tang of cheese to the east.",
      // actions: { crawl: 4, retreat: 0 },
      connections: { south: "1-entrance" },
      effects: () => this.flashScreen("#555555", 1000),
    },
    // {
    //   description: "You hear faint water dripping. It echoes in the tunnels.",
    //   actions: { explore: 5, retreat: 0 },
    //   effects: () => this.pulseBackground("#3366cc", 500),
    // },
    // {
    //   description:
    //     "Your whiskers brush again cold stone walls. The path is straight and soon a decision can be made.",
    //   actions: { west: 5, north: 0 },
    //   effects: () => this.pulseBackground("#3366cc", 500),
    // },
  ];

  constructor() {
    super({ key: "TextAdventure" });
  }

  preload() {}

  create() {
    this.background = this.add
      .graphics()
      .fillStyle(0x000000, 1)
      .fillRect(0, 0, 800, 600);

    this.storyText = this.add.text(margin, margin, "", {
      font: "20px Arial",
      color: "#ffffff",
      wordWrap: { width: 700 },
    });

    if (this.introSeen) {
      // jump straight to scene
      this.updateTextDisplays();
    } else {
      this.showIntroText();
    }

    // Display input prompt
    const prompt = this.add.text(
      margin,
      500,
      "Type your action (e.g., sniff, listen, north) and press Enter:",
      {
        font: "18px Arial",
        color: "#ffffff",
      }
    );

    // Display input text
    this.inputText = this.add.text(margin, 550, "", {
      font: "18px Arial",
      color: "#00ff00",
    });

    // Display history
    this.historyText = this.add.text(margin, 250, "", {
      font: "16px Arial",
      color: "#aaaaaa",
      wordWrap: { width: 700 },
      lineSpacing: 4,
    });

    this.input.keyboard!.on("keydown", (event: KeyboardEvent) =>
      this.handleKeyInput(event)
    );
  }

  private showIntroText() {
    this.storyText.setText(
      `As you transform into a rat, your sight weakens but your smell and hearing are enhanced.

Press Enter to continue.`
    );
    // this.pauseForInput();
  }

  private startCursor() {
    const cursor = this.add.text(
      prompt.getBottomLeft().x,
      prompt.getBottomCenter().y,
      "|",
      {
        font: "18px Arial",
        color: "#ffffff",
      }
    );
    this.time.addEvent({
      delay: 500,
      loop: true,
      callback: () => {
        cursor.visible = !cursor.visible;
      },
    });
  }

  private getLocation(id: string) {
    const current = this.locations.find((l) => l.id === id);
    if (!current) throw new Error("no scene found for " + id);
    return current;
  }

  private handleKeyInput(event: KeyboardEvent) {
    if (this.introSeen === false && event.key === "Enter") {
      this.introSeen = true;
      this.currentScene = "1-entrance";
      return;
    }

    if (event.key === "Enter") {
      this.processInput(this.playerInput.toLowerCase().trim());
      this.playerInput = "";
    } else if (event.key === "Backspace") {
      this.playerInput = this.playerInput.slice(0, -1);
    } else if (event.key.length === 1) {
      this.playerInput += event.key;
    }

    // Update input text
    this.inputText.setText(this.playerInput);
  }

  private processInput(input: string) {
    const currentSceneData = this.getLocation(this.currentScene);

    if (input in currentSceneData.connections) {
      const nextSceneId = currentSceneData.connections[input];

      // Log the player's action and the scene's response
      this.history.push(`> ${input}`);
      const nextLocation = this.getLocation(nextSceneId);
      this.history.push(nextLocation.description);

      // Update the current scene
      this.currentScene = nextSceneId;

      // Play scene effects
      if (nextLocation.effects) {
        console.log("effecting!", nextLocation.effects);
        nextLocation.effects.call(this);
      }

      // Update all text displays
      this.updateTextDisplays();
    } else {
      this.history.push(`> ${input}`);
      this.history.push(
        "You hesitate, unsure of what to do. Try something else."
      );
      this.updateTextDisplays();
    }
  }

  private updateTextDisplays() {
    // Update the main story text
    this.storyText.setText(this.getCurrentSceneText());

    // Update the history text
    this.historyText.setText(this.history.join("\n"));
  }

  private getCurrentSceneText(): string {
    const scene = this.getLocation(this.currentScene);
    return `${scene.description}\n\n`;
  }

  // Visual Effects (for reference)
  private flashScreen(color: string, duration: number) {
    const flash = this.add.rectangle(
      0,
      0,
      800,
      600,
      Phaser.Display.Color.HexStringToColor(color).color
    );
    this.tweens.add({
      targets: flash,
      alpha: { from: 0, to: 0.5 },
      duration: duration,
      onComplete: () => flash.destroy(),
    });
  }

  private fadeBackground(color: string, duration: number) {
    this.tweens.add({
      targets: this.background,
      fillStyle: {
        from: 0x000000,
        to: Phaser.Display.Color.HexStringToColor(color).color,
      },
      duration: duration,
    });
  }

  private pulseBackground(color: string, duration: number) {
    this.tweens.add({
      targets: this.background,
      fillStyle: {
        from: Phaser.Display.Color.HexStringToColor(color).color,
        to: 0x000000,
      },
      duration: duration,
      yoyo: true,
      repeat: 3,
    });
  }
}
