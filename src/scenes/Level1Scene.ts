import Phaser from 'phaser';
import { GAME_WIDTH, DRAGON_ATTACK_DISTANCE, TERRAIN_TILE_WIDTH, GROUND_BODY_OFFSET_Y } from '../config';
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

    // Тайл 64×64 без масштабирования. Верх земли остаётся на y = 660.
    const GROUND_Y = 692;
    for (let x = 32; x < GAME_WIDTH; x += 64) {
      const ground = platforms.create(x, GROUND_Y, 'ground_middle');
      ground.refreshBody();
      // Картинка остаётся на месте, а физическая рамка начинается ниже.
      ground.body.setOffset(0, GROUND_BODY_OFFSET_Y);
    }

    // x и y — центр платформы. В Phaser координата y растёт вниз.
    const platformPositions = [
      { x: 320, y: 550, width: 220, height: 24, ground: false },
      { x: 590, y: 445, width: 200, height: 24, ground: false },
      { x: 850, y: 340, width: 200, height: 24, ground: false },
      { x: 1100, y: 235, width: 180, height: 24, ground: false },
    ];

    for (const platform of platformPositions) {
      const rectangle = this.add.rectangle(
        platform.x, platform.y, platform.width, platform.height, 0x427a55,
      );
      // Один невидимый прямоугольник сохраняет ровные столкновения без стыков.
      rectangle.setVisible(false);
      platforms.add(rectangle);

      const tileCount = Math.max(2, Math.ceil(platform.width / TERRAIN_TILE_WIDTH));
      const tileWidth = platform.width / tileCount;
      const left = platform.x - platform.width / 2;
      const top = platform.y - platform.height / 2;

      for (let column = 0; column < tileCount; column++) {
        let frame = platform.ground ? column % 2 : 4;
        if (column === 0) frame = platform.ground ? 2 : 5;
        if (column === tileCount - 1) frame = platform.ground ? 3 : 6;

        this.add.image(left + column * tileWidth, top - 4, 'terrain', frame)
          .setOrigin(0, 0)
          .setDisplaySize(tileWidth, platform.height);
      }
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
