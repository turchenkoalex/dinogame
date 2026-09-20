import Phaser from 'phaser';

// Общий HUD для игровых сцен; значение HP остаётся у существующего персонажа.
export function addHealthBar(
  scene: Phaser.Scene,
  target: Phaser.Events.EventEmitter & { health: number; hasGoldenArmor?: boolean },
  maxHealth: number,
  label: string,
  x: number,
  y: number,
) {
  const panel = scene.add.container(x, y).setScrollFactor(0).setDepth(1000);
  const background = scene.add.rectangle(0, 0, 244, 68, 0x172331, 0.94).setOrigin(0);
  const title = scene.add.text(12, 8, label, { fontSize: '16px', color: '#ffffff' });
  const track = scene.add.rectangle(12, 36, 220, 20, 0x364353).setOrigin(0);
  const fill = scene.add.rectangle(14, 38, 216, 16, 0x57cb75).setOrigin(0);
  panel.add([background, title, track, fill]);

  const refresh = () => {
    const ratio = Phaser.Math.Clamp(target.health / maxHealth, 0, 1);
    fill.setDisplaySize(216 * ratio, 16).setVisible(ratio > 0);
    fill.setFillStyle(target.hasGoldenArmor ? 0xeec65b : ratio > 0.5 ? 0x57cb75 : ratio > 0.25 ? 0xeeb952 : 0xe66363);
    title.setText(target.health <= 0 ? `${label} — повержен` : target.hasGoldenArmor ? `${label} · броня` : label);
  };
  refresh();
  target.on('health-changed', refresh);
  target.on('armor-changed', refresh);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    target.off('health-changed', refresh);
    target.off('armor-changed', refresh);
  });
  return panel;
}
