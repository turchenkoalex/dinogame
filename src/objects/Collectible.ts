import Phaser from 'phaser';

// Заготовка для будущего предмета. На уровне пока не используется.
export class Collectible extends Phaser.GameObjects.Arc {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 12, 0, 360, false, 0xffd65c);
    scene.add.existing(this);
  }
}
