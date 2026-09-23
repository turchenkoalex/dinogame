import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';

export class VictoryScene extends Phaser.Scene {
  constructor() { super('VictoryScene'); }

  create() {
    this.cameras.main.setBackgroundColor('#172331');
    this.cameras.main.fadeIn(350, 0, 0, 0);
    this.add.text(GAME_WIDTH / 2, 230, 'ПОБЕДА!', {
      fontFamily: 'Arial', fontSize: '72px', color: '#ffdc83', fontStyle: 'bold',
    }).setOrigin(0.5);
    this.add.text(GAME_WIDTH / 2, 330, 'Рыцарь собрал небесные звёзды и вернулся домой', {
      fontFamily: 'Arial', fontSize: '28px', color: '#ffffff',
    }).setOrigin(0.5);
    const again = this.add.text(GAME_WIDTH / 2, 455, 'Играть снова', {
      fontFamily: 'Arial', fontSize: '32px', color: '#172331', backgroundColor: '#ffdc83', padding: { x: 24, y: 14 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    again.on('pointerdown', () => this.scene.start('Level1Scene'));
    this.input.keyboard!.once('keydown-ENTER', () => this.scene.start('Level1Scene'));
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 70, 'Enter — играть снова', { fontFamily: 'Arial', fontSize: '20px', color: '#b9cbd4' }).setOrigin(0.5);
  }
}
