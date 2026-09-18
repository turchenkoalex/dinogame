import { defineConfig } from 'vite';

export default defineConfig(({ command }) => ({
  // На GitHub Pages игра живёт в /dinogame/, а при разработке — в корне.
  base: command === 'build' ? '/dinogame/' : '/',
}));
