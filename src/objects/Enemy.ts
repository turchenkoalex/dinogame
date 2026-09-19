import Phaser from 'phaser';
import { DRAGON_SCALE } from '../config';

// Дракон отвечает огнём на близкую атаку рыцаря. Урон добавим позже.
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

  }

  attack() {
    // true позволяет закончить текущий выдох, не начиная его заново.
    this.play('dragon-fire', true);
  }
}
