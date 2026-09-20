import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, DRAGON_ATTACK_DISTANCE, GROUND_BODY_OFFSET_Y, PLAYER_ATTACK_DAMAGE, DRAGON_ATTACK_DAMAGE, HEALTH_MUSHROOM_HEAL } from '../config';
import { Player } from '../player/Player';
import { Enemy } from '../objects/Enemy';
import { Collectible } from '../objects/Collectible';

export class Level1Scene extends Phaser.Scene {
  private player!: Player;
  private transitioning = false;
  private restartKey!: Phaser.Input.Keyboard.Key;

  constructor() {
    super('Level1Scene');
  }

  create() {
    this.transitioning = false;
    // Камера фиксирована, но физический мир продолжается ниже экрана.
    this.physics.world.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT + 160);
    const platforms = this.physics.add.staticGroup();
    const hole = { x: 704, width: 128 };

    // Два ряда земли. В обоих рядах над входом нет ни спрайтов, ни тел.
    for (let x = 32; x < GAME_WIDTH; x += 64) {
      if (x >= hole.x && x < hole.x + hole.width) continue;
      for (const y of [652, 716]) {
        const ground = platforms.create(x, y, 'ground_middle');
        ground.refreshBody();
        ground.body.setOffset(0, GROUND_BODY_OFFSET_Y);
      }
    }

    // x/y — левый верхний угол изображения; одинаковый масштаб по обеим осям.
    // Подъём 104 px меньше высоты существующего прыжка (~141 px).
    const platformPositions = [
      { x: 160, y: 508 },
      { x: 350, y: 404 },
      { x: 540, y: 300 },
      { x: 730, y: 196 },
      { x: 920, y: 92 },
    ];
    for (const platform of platformPositions) {
      let x = platform.x;
      for (const frame of [5, 4, 6]) {
        const tile = this.add.image(x, platform.y, 'terrain', frame)
          .setOrigin(0, 0).setScale(0.25);
        x += tile.displayWidth;
      }
      // Одно ровное тело на всю полосу, без стыков между тайлами.
      const surface = this.add.zone(platform.x, platform.y + 4, x - platform.x, 18)
        .setOrigin(0, 0);
      platforms.add(surface);
    }

    this.player = new Player(this, 100, 580);
    this.physics.add.collider(this.player, platforms);
    const dragon = new Enemy(this, 1080, 628);
    this.physics.add.collider(dragon, platforms);
    const mushrooms = [
      new Collectible(this, 260, 480),
      new Collectible(this, 640, 272),
      new Collectible(this, 1020, 64),
    ];

    // Только локальный overlap под дырой ведёт в подземелье.
    // Zone невидима, но её Arcade body виден в physics debug.
    const dungeonTrigger = this.add.zone(hole.x + hole.width / 2, 708, hole.width, 24);
    this.physics.add.existing(dungeonTrigger, true);
    this.physics.add.overlap(this.player, dungeonTrigger, () => {
      if (this.transitioning || !this.player.isLive()) return;
      this.transitioning = true;
      this.scene.start('DungeonScene', { health: this.player.health });
    });

    const healthText = this.add.text(32, 24, '', {
      fontSize: '22px', color: '#172b3a',
    });
    const updateHealthText = () => {
      const armorText = this.player.hasGoldenArmor ? '  Золотая броня' : '';
      healthText.setText(`Рыцарь: ${this.player.health}/100${armorText}    Дракон: ${dragon.health}/200`);
    };
    updateHealthText();

    this.player.on('health-changed', updateHealthText);
    this.player.on('armor-changed', updateHealthText);
    dragon.on('health-changed', updateHealthText);
    for (const mushroom of mushrooms) {
      this.physics.add.overlap(this.player, mushroom, () => {
        if (!mushroom.collect()) return;
        this.player.heal(HEALTH_MUSHROOM_HEAL);
        this.player.wearGoldenArmor();
        updateHealthText();
      });
    }
    this.player.on('defeated', () => healthText.setText('Рыцарь повержен'));
    dragon.on('defeated', () => healthText.setText('Дракон повержен'));

    this.player.on('attack-start', () => {
      // Сравниваем позиции у ног, учитывая и расстояние по высоте.
      const distance = Phaser.Math.Distance.Between(
        this.player.body.center.x, this.player.body.bottom,
        dragon.x, dragon.y,
      );

      if (distance <= DRAGON_ATTACK_DISTANCE) {
        dragon.takeDamage(PLAYER_ATTACK_DAMAGE);
        dragon.attack();
      }
    });
    dragon.on('animationcomplete-dragon-fire', () => {
      if (dragon.health > 0 && this.player.health > 0) {
        const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, dragon.x, dragon.y);
        if (distance <= DRAGON_ATTACK_DISTANCE) {
          this.player.takeDamage(DRAGON_ATTACK_DAMAGE);
        }
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
