import 'phaser'

// 引入所有场景
import * as scenes from './scenes'

import { TILE_SIZE, TILE_SPACING } from './constant'

// 场景转成数组
let scene = [];
for (let i in scenes) {
  scene.push(scenes[i]);
}

let config = {
  type: Phaser.AUTO,
  parent: 'app',
  backgroundColor: 0xbbada0,
  width: TILE_SIZE * 4 + TILE_SPACING * 5,
  height: (TILE_SIZE * 4 + TILE_SPACING * 5) / .5625,
  scene
};

window.game = new Phaser.Game(config);