import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, HEALTH_MUSHROOM_HEAL, PLAYER_MAX_HEALTH, DRAGON_MAX_HEALTH } from '../config';
import { Player } from '../player/Player';
import { Enemy } from '../objects/Enemy';
import { connectDragonCombat } from '../objects/DragonCombat';
import { addGround } from '../objects/Ground';
import { addHealthBar } from '../objects/HealthBar';
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
    const clouds = [
      { x: 120, y: 150, scale: 0.14 },
      { x: 380, y: 235, scale: 0.18 },
      { x: 640, y: 125, scale: 0.16 },
      { x: 880, y: 205, scale: 0.13 },
      { x: 1140, y: 140, scale: 0.19 },
    ];
    for (const cloud of clouds) {
      this.add.image(cloud.x, cloud.y, 'cloud')
        .setScale(cloud.scale)
        .setDepth(-1);
    }

    // Камера фиксирована, но физический мир продолжается ниже экрана.
    this.physics.world.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT + 160);
    const platforms = this.physics.add.staticGroup();
    const hole = { x: 704, width: 128 };

    // Два независимых участка, между ними — настоящий вход в подземелье.
    addGround(this, platforms, 0, 620, hole.x);
    addGround(this, platforms, hole.x + hole.width, 620, GAME_WIDTH - hole.x - hole.width);

    // x/y — левый верхний угол изображения; одинаковый масштаб по обеим осям.
    // Три ступени по рисунку: короткая у дыры, средняя и верхняя справа.
    // Подъём не больше 104 px при высоте существующего прыжка ~141 px.
    const platformPositions = [
      { x: 560, y: 508, frames: [5, 6] },
      { x: 700, y: 404, frames: [5, 4, 6] },
      { x: 880, y: 320, frames: [5, 4, 6] },
    ];
    for (const platform of platformPositions) {
      let x = platform.x;
      for (const frame of platform.frames) {
        const tile = this.add.image(x, platform.y, 'terrain', frame)
          .setOrigin(0, 0).setScale(0.25);
        x += tile.displayWidth;
      }
      // Одно ровное тело на всю полосу, без стыков между тайлами.
      const surface = this.add.zone(platform.x, platform.y + 4, x - platform.x, 18)
        .setOrigin(0, 0);
      platforms.add(surface);
    }

    // Основание указателя стоит на земле; декорация не мешает движению.
    this.add.image(210, 628, 'sign').setOrigin(0.5, 1).setScale(0.1);

    this.player = new Player(this, 100, 580);
    this.physics.add.collider(this.player, platforms);
    const dragon = new Enemy(this, 1080, 628);
    this.physics.add.collider(dragon, platforms);
    const mushrooms = [
      new Collectible(this, 620, 480),
      new Collectible(this, 790, 376),
      new Collectible(this, 974, 292),
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

    addHealthBar(this, this.player, PLAYER_MAX_HEALTH, 'Рыцарь', 24, 20);
    addHealthBar(this, dragon, DRAGON_MAX_HEALTH, 'Дракон', GAME_WIDTH - 268, 20);
    for (const mushroom of mushrooms) {
      this.physics.add.overlap(this.player, mushroom, () => {
        if (!mushroom.collect()) return;
        this.player.heal(HEALTH_MUSHROOM_HEAL);
        this.player.wearGoldenArmor();
      });
    }

    connectDragonCombat(this.player, dragon);
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
