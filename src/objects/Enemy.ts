import Phaser from 'phaser';

// Заготовка для будущего врага. Поведение добавим позже.
export class Enemy extends Phaser.GameObjects.Rectangle {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 40, 40, 0xdb6464);
    scene.add.existing(this);
  }
}
