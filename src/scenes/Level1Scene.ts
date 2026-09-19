import Phaser from 'phaser';
import { GAME_WIDTH, DRAGON_ATTACK_DISTANCE } from '../config';
import { Player } from '../player/Player';
import { Enemy } from '../objects/Enemy';

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
    const dragon = new Enemy(this, 1050, 660);

    this.player.on('attack-start', () => {
      // Сравниваем позиции у ног, учитывая и расстояние по высоте.
      const distance = Phaser.Math.Distance.Between(
        this.player.body.center.x, this.player.body.bottom,
        dragon.x, dragon.y,
      );

      if (distance <= DRAGON_ATTACK_DISTANCE) {
        dragon.attack();
      }
    });
    this.restartKey = this.input.keyboard!.addKey('R');
  }

  update() {
    if (Phaser.Input.Keyboard.JustDown(this.restartKey)) {
      this.scene.restart();
      return;
    }

    this.player.update();
  }
}
