import Phaser from 'phaser';

// Гриб здоровья с неподвижной зоной подбора и анимированными крыльями.
export class Collectible extends Phaser.GameObjects.Sprite {
  declare body: Phaser.Physics.Arcade.StaticBody;
  private collected = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'health_mushroom', 0);
    scene.add.existing(this);
    scene.physics.add.existing(this, true);
    this.body.setSize(24, 28);
    this.setScale(1.2);
    this.play('health-mushroom-fly');
  }

  collect(): boolean {
    if (this.collected) return false;
    this.collected = true;
    // Сразу исключаем повторный подбор, оставляя кадр активации видимым.
    this.body.enable = false;
    this.anims.stop();
    this.setFrame(5);
    const timer = this.scene.time.delayedCall(125, () => this.destroy());
    this.once('destroy', () => timer.remove(false));
    return true;
  }
}
