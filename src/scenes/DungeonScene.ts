import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, GROUND_BODY_OFFSET_Y } from '../config';
import { Player } from '../player/Player';

export class DungeonScene extends Phaser.Scene {
  private player!: Player;

  constructor() {
    super('DungeonScene');
  }

  create(data: { health?: number } = {}) {
    this.cameras.main.setBackgroundColor('#161827');
    this.physics.world.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT);
    const ground = this.physics.add.staticGroup();
    for (let x = 32; x < GAME_WIDTH; x += 64) {
      const tile = ground.create(x, 692, 'ground_middle');
      tile.refreshBody();
      tile.body.setOffset(0, GROUND_BODY_OFFSET_Y);
    }

    this.player = new Player(this, 160, 160);
    // Падение через вход не наносит урон и не сбрасывает текущие HP.
    this.player.health = data.health ?? this.player.health;
    this.physics.add.collider(this.player, ground);
    this.add.text(32, 32, 'Dungeon', { fontSize: '28px', color: '#ffffff' });
  }

  update() {
    this.player.update();
  }
}
