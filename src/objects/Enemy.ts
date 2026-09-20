import Phaser from 'phaser';
import { DRAGON_SCALE, DRAGON_MAX_HEALTH } from '../config';

// Дракон отвечает огнём на близкую атаку рыцаря.
export class Enemy extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;
  health = DRAGON_MAX_HEALTH;
  private hurtTimer?: Phaser.Time.TimerEvent;
  private attackPending = false;
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'dragon', 0);
    scene.add.existing(this);
    // y обозначает землю под ногами. На картинке дракон уже смотрит влево.
    this.setOrigin(0.5, 1);
    this.setScale(DRAGON_SCALE);
    scene.physics.add.existing(this);
    // Постоянная рамка тела без огня; её нижняя граница проходит по лапам.
    this.body.setSize(147, 150);
    this.body.setCollideWorldBounds(true);
    this.play('dragon-idle');

    this.on('animationcomplete-dragon-fire', () => {
      this.play('dragon-idle');
    });
    this.once('destroy', () => this.hurtTimer?.remove(false));
  }

  attack() {
    if (this.health <= 0) return;

    // Ответный огонь начинается после того, как показана поза урона.
    if (this.hurtTimer) {
      this.attackPending = true;
      return;
    }

    // true позволяет закончить текущий выдох, не начиная его заново.
    this.play('dragon-fire', true);
  }

  takeDamage(amount: number) {
    if (this.health <= 0) return;

    this.health = Math.max(0, this.health - amount);
    this.emit('health-changed', this.health);
    this.hurtTimer?.remove(false);
    this.hurtTimer = undefined;

    if (this.health === 0) {
      this.emit('defeated');
      this.attackPending = false;
      // 11 — двенадцатый кадр дракона: он лежит поверженным.
      this.anims.stop();
      this.setFrame(11);
      this.body.stop();
      this.body.enable = false;
    } else {
      this.attackPending ||= this.anims.currentAnim?.key === 'dragon-fire' && this.anims.isPlaying;
      this.anims.stop();
      this.setFrame(10);
      this.hurtTimer = this.scene.time.delayedCall(300, () => {
        this.hurtTimer = undefined;
        if (this.health <= 0) return;

        if (this.attackPending) {
          this.attackPending = false;
          this.attack();
        } else {
          this.play('dragon-idle');
        }
      });
    }
  }
}
