import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, GROUND_BODY_OFFSET_Y, PLAYER_MAX_HEALTH } from '../config';
import { Player } from '../player/Player';
import { addHealthBar } from '../objects/HealthBar';
import { LevelState, restorePlayer, fadeTo, addPortal, addDefeatPrompt } from './sceneHelpers';

// Последний уровень — прыжки по островам вместо ещё одного боя.
export class SkyIslandsScene extends Phaser.Scene {
  private player!: Player;
  private restartKey!: Phaser.Input.Keyboard.Key;
  private collected = 0;
  private checkpointX = 100;
  private transitioning = false;

  constructor() {
    super('SkyIslandsScene');
  }

  create(data: LevelState = {}) {
    this.collected = 0;
    this.checkpointX = 100;
    this.transitioning = false;
    this.cameras.main.fadeIn(280, 0, 0, 0);
    this.physics.world.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT + 180);
    this.drawSky();

    const platforms = this.physics.add.staticGroup();
    this.addIsland(platforms, 0, 620, 320);
    this.addIsland(platforms, 490, 620, 295);
    this.addIsland(platforms, 960, 620, 320);
    this.addLedge(platforms, 275, 500, [5, 4, 6]);
    this.addLedge(platforms, 560, 390, [5, 4, 6]);
    this.addLedge(platforms, 790, 500, [5, 4, 6]);

    this.player = new Player(this, 100, 580);
    restorePlayer(this.player, data);
    this.physics.add.collider(this.player, platforms);
    addHealthBar(this, this.player, PLAYER_MAX_HEALTH, 'Рыцарь', 24, 20);
    addDefeatPrompt(this, this.player);

    const score = this.add.text(500, 30, 'Звёзды: 0 / 3', {
      fontFamily: 'Arial', fontSize: '27px', color: '#ffffff',
      backgroundColor: '#243957cc', padding: { x: 16, y: 8 },
    });
    this.add.text(440, 96, 'Собери три звезды, чтобы открыть портал. R — заново', {
      fontFamily: 'Arial', fontSize: '19px', color: '#ffffff',
      backgroundColor: '#243957bb', padding: { x: 10, y: 6 },
    });

    for (const [x, y] of [[370, 458], [650, 348], [865, 458]]) {
      this.addStar(x, y, () => {
        this.collected++;
        score.setText(`Звёзды: ${this.collected} / 3`);
        if (this.collected === 3) this.openExit();
      });
    }
    this.restartKey = this.input.keyboard!.addKey('R');
  }

  private drawSky() {
    const key = 'sky-islands-gradient';
    if (!this.textures.exists(key)) {
      const texture = this.textures.createCanvas(key, GAME_WIDTH, GAME_HEIGHT)!;
      const context = texture.getContext();
      const gradient = context.createLinearGradient(0, 0, 0, GAME_HEIGHT);
      gradient.addColorStop(0, '#213b71');
      gradient.addColorStop(0.5, '#716fa9');
      gradient.addColorStop(1, '#eebc9c');
      context.fillStyle = gradient;
      context.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      texture.refresh();
    }
    this.add.image(0, 0, key).setOrigin(0).setDepth(-10);
    this.add.circle(1050, 195, 88, 0xffdfaa, 0.2).setDepth(-9);
    this.add.circle(1050, 195, 59, 0xffe5b9, 0.9).setDepth(-8);

    const mountains = this.add.graphics().setDepth(-7);
    mountains.fillStyle(0x485c91, 0.65);
    mountains.fillPoints([{ x: 0, y: 545 }, { x: 150, y: 345 }, { x: 350, y: 555 }, { x: 570, y: 365 }, { x: 800, y: 550 }, { x: 1010, y: 330 }, { x: 1280, y: 560 }, { x: 1280, y: 720 }, { x: 0, y: 720 }], true);
    mountains.fillStyle(0x293f72, 0.55);
    mountains.fillPoints([{ x: 0, y: 610 }, { x: 210, y: 470 }, { x: 420, y: 610 }, { x: 690, y: 435 }, { x: 890, y: 610 }, { x: 1170, y: 475 }, { x: 1280, y: 585 }, { x: 1280, y: 720 }, { x: 0, y: 720 }], true);

    for (const [x, y, scale] of [[110, 160, 0.11], [380, 250, 0.13], [690, 180, 0.1], [1010, 290, 0.12]]) {
      const cloud = this.add.image(x, y, 'cloud').setScale(scale).setAlpha(0.42).setDepth(-6);
      this.tweens.add({ targets: cloud, x: x + 22, duration: 2600 + x, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }
  }

  private addIsland(group: Phaser.Physics.Arcade.StaticGroup, left: number, top: number, width: number) {
    this.add.tileSprite(left, top + 24, width, GAME_HEIGHT + 180 - top - 24, 'ground_middle', 'soil')
      .setOrigin(0).setTint(0x7697c8);
    this.add.tileSprite(left, top, width, 64, 'ground_middle', '__BASE')
      .setOrigin(0).setTint(0xa5d6e6);
    group.add(this.add.zone(left, top + GROUND_BODY_OFFSET_Y, width, GAME_HEIGHT + 180 - top - GROUND_BODY_OFFSET_Y).setOrigin(0));
  }

  private addLedge(group: Phaser.Physics.Arcade.StaticGroup, left: number, top: number, frames: number[]) {
    let right = left;
    for (const frame of frames) {
      const tile = this.add.image(right, top, 'terrain', frame).setOrigin(0).setScale(0.25).setTint(0xb9cbe9);
      right += tile.displayWidth;
    }
    group.add(this.add.zone(left, top + 4, right - left, 18).setOrigin(0));
  }

  private addStar(x: number, y: number, onCollect: () => void) {
    const halo = this.add.circle(x, y, 31, 0xffe18b, 0.22);
    const star = this.add.star(x, y, 5, 12, 25, 0xffe28a).setStrokeStyle(2, 0xffffff);
    this.tweens.add({ targets: [halo, star], y: y - 10, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    const zone = this.add.zone(x, y, 64, 70);
    this.physics.add.existing(zone, true);
    this.physics.add.overlap(this.player, zone, () => {
      zone.destroy();
      halo.destroy();
      star.destroy();
      onCollect();
    });
  }

  private openExit() {
    const exit = addPortal(this, 1180, 566, 'Домой →', 0xffdc75);
    this.physics.add.overlap(this.player, exit, () => {
      if (this.transitioning || !this.player.isLive()) return;
      this.transitioning = true;
      fadeTo(this, 'VictoryScene');
    });
  }

  update() {
    if (Phaser.Input.Keyboard.JustDown(this.restartKey)) {
      this.scene.restart();
      return;
    }
    this.player.update();
    if (!this.player.isLive()) return;
    if (this.player.body.blocked.down && this.player.x > 520) this.checkpointX = 550;
    if (this.player.body.blocked.down && this.player.x > 1000) this.checkpointX = 1050;
    if (this.player.y > GAME_HEIGHT + 20) {
      this.player.takeDamage(20);
      if (this.player.isLive()) this.player.body.reset(this.checkpointX, 540);
    }
  }
}
