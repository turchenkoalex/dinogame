import Phaser from 'phaser';
import { PLAYER_IDLE_FRAME_RATE, PLAYER_WALK_FRAME_RATE, PLAYER_ATTACK_FRAME_RATE, DRAGON_IDLE_FRAME_RATE, DRAGON_ATTACK_FRAME_RATE } from '../config';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    this.load.image('knight_silver', `${import.meta.env.BASE_URL}assets/images/knight_silver.png`);
    this.load.image('dragon', `${import.meta.env.BASE_URL}assets/images/dragon.png`);
  }

  create() {
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

    // Позже здесь можно перейти в MenuScene, а пока сразу играем.
    this.scene.start('Level1Scene');
  }
}
