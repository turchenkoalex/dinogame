import Phaser from 'phaser';
import { PLAYER_IDLE_FRAME_RATE, PLAYER_WALK_FRAME_RATE, PLAYER_ATTACK_FRAME_RATE } from '../config';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    this.load.image('knight_silver', `${import.meta.env.BASE_URL}assets/images/knight_silver.png`);
  }

  create() {
    const texture = this.textures.get('knight_silver');

    // В этом PNG нет ровной сетки. Вырезаем кадры внутри рамок, без подписей.
    // 0–3: покой, 4–7: ходьба, 8: прыжок, 9: падение.
    // Лишнюю позу без номера между ходьбой и прыжком пропускаем.
    const frameX = [12, 129, 245, 361, 476, 592, 708, 824, 1055, 1173];
    frameX.forEach((x, frame) => {
      texture.add(frame, 0, x, 381, 112, 158);
    });

    // Меч выходит за ширину обычного кадра. Сохраняем центр рыцаря,
    // чтобы при атаке не сдвигались персонаж и его физическое тело.
    texture.add(10, 0, 1289, 381, 132, 158)!.setTrim(112, 158, 0, 0, 132, 158);
    texture.add(11, 0, 1405, 381, 181, 158)!.setTrim(112, 158, 0, 0, 181, 158);

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

    // Позже здесь можно перейти в MenuScene, а пока сразу играем.
    this.scene.start('Level1Scene');
  }
}
