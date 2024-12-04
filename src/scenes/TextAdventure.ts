import Phaser from "phaser";
import { locations, type LocationKey } from "../text/data";
import { colored, highlight, strong, weak } from "../text/colors";

const margin = 100;
const monospace = "20px monospace";

export class TextAdventure extends Phaser.Scene {
  private background!: Phaser.GameObjects.Graphics;
  private storyText!: Phaser.GameObjects.DOMElement;
  private historyText!: Phaser.GameObjects.DOMElement;
  private prompt!: Phaser.GameObjects.Text;
  private inputTextArrow!: Phaser.GameObjects.Text;
  private inputText!: Phaser.GameObjects.Text;
  private cursor!: Phaser.GameObjects.Text;

  private playerInput: string = "";
  private currentScene: LocationKey = "start";
  private history: string[] = [];
  private commandHistory: string[] = [];
  private commandHistoryIndex: number = 0;
  private introSeen = false;
  private pressEnterKey = false;

  constructor() {
    super({ key: "TextAdventure" });
  }

  preload() {}

  update() {
    if (this.pressEnterKey) {
      this.cursor.setVisible(false);
      return;
    }

    this.cursor?.setX(this.inputText.getBottomRight().x - 4);
  }

  create(data: { destination: LocationKey }) {
    this.background = this.add
      .graphics()
      .fillStyle(0x000000, 1)
      .fillRect(0, 0, this.scale.width, this.scale.height)
      .lineStyle(4, 0xffffff, 1) // add a stroke around the rectangle
      .strokeRect(0, 0, this.scale.width, this.scale.height);

    this.storyText = this.add.dom(margin, margin, "div").setOrigin(0, 0);

    this.prompt = this.add
      .text(
        margin,
        this.scale.height - margin - 50,
        "— Press Enter to continue —",
        {
          font: monospace,
          color: "#ffffff",
        }
      )
      .setVisible(false);

    this.inputTextArrow = this.add
      .text(
        this.prompt.getBottomLeft().x,
        this.prompt.getBottomRight().y,
        ">",
        {
          font: monospace,
          color: "#ffffff",
        }
      )
      .setVisible(false);
    this.inputText = this.add.text(
      this.inputTextArrow.getTopRight().x + 6,
      this.inputTextArrow.getTopRight().y,
      "",
      {
        font: monospace,
        color: "#ffffff",
      }
    );

    this.history = [];
    this.commandHistory = [];
    this.commandHistoryIndex = 0;
    this.historyText = this.add
      .dom(margin, 300, "div")
      .setOrigin(0, 0)
      .setClassName("history-text");

    this.cursor = this.add
      .text(
        this.inputTextArrow.getTopRight().x + 2,
        this.inputTextArrow.getTopRight().y - 2,
        "|",
        {
          font: monospace,
          color: "#ffffff",
        }
      )
      .setVisible(false);

    if (!this.introSeen) {
      this.pressEnterKey = true;
      this.updateTextDisplays();
      this.updateStoryText(
        `<p>As you transform into a ${highlight("rat")}, your sight ${weak(
          "weakens"
        )} but your smell and hearing are ${strong("enhanced")}.</p>`
      );
      this.introSeen = true;
    } else {
      this.currentScene = data.destination || "1-entrace";
      this.updateTextDisplays();
    }

    this.startCursor();

    this.input.keyboard!.on("keydown", (event: KeyboardEvent) => {
      if (this.pressEnterKey) {
        if (event.key === "Enter") {
          this.pressEnterKey = false;
          let nextLocation = this.getLocation(this.currentScene).pressEnterKey;
          if (!nextLocation || nextLocation === "auto") {
            nextLocation = data.destination || "1-entrance";
          }
          this.currentScene = nextLocation;
          this.updateTextDisplays();
        }
      } else {
        this.handleKeyInput(event);
      }
    });
  }

  private updateStoryText(text: string) {
    let html = text;
    if (this.currentScene !== "start") {
      const connections = this.getLocation(this.currentScene).connections || {};
      const directions = Object.keys(connections)
        .map((dir) => colored(dir.toUpperCase(), "primary"))
        .join(", ");
      if (directions.length) {
        html += `<br><br>You can go: ${directions}`;
      }
    }

    this.storyText.createFromHTML(html).setClassName("story-text");
  }

  private startCursor() {
    this.time.addEvent({
      delay: 500,
      loop: true,
      callback: () => {
        this.cursor.visible = !this.cursor.visible;
      },
    });
  }

  private getLocation(id: string) {
    const current = locations.find((l) => l.id === id);
    if (!current) throw new Error("no scene found for " + id);
    return current;
  }

  private normalizeInput(input: string) {
    const split = input.toUpperCase().trim().split(" ");
    const command = split[0];
    const subject = split.slice(1).join(" ");
    switch (command) {
      case "":
      case "H":
      case "?":
      case "HELP":
        return "HELP";
      case "L":
      case "LOOK":
      case "EXAMINE":
        if (subject) return `LOOK ${subject}`;
        return "LOOK";
      case "TRANSFORM":
      case "HUMAN":
      case "REVERT":
      case "EXIT":
      case "T":
        return "TRANSFORM";
      case "N":
      case "NORTH":
        return "NORTH";
      case "S":
      case "SOUTH":
        return "SOUTH";
      case "E":
      case "EAST":
        return "EAST";
      case "W":
      case "WEST":
        return "WEST";
    }

    return command;
  }

  private handleKeyInput(event: KeyboardEvent) {
    if (event.key === "Enter") {
      this.handleInputEnter(this.playerInput);
      this.playerInput = "";
      this.commandHistoryIndex = 0;
    } else if (event.key === "Backspace") {
      this.playerInput = this.playerInput.slice(0, -1);
    } else if (event.key.length === 1) {
      this.playerInput += event.key.toUpperCase();
    } else if (event.key === "Escape") {
      this.playerInput = "";
      this.commandHistoryIndex = 0;
    } else if (event.key === "ArrowUp") {
      const prevCommand =
        this.commandHistory[
          this.commandHistory.length + (this.commandHistoryIndex - 1)
        ];
      if (prevCommand) {
        this.playerInput = prevCommand;
        this.commandHistoryIndex -= 1;
      }
    } else if (event.key === "ArrowDown") {
      const nextCommand =
        this.commandHistory[
          this.commandHistory.length + (this.commandHistoryIndex + 1)
        ];
      if (nextCommand) {
        this.playerInput = nextCommand;
        this.commandHistoryIndex += 1;
      } else if (this.commandHistoryIndex === -1) {
        this.playerInput = "";
        this.commandHistoryIndex = 0;
      }
    }

    this.inputText.setText(this.playerInput.toUpperCase());
  }

  private handleInputEnter(originalInput: string) {
    if (originalInput.trim()) {
      this.commandHistory.push(originalInput);
    }

    const input = this.normalizeInput(originalInput);
    if (input === "HELP") {
      this.updateHistory(
        "HELP",
        "Type a command to interact with the world.\nFor example, 'NORTH', 'LOOK', or 'TRANSFORM'."
      );
      return;
    }

    const currentSceneData = this.getLocation(this.currentScene);
    const connections = {
      ...currentSceneData.connections,
      ...currentSceneData.hiddenConnections,
    };
    const commands = currentSceneData.commands || {};
    const commandKey = input.toLowerCase();
    if (commandKey in connections) {
      const nextSceneId = connections[commandKey];
      this.currentScene = nextSceneId;
      this.history = [];
      this.updateTextDisplays();
    } else if (commandKey in commands) {
      this.updateHistory(originalInput, commands[commandKey]);
    } else if (commandKey === "transform") {
      const location = this.getLocation(this.currentScene);
      if (location.destinationTile) {
        this.sound.play("sfx-transform", { seek: 0.3 });
        const coordinates = {
          x: location.destinationTile.x * 16,
          y: location.destinationTile.y * 16,
        };
        // console.log("loc", location.destinationTile, coordinates);
        this.scene.start("TopDown", { coordinates });
      } else {
        this.updateHistory(
          originalInput,
          "This doesn't seem like a good time to be human."
        );
      }
    } else if (commandKey === "look") {
      this.updateHistory(originalInput, "You don't see anything remarkable.");
    } else {
      this.updateHistory(
        originalInput,
        "You hesitate, unsure of what to do. Try something else."
      );
    }
  }

  // Log the player's action and the scene's response
  private updateHistory(command: string, response: string) {
    this.history.push("> " + command);
    this.history.push(response);
    if (this.history.length > 6) {
      this.history.shift();
      this.history.shift();
    }
    this.updateTextDisplays();
  }

  private updateTextDisplays() {
    const location = this.getLocation(this.currentScene);
    this.updateStoryText(`${location.description}\n\n`);
    this.historyText
      .createFromHTML(this.history.join("<br>"))
      .setClassName("history-text");

    if (location.pressEnterKey) {
      this.pressEnterKey = true;
      this.prompt.setVisible(true);
      this.inputTextArrow.setVisible(false);
    } else {
      this.prompt.setVisible(false);
      this.inputTextArrow.setVisible(true);
    }
  }

  // Visual Effects (for reference)
  private flashScreen(color: string = "#999999", duration: number = 200) {
    const flash = this.add.rectangle(
      0,
      0,
      this.scale.width,
      this.scale.height,
      Phaser.Display.Color.HexStringToColor(color).color
    );
    flash.setOrigin(0, 0);

    this.tweens.add({
      targets: flash,
      alpha: { from: 0, to: 0.2 },
      duration: duration,
      ease: "Sine.easeInOut",
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
