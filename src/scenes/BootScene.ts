import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    // Позже здесь можно перейти в MenuScene, а пока сразу играем.
    this.scene.start('Level1Scene');
  }
}
