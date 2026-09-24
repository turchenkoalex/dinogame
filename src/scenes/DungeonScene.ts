import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PLAYER_MAX_HEALTH, DRAGON_MAX_HEALTH } from '../config';
import { addGround } from '../objects/Ground';
import { addHealthBar } from '../objects/HealthBar';
import { Player } from '../player/Player';
import { Enemy } from '../objects/Enemy';
import { connectDragonCombat } from '../objects/DragonCombat';
import { Collectible } from '../objects/Collectible';
import { LevelState, restorePlayer, playerState, fadeTo, addPortal, addDefeatPrompt } from './sceneHelpers';

export class DungeonScene extends Phaser.Scene {
  private player!: Player;
  private dragon!: Enemy;
  private restartKey!: Phaser.Input.Keyboard.Key;
  private transitioning = false;

  constructor() {
    super('DungeonScene');
  }

  create(data: LevelState = {}) {
    this.transitioning = false;
    this.cameras.main.setBackgroundColor('#161827');
    this.cameras.main.fadeIn(280, 0, 0, 0);
    this.physics.world.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT);
    this.addTorches();
    const ground = this.physics.add.staticGroup();
    addGround(this, ground, 0, 660, GAME_WIDTH);

    this.player = new Player(this, 160, 160);
    // Падение через вход не наносит урон и не сбрасывает текущие HP.
    restorePlayer(this.player, data);
    this.physics.add.collider(this.player, ground);
    addHealthBar(this, this.player, PLAYER_MAX_HEALTH, 'Рыцарь', 24, 20);

    const dragon = this.dragon = new Enemy(this, 1080, 668, 2);
    this.physics.add.collider(dragon, ground);
    addHealthBar(this, dragon, DRAGON_MAX_HEALTH, 'Дракон', GAME_WIDTH - 268, 20);
    connectDragonCombat(this.player, dragon, 2);
    const mushroom = new Collectible(this, 610, 617);
    this.physics.add.overlap(this.player, mushroom, () => {
      if (!mushroom.collect()) return;
      this.player.heal(50);
      this.player.wearGoldenArmor();
    });

    const returnPortal = addPortal(this, 76, 606, 'На поверхность');
    this.physics.add.overlap(this.player, returnPortal, () => {
      if (this.transitioning || !this.player.isLive()) return;
      this.transitioning = true;
      fadeTo(this, 'Level1Scene', { ...playerState(this.player), spawnX: 550, surfaceDragonDefeated: data.surfaceDragonDefeated });
    });
    dragon.once('defeated', () => {
      const exitPortal = addPortal(this, 1200, 606, 'Небесные острова →', 0xffd875);
      this.physics.add.overlap(this.player, exitPortal, () => {
        if (this.transitioning || !this.player.isLive()) return;
        this.transitioning = true;
        fadeTo(this, 'SkyIslandsScene', playerState(this.player));
      });
    });
    addDefeatPrompt(this, this.player);
    this.add.text(330, 90, 'Победи дракона и найди выход. R — начать заново', {
      fontFamily: 'Arial', fontSize: '19px', color: '#ffffff', backgroundColor: '#172331cc', padding: { x: 10, y: 6 },
    });
    this.restartKey = this.input.keyboard!.addKey('R');
  }

  private addTorches() {
    // Общая текстура мягкого света переиспользуется при повторном входе.
    const glowKey = 'torch-glow';
    if (!this.textures.exists(glowKey)) {
      const texture = this.textures.createCanvas(glowKey, 512, 512)!;
      const context = texture.getContext();
      const gradient = context.createRadialGradient(256, 256, 0, 256, 256, 256);
      gradient.addColorStop(0, 'rgba(255, 180, 70, 0.32)');
      gradient.addColorStop(0.25, 'rgba(255, 140, 45, 0.18)');
      gradient.addColorStop(0.6, 'rgba(235, 100, 25, 0.06)');
      gradient.addColorStop(1, 'rgba(235, 100, 25, 0)');
      context.fillStyle = gradient;
      context.fillRect(0, 0, 512, 512);
      texture.refresh();
    }

    const positions = [
      { x: 200, y: 420 },
      { x: 490, y: 370 },
      { x: 790, y: 420 },
      { x: 1090, y: 370 },
    ];
    positions.forEach(({ x, y }, index) => {
      const glow = this.add.image(x, y, glowKey).setDepth(-2);
      this.add.image(x, y, 'fire').setOrigin(0.6, 0.3).setScale(0.12).setDepth(-1);
      // Независимое мерцание света; сам настенный факел остаётся неподвижным.
      this.tweens.add({
        targets: glow,
        alpha: 0.72,
        scaleX: 0.94,
        scaleY: 0.96,
        duration: 380 + index * 97,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1,
      });
    });
  }

  update() {
    if (Phaser.Input.Keyboard.JustDown(this.restartKey)) {
      this.scene.restart();
      return;
    }
    this.player.update();
    this.dragon.update(this.player);
  }
}
