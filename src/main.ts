import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, GRAVITY } from './config';
import { BootScene } from './scenes/BootScene';
import { MenuScene } from './scenes/MenuScene';
import { DungeonScene } from './scenes/DungeonScene';
import { Level1Scene } from './scenes/Level1Scene';
import { VictoryScene } from './scenes/VictoryScene';
import { SkyIslandsScene } from './scenes/SkyIslandsScene';

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#bfe7f5',
  input: { activePointers: 3 },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: GRAVITY },
      // В локальной разработке видны физические рамки, на GitHub Pages — нет.
      debug: false,
    },
  },
  scene: [BootScene, MenuScene, Level1Scene, DungeonScene, SkyIslandsScene, VictoryScene],
});
