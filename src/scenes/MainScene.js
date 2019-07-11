import { COL, ROW, TILE_SIZE, TILE_SPACING, TWEEN_DURATION, LOCAL_STORAGE_NAME } from '../constant'

class MainScene extends Phaser.Scene {

    tileArray = [];
    canMove = false;
    score = 0; // 分数
    bestScore = localStorage.getItem(LOCAL_STORAGE_NAME) == null ? 0 : localStorage.getItem(LOCAL_STORAGE_NAME); // 最高分数

    constructor() {
        super({
            key: 'MainScene'
        });
    }

    preload() {
        this.load.image('tile_default', 'assets/sprites/tile_default.png');
        this.load.image('restart', 'assets/sprites/restart.png');
        this.load.image('score', 'assets/sprites/score.png');
        this.load.image('score_best', 'assets/sprites/score_best.png');

        this.load.spritesheet('tiles', 'assets/sprites/tiles.png', {
            frameWidth: TILE_SIZE,
            frameHeight: TILE_SIZE
        });

        this.load.audio("move", ["assets/sounds/move.ogg", "assets/sounds/move.mp3"]);
        this.load.audio("grow", ["assets/sounds/grow.ogg", "assets/sounds/grow.mp3"]);
    }

    create() {
        this.layout();

        // 随机生成 2 个数字方块
        this.addTile();
        this.addTile();

        this.addEvent();

        this.addSound();

    }

    addSound() {
        this.moveSound = this.sound.add("move");
        this.growSound = this.sound.add("grow");
    }

    addEvent() {
        // 移动端操作
        this.input.on("pointerup", this.handleTouch);

        // 键盘操作
        this.input.keyboard.on("keydown", this.handleKey);
    }

    handleTouch = (e) => {

        if (this.canMove) {

            // 计算按住时间
            let swipeTime = e.upTime - e.downTime;

            // 生成 {x: v1, y: v2} 格式
            let swipe = new Phaser.Geom.Point(e.upX - e.downX, e.upY - e.downY);

            // 获取对角线长度
            let swipeMagnitude = Phaser.Geom.Point.GetMagnitude(swipe);

            // 偏向方向比例 1 为直着朝一个方向
            let swipeNormal = new Phaser.Geom.Point(swipe.x / swipeMagnitude, swipe.y / swipeMagnitude);

            /**
             * 滑动的对角线长度大于 20
             * 滑动的时间小于 1000 毫秒
             * 滑动的角度尽量偏一个方向
             */
            if (swipeMagnitude > 20 && swipeTime < 1000 && (Math.abs(swipeNormal.y) > .8 || Math.abs(swipeNormal.x) > .8)) {
                let children = this.tileGroup.getChildren();
                if (swipeNormal.x > .8) {
                    for (var i = 0; i < children.length; i++) {

                        // 设置层级，越左侧层级越高
                        children[i].depth = game.config.width - children[i].x;
                    }
                    console.log('向右')
                    this.move(0, 1);
                }

                if (swipeNormal.x < -.8) {
                    for (var i = 0; i < children.length; i++) {

                        // 越向右层级越高
                        children[i].depth = children[i].x;
                    }
                    console.log('向左')
                    this.move(0, -1);
                }

                if (swipeNormal.y > .8) {
                    for (var i = 0; i < children.length; i++) {

                        // 越上面层级越高
                        children[i].depth = game.config.height - children[i].y;
                    }
                    console.log('向下')
                    this.move(1, 0);

                }

                if (swipeNormal.y < -.8) {
                    for (var i = 0; i < children.length; i++) {

                        // 越下面层级越高
                        children[i].depth = children[i].y;
                    }
                    console.log('向上')
                    this.move(-1, 0);
                }
            }
        }
    }


    handleKey = (e) => {

        if (this.canMove) {
            let children = this.tileGroup.getChildren();
            switch (e.code) {
                case "KeyA":
                case "ArrowLeft":
                    for (var i = 0; i < children.length; i++) {

                        // 越向右层级越高
                        children[i].depth = children[i].x;
                    }
                    console.log('向左')

                    // 行为 0，不变化，列为 -1，向左
                    this.move(0, -1);
                    break;
                case "KeyD":
                case "ArrowRight":
                    for (var i = 0; i < children.length; i++) {

                        // 设置层级，越左侧层级越高
                        children[i].depth = game.config.width - children[i].x;
                    }
                    console.log('向右')

                    // 行为 0，不变化，列为 1，向右
                    this.move(0, 1);
                    break;
                case "KeyW":
                case "ArrowUp":
                    for (var i = 0; i < children.length; i++) {

                        // 越下面层级越高
                        children[i].depth = children[i].y;
                    }
                    console.log('向上')

                    // 列为 0，不变化，行为 -1，向上
                    this.move(-1, 0);
                    break;
                case "KeyS":
                case "ArrowDown":
                    for (var i = 0; i < children.length; i++) {

                        // 越上面层级越高
                        children[i].depth = game.config.height - children[i].y;
                    }
                    console.log('向下')

                    // 列为 0，不变化，行为 1，向下
                    this.move(1, 0);
                    break;
            }
        }
    }


    /**
     * 
     * @param stepRow 行的变化，上下变化，上下滑动，0 为不变化， 1为进1块  -1为退1块
     * @param stepCol 列的变化，左右变化，左右滑动，0 为不变化， 1为进1块  -1为退1块
     */
    move(rowStep, colStep) {
        this.canMove = false;
        this.movingTiles = 0;
        let somethingMoved = false;
        let moveScore = 0;

        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {

                /**
                 * 一块一块移动去判断
                 * 正确的移动顺序应该是：
                 * 向左移动（move(0, -1)）：从左到右，从上到下遍历判断移动【默认遍历 i，j 即可】
                 * 向右移动（move(0, 1)） ：从右到左，从上到下遍历判断移动【默认遍历 i，j 取反值】
                 * 向上移动（move(-1, 0） ：从左到右，从上到下遍历判断移动【默认遍历 i，j 即可】
                 * 向下移动（move(1, 0)） ：从左到右，从下到上遍历判断移动【默认遍历 j，i 取反值】
                 */
                let row = rowStep === 1 ? (3 - i) : i;
                let col = colStep === 1 ? (3 - j) : j;

                let tileValue = this.tileArray[row][col].tileValue;
                if (tileValue !== 0) {

                    // 横向移动单位距离
                    let rowSteps = rowStep;

                    // 纵向移动单位距离
                    let colSteps = colStep;

                    // 条件一：靠边移动，不可超出
                    // 条件二：移动的地方没有数值方块
                    while (this.isInsideBoard(row + rowSteps, col + colSteps) && this.tileArray[row + rowSteps][col + colSteps].tileValue === 0) {
                        colSteps += colStep;
                        rowSteps += rowStep;
                    }

                    // 条件一：靠边移动，不可超出
                    // 条件二：目标方块与当前方块 tileValue 相等，也就是数值相等
                    // 条件三：目标方块 canUpgrade 为 true【控制一次只能被覆盖一次】
                    // 条件四：当前方块 canUpgrade 为 true
                    // 条件五：tileValue 小于 12 Math.pow(2,12) 4096，最大 4096
                    if (this.isInsideBoard(row + rowSteps, col + colSteps) &&
                        (this.tileArray[row + rowSteps][col + colSteps].tileValue === tileValue) &&
                        this.tileArray[row + rowSteps][col + colSteps].canUpgrade &&
                        this.tileArray[row][col].canUpgrade &&
                        tileValue < 12) {

                        // 目标方块 tileValue + 1， 本来是 Math.pow(2,1) 变成了 Math.pow(2,2)，也就是方块 2 变成 4
                        this.tileArray[row + rowSteps][col + colSteps].tileValue++;

                        // 移动分数
                        moveScore += Math.pow(2, this.tileArray[row + rowSteps][col + colSteps].tileValue);

                        // 目标块只能被覆盖一次
                        this.tileArray[row + rowSteps][col + colSteps].canUpgrade = false;

                        // 设置当前方块 tileValue 为 0
                        this.tileArray[row][col].tileValue = 0;

                        // 当前方块移动到目标方块
                        // 参数一：当前数值精灵
                        // 参数二：横向位置
                        // 参数三：纵向位置
                        // 参数四：移动单位距离
                        // 参数五： bool
                        this.moveTile(this.tileArray[row][col], row + rowSteps, col + colSteps, Math.abs(rowSteps + colSteps), true);
                        somethingMoved = true;
                    } else {

                        // while 时最后一次条件不成立，但 colSteps 与 rowSteps 已经加了col与row，所以这里减回去。
                        rowSteps = rowSteps - rowStep;
                        colSteps = colSteps - colStep;

                        // 若横向或纵向有移动，则开始移动
                        if (colSteps !== 0 || rowSteps !== 0) {

                            // console.log(row, rowSteps, col, colSteps)
                            // 设置移动到的地方值为当前值
                            this.tileArray[row + rowSteps][col + colSteps].tileValue = tileValue;

                            // 设置当前块的值为 0
                            this.tileArray[row][col].tileValue = 0;

                            // 参数一：精灵
                            // 参数二：横向位置
                            // 参数三：纵向位置
                            // 参数四：移动单位距离
                            // 参数五： bool
                            this.moveTile(this.tileArray[row][col], row + rowSteps, col + colSteps, Math.abs(rowSteps + colSteps), false);
                            somethingMoved = true;
                        }
                    }
                }
            }
        }

        if (!somethingMoved) {
            this.canMove = true;
        } else {
            this.moveSound.play();
            this.score += moveScore;
            if (this.score > this.bestScore) {
                this.bestScore = this.score;
                localStorage.setItem(LOCAL_STORAGE_NAME, this.bestScore);
            }
        }
    }

    /**
     * 
     * @param {Sprite} tile 
     * @param {Number} row 
     * @param {Number} col 
     * @param {Number} distance 根据距离动态改变动画运行时间
     * @param {Booler} changeNumber 
     */
    moveTile(tile, row, col, distance, changeNumber) {

        this.movingTiles++;
        this.tweens.add({
            targets: [tile.tileSprite],
            x: this.setPosition(col, COL),
            y: this.setPosition(row, ROW),
            duration: TWEEN_DURATION * distance,
            onComplete: () => {
                this.movingTiles--;
                if (changeNumber) {
                    this.transformTile(tile, row, col);
                }
                if (this.movingTiles === 0) {
                    this.scoreText.setText(this.score);
                    this.bestScoreText.setText(this.bestScore);
                    this.resetTiles();
                    this.addTile();
                }

            }
        })
    }

    transformTile(tile, row, col) {
        this.growSound.play();
        this.movingTiles++;
        tile.tileSprite.setFrame(this.tileArray[row][col].tileValue - 1);
        this.tweens.add({
            targets: [tile.tileSprite],
            scaleX: 1.1,
            scaleY: 1.1,
            duration: TWEEN_DURATION,
            yoyo: true,
            repeat: 1,
            onComplete: () => {
                this.movingTiles--;
                if (this.movingTiles === 0) {
                    this.scoreText.setText(this.score);
                    this.bestScoreText.setText(this.bestScore);
                    this.resetTiles();
                    this.addTile();
                }
            }
        })
    }

    // 精灵归位，数组中指定的 tileValue 信息来显示数组中
    resetTiles() {
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                this.tileArray[i][j].canUpgrade = true;
                this.tileArray[i][j].tileSprite.x = this.setPosition(j, COL);
                this.tileArray[i][j].tileSprite.y = this.setPosition(i, ROW);
                if (this.tileArray[i][j].tileValue > 0) {
                    this.tileArray[i][j].tileSprite.alpha = 1;
                    this.tileArray[i][j].tileSprite.visible = true;

                    // 假如 tileValue = 2，则方块数值为 Math.pow(2,2) == 4, 4 的精灵索引为1，所以等于 tileValue - 1
                    this.tileArray[i][j].tileSprite.setFrame(this.tileArray[i][j].tileValue - 1);
                } else {
                    this.tileArray[i][j].tileSprite.alpha = 0;
                    this.tileArray[i][j].tileSprite.visible = false;
                }
            }
        }
    }



    // 布局
    layout() {

        // 头部
        this.layout_header();

        // 4 * 4 方块
        this.layout_body();
    }

    layout_header() {

        // 添加分数背景
        this.add.sprite(this.setPosition(0, COL) + 30, this.setPosition(0, ROW) - 100, 'score');

        // 添加最高分数背景
        this.add.sprite(this.setPosition(1, COL) + 40, this.setPosition(0, ROW) - 100, 'score_best');

        // 重新开始游戏
        let restartButton = this.add.sprite(this.setPosition(3, COL) - 10, this.setPosition(0, ROW) - 87, "restart");
        restartButton.setInteractive();
        restartButton.on("pointerdown", () => {
            this.scene.start("MainScene");
        })

        // 分数 
        this.scoreText = this.add.text(this.setPosition(0, COL) + 30, this.setPosition(0, ROW) - 90, '0', { fontFamily: 'Arial', fontSize: 22, fill: '#ffffff' }).setOrigin(.5);

        // 最高分数
        this.bestScoreText = this.add.text(this.setPosition(1, COL) + 40, this.setPosition(0, ROW) - 90, this.bestScore, { fontFamily: 'Arial', fontSize: 22, fill: '#ffffff' }).setOrigin(.5);
    }

    layout_body() {
        this.tileGroup = this.add.group();

        for (let i = 0; i < 4; i++) {
            this.tileArray[i] = [];
            for (let j = 0; j < 4; j++) {
                this.add.sprite(
                    this.setPosition(j, COL),
                    this.setPosition(i, ROW),
                    'tile_default');

                let tile = this.add.sprite(
                    this.setPosition(j, COL),
                    this.setPosition(i, ROW),
                    'tiles'
                );

                tile.alpha = 0;
                tile.visible = false;

                this.tileArray[i][j] = {
                    tileValue: 0,
                    tileSprite: tile,
                    canUpgrade: true
                }

                this.tileGroup.add(tile);
            }
        }
    }

    setPosition(pos, direction) {
        let top = direction === ROW ? 100 : 0;
        return pos * (TILE_SIZE + TILE_SPACING) + TILE_SIZE * .5 + TILE_SPACING + top;
    }

    addTile() {
        let emptyTiles = [];
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.tileArray[i][j].tileValue === 0) {
                    emptyTiles.push({
                        row: i,
                        col: j
                    })
                }
            }
        }

        if (emptyTiles.length > 0) {
            let chosenTile = Phaser.Utils.Array.GetRandom(emptyTiles);
            this.tileArray[chosenTile.row][chosenTile.col].tileValue = 1;
            this.tileArray[chosenTile.row][chosenTile.col].tileSprite.visible = true;
            this.tileArray[chosenTile.row][chosenTile.col].tileSprite.setFrame(0);

            this.tweens.add({
                targets: [this.tileArray[chosenTile.row][chosenTile.col].tileSprite],
                alpha: 1,
                duration: TWEEN_DURATION,
                onComplete: () => {
                    this.canMove = true;
                }
            });
        }
    }

    isInsideBoard(row, col) {
        return (row >= 0) && (col >= 0) && (row < 4) && (col < 4);
    }


}

export default MainScene
