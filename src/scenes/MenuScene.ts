import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'Играть', {
      fontSize: '48px',
      color: '#172b3a',
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .once('pointerdown', () => this.scene.start('Level1Scene'));
  }
}
