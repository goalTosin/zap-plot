class App {
  constructor(canvas) {
    this.initCanvas(canvas);
    this.startedGameLoop = false;
    this.gameStartTime = Date.now();
    this.init();
  }

  initMirrors() {
    // this.mirrors = [
    //   ...JSON.parse(
    //     '[{"x":300,"y":200,"angle":1.0471975511965976},{"x":500,"y":300,"angle":-0.7853981633974483},{"x":500,"y":350,"angle":-0.7853981633974483},{"x":0,"y":250,"angle":2.6216379752221353},{"x":600,"y":300,"angle":1.4190343904351879},{"x":0,"y":350,"angle":0.7487850303082835},{"x":150,"y":450,"angle":0.713105628539875},{"x":600,"y":500,"angle":1.6235140681879212},{"x":750,"y":500,"angle":0.4594571772192553},{"x":650,"y":550,"angle":0.25881054648883556}]'
    //   ),
    //   { x: 14 * this.tileSize, y: 3 * this.tileSize, angle: deg2Rad(90) },
    //   { x: 14 * this.tileSize, y: 4 * this.tileSize, angle: deg2Rad(90) },
    //   { x: 14 * this.tileSize, y: 5 * this.tileSize, angle: deg2Rad(-70) },
    //   { x: 15 * this.tileSize, y: 5 * this.tileSize, angle: deg2Rad(-70) },
    // ];
    this.mirrors = [];
    // this.mirrors = [
    //   { x: 300, y: 200, width: 50, height: 10, angle: deg2Rad(60) },
    //   { x: 500, y: 300, width: 50, height: 10, angle: deg2Rad(-45) },
    //   {
    //     x: Math.floor(Math.random() * this.tilesX) * this.tileSize,
    //     y: Math.floor(Math.random() * this.tilesY) * this.tileSize,
    //     width: 50,
    //     height: 10,
    //     angle: deg2Rad(-45),
    //   },
    // ];
    // console.log(this.tilesX);
    // for (let i = 0; i < this.tilesY + 1; i++) {
    //   for (let j = 0; j < this.tilesX + 1; j++) {
    //     if (Math.round(Math.random() * 10) !== 0) {
    //       continue;
    //     }
    //     // const element = array[j];
    //     this.mirrors.push({
    //       x: j * this.tileSize,
    //       y: i * this.tileSize,
    //       width: 50,
    //       height: 10,
    //       angle: deg2Rad(Math.random() * 180),
    //     });
    //     // console.log('d');
    //   }
    //   // this.mirrors.push({
    //   //   x: Math.floor(Math.random() * this.tilesX) * this.tileSize,
    //   //   y: Math.floor(Math.random() * this.tilesY) * this.tileSize,
    //   //   width: 50,
    //   //   height: 10,
    //   //   angle: deg2Rad(Math.random() * 180),
    //   // });
    // }
    this.mirrorHeight = 5;
    this.mirrorWidth = 50;
  }

  initLasers() {
    this.lasers = [new Laser()];
    this.laserLimit = 10;
    this.latestLaserIdx = 0;
  }

  initWinPoint() {
    this.winPoint = {
      x: NaN,
      y: NaN,
      radius: 10,
    };
    // console.log('iswon', this.isWon);

    this.isWon = false;
    // console.log('iswon', this.isWon);

    // this.winPoint = {
    //   x: 15 * this.tileSize,
    //   y: 3 * this.tileSize,
    //   radius: 10,
    // };
  }

  initPlayer() {
    this.player = {
      x: (this.tilesX * this.tileSize) / 2,
      y: this.tileSize,
      size: 30,
      angle: 0,
      locked: false,
      sprite: new Sprite(
        "data:image/png;base64,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"
      ),
    };
  }

  initTiles() {
    this.tileSize = 50;
    this.tilesX = Math.floor(this.width / this.tileSize);
    this.tilesY = Math.floor(this.height / this.tileSize);
  }

  initCanvas() {
    /**
     * @type {HTMLCanvasElement} canvas
     */
    this.canvas = canvas;
    /**
     * @type {CanvasRenderingContext2D} canvas
     */
    this.ctx = this.canvas.getContext("2d");
    this.width = canvas.width;
    this.height = canvas.height;
  }

  init() {
    this.initTiles();
    this.initPlayer();
    this.initWinPoint();
    this.initLasers();
    this.initMirrors();

    this.canvas.addEventListener("mousemove", this.handleMouseMove.bind(this));
    this.canvas.addEventListener("touchmove", this.handleTouchMove.bind(this));
    this.canvas.addEventListener("mousedown", this.handleLaserCreation.bind(this));
    this.canvas.addEventListener("touchstart", this.handleLaserCreation.bind(this));
    this.canvas.addEventListener("mouseup", this.handleLaserCreation.bind(this));
    this.canvas.addEventListener("touchend", this.handleLaserCreation.bind(this));
    this.canvas.addEventListener("touchcancel", this.handleLaserCreation.bind(this));
    // setTimeout(this.laser.release.bind(this.laser), 1000)
  }

  startGameLoop() {
    this.startedGameLoop = true;
    // console.log('startedGameLoop', this.startedGameLoop);
    requestAnimationFrame(this.update.bind(this));
  }

  handleTouchMove(e) {
    this.handleMouseMove(e.changedTouches[0]);
  }

  handleMouseMove(event) {
    if (!this.player.locked) {
      // const rect = this.canvas.getBoundingClientRect();
      const { x: mouseX, y: mouseY } = getMouseRelativeToCanvas(
        event.clientX,
        event.clientY,
        this.canvas
      ); // - rect.left;
      this.player.angle = Math.atan2(mouseY - this.player.y, mouseX - this.player.x);
    }
  }

  adiquifyLasers() {
    if (this.lasers[this.latestLaserIdx] == null) {
      this.lasers[this.latestLaserIdx] = new Laser();
    }
  }

  handleLaserCreation(e) {
    this.adiquifyLasers();
    if (e.type === "mousedown") {
      this.lasers[this.latestLaserIdx].hold(
        {
          x: this.player.x + Math.cos(this.player.angle) * this.player.size,
          y: this.player.y + Math.sin(this.player.angle) * this.player.size,
        },
        this.player.angle
      );
      this.player.locked = true;
    } else {
      this.lasers[this.latestLaserIdx].release();
      this.latestLaserIdx++;
      this.player.locked = false;
    }
  }

  update() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.drawTiles();
    this.drawPlayer();
    this.drawPoint();
    this.drawMirrors();
    this.updateLaserMirrorBounce();
    this.lasers.forEach((laser) => laser.render(this.ctx));
    this.deleteUnecessaryLasers();
    this.updateWinStatus();
    requestAnimationFrame(this.update.bind(this));
  }

  deleteUnecessaryLasers() {
    let uselessLasers = [];
    this.lasers.forEach((laser, i) => {
      if (this.isLaserOutOfSight(laser)) {
        uselessLasers.push(i);
      }
    });
    this.deleteLasers(uselessLasers);
  }

  deleteLasers(idxs) {
    idxs.forEach((idx) => {
      this.lasers.splice(idx, 1);
      this.latestLaserIdx -= 1;
    });
  }

  updateWinStatus() {
    if (this.isWon) {
      return;
    }
    let c = false;
    let delL = [];
    for (let i = 0; i < this.lasers.length; i++) {
      const laser = this.lasers[i];
      if (!laser) {
        continue;
      }
      if (laser.points) {
        let lastpoint = laser.points[laser.points.length - 1];
        if (
          lineCircIntersection(
            [
              { x: lastpoint.x, y: lastpoint.y },
              { x: laser.x, y: laser.y },
            ],
            { x: this.winPoint.x, y: this.winPoint.y, r: this.winPoint.radius }
          )
        ) {
          c = true;
          delL.push(i);
          // this.isWon = true;
          // setTimeout((() => (this.isWon = false)).bind(this), 3000);
        }
      }
    }
    if (c) {
      // console.log("played");
      // console.log(this.level);
      // console.log(this.level + 2);
      // document.getElementById('game-box').style.display = 'none'
      this.isWon = true;
      let isLastLevel = playLevel(this.level + 1);
      if (!isLastLevel) {
        createWindow(
          "You win!!!",
          str2elt(
            me("div", [
              me("p", "Congrats, you won!!"),
              me("p", "Now, you can move to the next level..."),
            ])
          )
        );
      }
    }
    this.deleteLasers(delL);
  }
  drawTiles() {
    this.ctx.strokeStyle = "white";
    for (let x = 0; x < this.tilesX; x++) {
      for (let y = 0; y < this.tilesY; y++) {
        this.ctx.strokeRect(
          x * this.tileSize,
          y * this.tileSize,
          this.tileSize,
          this.tileSize
        );
      }
    }
  }

  drawPlayer() {
    this.ctx.save();
    this.ctx.translate(this.player.x, this.player.y);
    this.ctx.rotate(this.player.angle + Math.PI / 2);
    this.ctx.beginPath();
    this.ctx.moveTo(0, -this.player.size);
    this.ctx.lineTo(7, 0);
    this.ctx.lineTo(-7, 0);
    this.ctx.closePath();
    this.ctx.fillStyle = "red";
    this.ctx.fill();
    if (this.player.sprite.loaded) {
      this.ctx.drawImage(
        this.player.sprite.img,
        -this.player.sprite.img.width / 2,
        -this.player.sprite.img.height / 2
      );
    } else {
      this.ctx.font = `${this.player.size}px Arial`;
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      this.ctx.fillText("😃", 0, 0);
    }

    this.ctx.restore();
  }

  drawPoint() {
    this.ctx.fillStyle = "green";
    this.ctx.beginPath();
    this.ctx.arc(this.winPoint.x, this.winPoint.y, this.winPoint.radius, 0, Math.PI * 2);
    this.ctx.fill();
  }

  drawMirrors() {
    this.ctx.fillStyle = "rgb(255, 168, 168)";
    this.mirrors.forEach((mirror) => {
      this.ctx.save();
      this.ctx.translate(mirror.x, mirror.y);
      this.ctx.rotate(mirror.angle);
      this.ctx.fillRect(
        -this.mirrorWidth / 2,
        -this.mirrorHeight / 2,
        this.mirrorWidth,
        this.mirrorHeight
      );
      this.ctx.restore();
    });
  }

  getLaserMirrorCollision(laser) {
    return this.mirrors.find((mirror) => {
      return isPointInPolygon(
        box2points(mirror.x, mirror.y, this.mirrorWidth, this.mirrorHeight, mirror.angle),
        { x: laser.x, y: laser.y }
      );
    });
  }

  updateLaserMirrorBounce() {
    // if (Date.now() - this.gameStartTime >= 1000) {
    //   this.laser.bounce(deg2Rad(-45))
    // }
    this.lasers.forEach((laser) => {
      let mirror = this.getLaserMirrorCollision(laser);
      if (mirror) {
        const intersectionData = getIntersectionData(
          [
            {
              x: laser.points[laser.points.length - 1].x,
              y: laser.points[laser.points.length - 1].y,
            },
            {
              x: laser.x,
              y: laser.y,
            },
          ],
          {
            x: mirror.x,
            y: mirror.y,
            r: mirror.angle,
            width: this.mirrorWidth,
            height: this.mirrorHeight,
          }
        );
        if (intersectionData) {
          laser.x = intersectionData.point.x;
          laser.y = intersectionData.point.y;
          laser.bounce(
            this.reflectAngle(
              Math.atan2(
                laser.points[laser.points.length - 1].y - laser.y,
                laser.points[laser.points.length - 1].x - laser.x
              ),
              intersectionData.faceAngle
              // mirror.angle
            )
          );
        }
      }
      if (laser.released) {
        let mirror = this.getLaserMirrorCollision(laser.points[0]);
        if (mirror) {
          laser.points.shift();
          if (laser.points && laser.points[0]) {
            laser.points[0].moving = true;
          }
        }
      }
    });
  }

  reflectAngle(reflectAngle, baseAngle) {
    return baseAngle * 2 + Math.PI - reflectAngle;
    // return reflectAngle + Math.PI - 2 * baseAngle + Math.PI;
  }

  isLaserOutOfSight(laser = this.lasers[0]) {
    if (laser.points) {
      return laser.points.every((p) => {
        return p.x < 0 || p.x > this.canvas.width || p.y < 0 || p.y > this.canvas.height;
      });
    }
  }

  loadLevelJson(
    json = {
      mirrors: [{ angle: 0.3142318990843383, "x": 400, "y": 250 }],
      winPoint: { x: 500, y: 100, radius: 10 },
    }
  ) {
    this.winPoint = json.winPoint;
    this.mirrors = json.mirrors;
  }
  compileLevelData() {
    return JSON.stringify({
      mirrors: this.mirrors.map((m) => {
        delete m.toBeRotated;
        delete m.mirrorToDel;
        return m;
      }),
      winPoint: this.winPoint,
    });
  }

  copyLevelData() {
    navigator.clipboard.writeText(this.compileLevelData());
    console.debug("copied!");
  }
}

class Laser {
  hold(startPoint = { x: 0, y: 0 }, angle = deg2Rad(-45)) {
    if (!this.laserStarted) {
      this.x = startPoint.x;
      this.y = startPoint.y;
      this.points = [{ ...startPoint, moving: false, angle }];
      this.laserStarted = true;
      this.angle = angle;
      this.speed = 5;
    }
  }
  release() {
    if (this.laserStarted) {
      this.points[0].moving = true;
      this.released = true;
    }
  }
  render(ctx) {
    if (this.laserStarted) {
      this.directLaser();
      this.renderLaser(ctx);
    }
  }
  directLaser() {
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;
  }
  directPoint(p) {
    p.x += Math.cos(p.angle) * this.speed * p.moving;
    p.y += Math.sin(p.angle) * this.speed * p.moving;
  }
  /**
   *
   * @param {CanvasRenderingContext2D} ctx
   */
  renderLaser(ctx) {
    if (!this.points[0]) return;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(this.points[0].x, this.points[0].y);
    this.directPoint(this.points[0]);
    for (let i = 1; i < this.points.length; i++) {
      const p = this.points[i];
      ctx.lineTo(p.x, p.y);
      this.directPoint(p);
    }
    ctx.lineTo(this.x, this.y);
    // ctx.strokeStyle = "transparent";
    ctx.strokeStyle = "#ff000080";
    ctx.lineJoin = 'bevel'
    ctx.lineWidth = 5;
    // ctx.strokeStyle = "#800080";
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
    ctx.shadowBlur = 10;
    ctx.shadowColor = "red";
    ctx.stroke();

    // ctx.stroke();
    // ctx.fill();

    ctx.lineWidth = 1;
    ctx.lineJoin = "bevel";
    ctx.strokeStyle = "white";
    ctx.stroke();

    ctx.restore();
  }
  bounce(angle) {
    this.points.push({ angle: angle, moving: false, x: this.x, y: this.y });
    this.angle = angle;
  }
}

class Sprite {
  constructor(imgsrc, anonymousCrossorigin) {
    this.img = new Image();
    this.img.src = imgsrc;
    if (anonymousCrossorigin == null || anonymousCrossorigin === true) {
      this.img.crossOrigin = "anonymous";
    }
    this.img.onload = (() => {
      this.loaded = true;
    }).bind(this);
  }
}
