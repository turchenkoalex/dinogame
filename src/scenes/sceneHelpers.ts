import Phaser from 'phaser';
import { Player } from '../player/Player';
import { GAME_WIDTH } from '../config';

export interface LevelState {
  health?: number;
  armorRemaining?: number;
  spawnX?: number;
  surfaceDragonDefeated?: boolean;
}

export function playerState(player: Player): LevelState {
  return { health: player.health, armorRemaining: player.armorRemaining };
}

export function restorePlayer(player: Player, state: LevelState) {
  player.health = state.health ?? player.health;
  if (state.armorRemaining && state.armorRemaining > 0) player.wearGoldenArmor(state.armorRemaining);
}

export function fadeTo(scene: Phaser.Scene, key: string, data?: object) {
  scene.cameras.main.fadeOut(280, 0, 0, 0);
  scene.cameras.main.once('camerafadeoutcomplete', () => scene.scene.start(key, data));
}

export function addPortal(scene: Phaser.Scene, x: number, y: number, label: string, color = 0x77d9ff) {
  const glow = scene.add.ellipse(x, y, 74, 126, color, 0.28).setStrokeStyle(3, color, 0.85);
  scene.tweens.add({ targets: glow, alpha: 0.35, scaleX: 1.15, scaleY: 1.08, duration: 850, yoyo: true, repeat: -1 });
  scene.add.text(x, y - 94, label, { fontFamily: 'Arial', fontSize: '18px', color: '#ffffff', backgroundColor: '#172331aa', padding: { x: 8, y: 4 } }).setOrigin(0.5);
  const zone = scene.add.zone(x, y, 64, 112);
  scene.physics.add.existing(zone, true);
  return zone;
}

export function addDefeatPrompt(scene: Phaser.Scene, player: Player) {
  player.once('defeated', () => {
    scene.add.text(GAME_WIDTH / 2, 210, 'Рыцарь повержен\nНажми R, чтобы попробовать снова', {
      fontFamily: 'Arial', fontSize: '32px', color: '#ffffff', align: 'center',
      backgroundColor: '#172331dd', padding: { x: 24, y: 16 },
    }).setOrigin(0.5).setDepth(1200);
  });
}
