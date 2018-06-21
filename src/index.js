import 'phaser'

// 引入所有场景
import * as scenes from './scenes'

// 场景转成数组
let scene = [];
for (let i in scenes) {
  scene.push(scenes[i]);
}

let config = {
  type: Phaser.AUTO,
  parent: 'app',
  width: 800,
  height: 600,
  backgroundColor: 0x000000,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
      debug: true
    }
  },
  scene
};

let game = new Phaser.Game(config);