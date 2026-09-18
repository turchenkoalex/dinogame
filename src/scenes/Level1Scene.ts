import Phaser from 'phaser';
import { GAME_WIDTH } from '../config';
import { Player } from '../player/Player';

export class Level1Scene extends Phaser.Scene {
  private player!: Player;
  private restartKey!: Phaser.Input.Keyboard.Key;

  constructor() {
    super('Level1Scene');
  }

  create() {
    const platforms = this.physics.add.staticGroup();

    // x и y — центр платформы. В Phaser координата y растёт вниз.
    const platformPositions = [
      { x: GAME_WIDTH / 2, y: 690, width: GAME_WIDTH, height: 60 },
      { x: 320, y: 550, width: 220, height: 24 },
      { x: 590, y: 445, width: 200, height: 24 },
      { x: 850, y: 340, width: 200, height: 24 },
      { x: 1100, y: 235, width: 180, height: 24 },
    ];

    for (const platform of platformPositions) {
      const rectangle = this.add.rectangle(
        platform.x, platform.y, platform.width, platform.height, 0x427a55,
      );
      platforms.add(rectangle);
    }

    this.player = new Player(this, 100, 600);
    this.physics.add.collider(this.player, platforms);
    this.restartKey = this.input.keyboard!.addKey('R');

    this.add.text(32, 24, 'Level 1', {
      fontSize: '36px', color: '#172b3a',
    });
    this.add.text(32, 76, '← → — движение    Space / ↑ — прыжок    R — заново', {
      fontSize: '22px', color: '#172b3a',
    });
  }

  update() {
    if (Phaser.Input.Keyboard.JustDown(this.restartKey)) {
      this.scene.restart();
      return;
    }

    this.player.update();
  }
}
