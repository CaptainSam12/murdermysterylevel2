import GameEnvBackground from './MansionLogic/GameEnvBackground.js';
import Player from './MansionLogic/Player.js';
import GameObject from './MansionLogic/GameObject.js';
import Npc from "./MansionLogic/Npc.js";

console.log("🥥 MurderMysteryLevel2 loaded!");


// ===============================
//     ROLLING COCONUT OBJECT
// ===============================
class RollingObject extends GameObject {
  constructor(data, gameEnv) {
    super(gameEnv);

    // Spawn off RIGHT side
    this.x = gameEnv.canvas.width + 50;

    // Random vertical lane
    this.y = Math.random() * (gameEnv.canvas.height - 120);

    this.width = data.isPowerUp ? 70 : 90;
    this.height = data.isPowerUp ? 70 : 90;

    this.speed = data.speed || 7;
    this.level = data.level;

    this.isPowerUp = data.isPowerUp || false;

    // Rotation for rolling
    this.rotation = 0;

    // Sprite image
    this.sprite = new Image();
    this.sprite.src = data.imageSrc;
  }

  update() {
    // Roll LEFT
    this.x -= this.speed;

    // Spin
    this.rotation += 0.1;

    // Collision with player
    const player = this.gameEnv.gameObjects.find(
      obj => obj.constructor.name === "Player"
    );

    if (player) {
      if (
        this.x < player.x + player.width &&
        this.x + this.width > player.x &&
        this.y < player.y + player.height &&
        this.y + this.height > player.y
      ) {
        if (this.isPowerUp) {
          this.level.collectPowerUp();
        } else {
          this.level.gameOver();
        }
        this.destroy();
      }
    }

    // Remove if offscreen
    if (this.x < -150) this.destroy();

    this.draw();
  }

  draw() {
    const ctx = this.gameEnv.ctx;

    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;

    // ✅ Draw sprite if loaded
    if (this.sprite.complete && this.sprite.naturalWidth > 0) {
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(this.rotation);

      ctx.drawImage(
        this.sprite,
        -this.width / 2,
        -this.height / 2,
        this.width,
        this.height
      );

      ctx.restore();
    }

    // 🟤 Coconut fallback
    else if (!this.isPowerUp) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, this.width / 2, 0, Math.PI * 2);
      ctx.fillStyle = "#8b4513";
      ctx.fill();
    }

    // 🍹 Piña fallback
    else {
      ctx.beginPath();
      ctx.arc(centerX, centerY, this.width / 2, 0, Math.PI * 2);
      ctx.fillStyle = "#ffd700";
      ctx.fill();
    }
  }

  destroy() {
    const index = this.gameEnv.gameObjects.indexOf(this);
    if (index > -1) this.gameEnv.gameObjects.splice(index, 1);
  }
}


// ===============================
//     MURDER MYSTERY LEVEL 2
// ===============================
class MurderMysteryLevel2 {
  constructor(gameEnv) {
    this.gameEnv = gameEnv;

    this.score = 0;
    this.spawnTimer = 0;
    this.gameEnded = false;

    // Speed boost
    this.defaultSpeed = 120;
    this.boostSpeed = 220;
    this.boostTimer = 0;

    // Reward state
    this.rewardSpawned = false;
    this.witnessSpawned = false;

    // ===============================
    // Background (Chapter 2 Run Map)
    // ===============================
    const bgData = {
      name: "background",
      src: gameEnv.path + "/assets/images/Ch2 Run map.png",
      pixels: { width: 1038, height: 580 },
      mode: "cover",
    };

    // ===============================
    // Player
    // ===============================
    const playerData = {
      id: "Spook",
      src: gameEnv.path + "/images/gamify/spookMcWalk.png",
      SCALE_FACTOR: 6,
      STEP_FACTOR: this.defaultSpeed,
      ANIMATION_RATE: 10,

      INIT_POSITION: {
        x: 100,
        y: gameEnv.innerHeight / 2,
      },

      pixels: { width: 3600, height: 2400 },
      orientation: { rows: 2, columns: 3 },

      left: { row: 0, start: 0, columns: 3 },
      right: { row: 1, start: 0, columns: 3 },

      keypress: { left: 65, right: 68 }, // A + D
    };

    // Load objects
    this.classes = [
      { class: GameEnvBackground, data: bgData },
      { class: Player, data: playerData },
    ];
  }

  // ===============================
  //     POWER UP COLLECTION
  // ===============================
  collectPowerUp() {
    console.log("🍹 Speed boost collected!");

    this.boostTimer = 300;

    const player = this.gameEnv.gameObjects.find(
      obj => obj.constructor.name === "Player"
    );

    if (player) player.STEP_FACTOR = this.boostSpeed;
  }

  // ===============================
  //         SPAWN OBJECTS
  // ===============================
  spawnCoconut() {
    this.gameEnv.gameObjects.push(
      new RollingObject(
        {
          speed: 9,
          level: this,
          isPowerUp: false,
          imageSrc: this.gameEnv.path + "/assets/images/coconut.png",
        },
        this.gameEnv
      )
    );
  }

  spawnPina() {
    this.gameEnv.gameObjects.push(
      new RollingObject(
        {
          speed: 7,
          level: this,
          isPowerUp: true,
          imageSrc: this.gameEnv.path + "/assets/images/pina-colada.png",
        },
        this.gameEnv
      )
    );
  }

  // ===============================
  //            UPDATE
  // ===============================
  update() {
    if (this.gameEnded) return;

    this.score++;
    this.spawnTimer++;

    // Spawn rolling objects
    if (this.spawnTimer > 50) {
      this.spawnTimer = 0;

      if (Math.random() < 0.2) this.spawnPina();
      else this.spawnCoconut();
    }

    // Boost timer
    if (this.boostTimer > 0) {
      this.boostTimer--;

      if (this.boostTimer === 0) {
        const player = this.gameEnv.gameObjects.find(
          obj => obj.constructor.name === "Player"
        );

        if (player) player.STEP_FACTOR = this.defaultSpeed;
      }
    }

    // WIN CONDITION
    if (this.score > 2000) {
      this.winGame();
    }
  }

  // ===============================
  //          GAME OVER
  // ===============================
  gameOver() {
    if (this.gameEnded) return;

    this.gameEnded = true;
    alert("💥 You got hit by a rolling coconut!");
  }

  // ===============================
  //             WIN
  // ===============================
  winGame() {
    if (this.gameEnded) return;

    this.gameEnded = true;
    console.log("🏆 You survived Level 2!");

    // Remove coconuts
    this.gameEnv.gameObjects = this.gameEnv.gameObjects.filter(
      obj => !(obj instanceof RollingObject)
    );

    // Spawn reward pot
    this.spawnPotOfGold();
  }

  // ===============================
  //       POT OF GOLD NPC
  // ===============================
  spawnPotOfGold() {
    if (this.rewardSpawned) return;
    this.rewardSpawned = true;

    console.log("🪙 Pot of Gold spawned!");

    const potData = {
      id: "PotOfGold",

      src: this.gameEnv.path + "/assets/images/pot-of-gold.png",

      dialogues: [
        "You found the Pot of Gold! 🪙",
        "Press E again to meet the witness..."
      ],

      interact: () => {
        console.log("✨ Pot collected!");

        pot.destroy();
        this.spawnWitnessNpc();
      }
    };

    const pot = new Npc(potData, this.gameEnv);

    pot.x = this.gameEnv.canvas.width / 2 - 50;
    pot.y = this.gameEnv.canvas.height / 2;

    this.gameEnv.gameObjects.push(pot);
  }

  // ===============================
  //       WITNESS NPC (ALIBI)
  // ===============================
  spawnWitnessNpc() {
    if (this.witnessSpawned) return;
    this.witnessSpawned = true;

    console.log("🧍 Witness appeared!");

    const witnessData = {
      id: "Witness",

      src: this.gameEnv.path + "/assets/images/pirate.png",

      dialogues: [
        "Psst... I saw everything.",
        "Spook was with me the whole time.",
        "They could NOT have done it.",
        "Here is your alibi. Go forward."
      ],

      interact: function () {
        this.showRandomDialogue();
      }
    };

    const witness = new Npc(witnessData, this.gameEnv);

    witness.x = this.gameEnv.canvas.width / 2 - 80;
    witness.y = this.gameEnv.canvas.height / 2 - 150;

    this.gameEnv.gameObjects.push(witness);
  }

  destroy() {
    console.log("🧹 MurderMysteryLevel2 cleaned up.");
  }
}

export default MurderMysteryLevel2;

