import Phaser from 'phaser';
import { PLAYER_IDLE_FRAME_RATE, PLAYER_WALK_FRAME_RATE, PLAYER_ATTACK_FRAME_RATE, DRAGON_IDLE_FRAME_RATE, DRAGON_ATTACK_FRAME_RATE } from '../config';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    this.load.spritesheet('health_mushroom', `${import.meta.env.BASE_URL}assets/images/health_mushroom.png`, {
      frameWidth: 48,
      frameHeight: 48,
      endFrame: 5,
    });
    this.load.image('knight_silver', `${import.meta.env.BASE_URL}assets/images/knight_silver.png`);
    this.load.image('dragon', `${import.meta.env.BASE_URL}assets/images/dragon.png`);
    this.load.image('terrain', `${import.meta.env.BASE_URL}assets/images/ground.png`);
    this.load.image('ground_middle', `${import.meta.env.BASE_URL}assets/images/ground_middle.png`);
  }

  create() {
    this.anims.create({
      key: 'health-mushroom-fly',
      frames: this.anims.generateFrameNumbers('health_mushroom', { start: 0, end: 4 }),
      frameRate: 9,
      repeat: -1,
    });
    this.createKnightAnimations();
    this.createDragonAnimations();
    this.createTerrainFrames();

    // Позже здесь можно перейти в MenuScene, а пока сразу играем.
    this.scene.start('Level1Scene');
  }

  private createTerrainFrames() {
    // В текущем PNG нет сетки 64×64, поэтому указываем области вручную.
    const texture = this.textures.get('terrain');
    const tiles = [
      { x: 25, width: 257, height: 213 }, // 0: земля
      { x: 291, width: 252, height: 213 }, // 1: другая земля
      { x: 560, width: 253, height: 213 }, // 2: левый край земли
      { x: 821, width: 255, height: 213 }, // 3: правый край земли
      { x: 1088, width: 271, height: 174 }, // 4: середина платформы
      { x: 1370, width: 256, height: 174 }, // 5: левый край платформы
      { x: 1636, width: 249, height: 174 }, // 6: правый край платформы
      { x: 1911, width: 227, height: 213 }, // 7: грунт
    ];

    tiles.forEach((tile, frame) => {
      texture.add(frame, 0, tile.x, 280, tile.width, tile.height);
    });
  }

  private createKnightAnimations() {
    const texture = this.textures.get('knight_silver');

    // Координаты кадров в PNG размером 2172×724. x растёт вправо.
    // 0–3: покой, 4–7: ходьба, 8: прыжок, 9: падение.
    // Дополнительную позу перед прыжком пока не используем.
    const frameX = [20, 156, 291, 427, 562, 698, 832, 965];
    frameX.forEach((x, frame) => {
      texture.add(frame, 0, x, 294, 120, 200);
    });

    // Широкие позы и меч помещаем относительно обычного кадра 120×200.
    // Так смена анимации не меняет центр и размер физического тела.
    texture.add(8, 0, 1222, 294, 132, 200)!.setTrim(120, 200, -16, 0, 132, 200);
    texture.add(9, 0, 1366, 294, 120, 200);
    texture.add(10, 0, 1502, 294, 138, 200)!.setTrim(120, 200, 0, 0, 138, 200);
    texture.add(11, 0, 1644, 294, 196, 200)!.setTrim(120, 200, 0, 0, 196, 200);
    // 13 — получение урона, поза непосредственно перед смертью.
    texture.add(13, 0, 1844, 294, 158, 200)!.setTrim(120, 200, 0, 0, 158, 200);
    // 14 (пятнадцатый кадр) — рыцарь лежит поверженным.
    texture.add(14, 0, 2002, 294, 322, 200);

    this.anims.create({
      key: 'knight-idle',
      frames: this.anims.generateFrameNumbers('knight_silver', { start: 0, end: 3 }),
      frameRate: PLAYER_IDLE_FRAME_RATE,
      repeat: -1,
    });

    this.anims.create({
      key: 'knight-walk',
      frames: this.anims.generateFrameNumbers('knight_silver', { start: 4, end: 7 }),
      frameRate: PLAYER_WALK_FRAME_RATE,
      repeat: -1,
    });

    this.anims.create({
      key: 'knight-attack',
      frames: this.anims.generateFrameNumbers('knight_silver', { start: 10, end: 11 }),
      frameRate: PLAYER_ATTACK_FRAME_RATE,
      repeat: 0,
    });
  }

  private createDragonAnimations() {
    // Текущий dragon.png — 2172×724, без ровной сетки 96×96.
    // Первые три позы вырезаем вручную, сохраняя общую линию земли.
    const dragonTexture = this.textures.get('dragon');
    const dragonFrameX = [12, 179, 347];
    dragonFrameX.forEach((x, frame) => {
      dragonTexture.add(frame, 0, x, 306, 167, 162);
    });

    // 7 — подготовка, 8–9 — огонь. Широкие кадры расширяются влево,
    // чтобы пламя помещалось целиком, а сам дракон оставался на месте.
    dragonTexture.add(7, 0, 1169, 306, 172, 162)!.setTrim(167, 162, -5, 0, 172, 162);
    dragonTexture.add(8, 0, 1347, 306, 202, 162)!.setTrim(167, 162, -35, 0, 202, 162);
    dragonTexture.add(9, 0, 1560, 306, 252, 162)!.setTrim(167, 162, -85, 0, 252, 162);
    // 10 — получение урона, поза непосредственно перед смертью.
    dragonTexture.add(10, 0, 1812, 306, 164, 162)!.setTrim(167, 162, 0, 0, 164, 162);
    // 11 (двенадцатый кадр) — дракон лежит поверженным.
    dragonTexture.add(11, 0, 1976, 294, 303, 200)!


    this.anims.create({
      key: 'dragon-idle',
      frames: this.anims.generateFrameNumbers('dragon', { start: 0, end: 2 }),
      frameRate: DRAGON_IDLE_FRAME_RATE,
      repeat: -1,
    });

    this.anims.create({
      key: 'dragon-fire',
      frames: this.anims.generateFrameNumbers('dragon', { start: 7, end: 9 }),
      frameRate: DRAGON_ATTACK_FRAME_RATE,
      repeat: 0,
    });

  }
}
