import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PLAYER_MAX_HEALTH } from '../config';
import { addGround } from '../objects/Ground';
import { addHealthBar } from '../objects/HealthBar';
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
    addGround(this, ground, 0, 660, GAME_WIDTH);

    this.player = new Player(this, 160, 160);
    // Падение через вход не наносит урон и не сбрасывает текущие HP.
    this.player.health = data.health ?? this.player.health;
    this.physics.add.collider(this.player, ground);
    addHealthBar(this, this.player, PLAYER_MAX_HEALTH, 'Рыцарь', 24, 20);
    this.add.text(32, 108, 'Dungeon', { fontSize: '28px', color: '#ffffff' });
  }

  update() {
    this.player.update();
  }
}
