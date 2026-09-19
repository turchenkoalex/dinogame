import Phaser from 'phaser';
import { DRAGON_SCALE, DRAGON_ATTACK_INTERVAL } from '../config';

// Дракон стоит и периодически выдыхает огонь. Урон добавим позже.
export class Enemy extends Phaser.GameObjects.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'dragon', 0);
    scene.add.existing(this);
    // y обозначает землю под ногами. На картинке дракон уже смотрит влево.
    this.setOrigin(0.5, 1);
    this.setScale(DRAGON_SCALE);
    this.play('dragon-idle');

    this.on('animationcomplete-dragon-fire', () => {
      this.play('dragon-idle');
    });

    const attackTimer = scene.time.addEvent({
      delay: DRAGON_ATTACK_INTERVAL,
      loop: true,
      callback: () => this.play('dragon-fire', true),
    });

    // При удалении дракона или перезапуске уровня убираем его таймер.
    this.once('destroy', () => attackTimer.remove(false));
  }
}
