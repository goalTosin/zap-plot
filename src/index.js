class App {
  constructor(canvas) {
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
    this.tileSize = 50;
    this.tilesX = Math.floor(this.width / this.tileSize);
    this.tilesY = Math.floor(this.height / this.tileSize);
    this.player = {
      x: this.width / 2,
      y: this.tileSize / 2,
      size: 30,
      angle: 0,
      locked: false
    };
    this.point = {
      x: Math.floor(Math.random() * this.tilesX) * this.tileSize + this.tileSize / 2,
      y: Math.floor(Math.random() * this.tilesY) * this.tileSize + this.tileSize / 2,
      size: 10,
    };
    this.lasers = [new Laser()];
    this.laserLimit = 10
    this.latestLaserIdx = 0;
    this.mirrors = [
      { x: 300, y: 200, width: 50, height: 10, angle: deg2Rad(60) },
      { x: 500, y: 300, width: 50, height: 10, angle: deg2Rad(-45) },
      {
        x: Math.floor(Math.random() * this.tilesX) * this.tileSize,
        y: Math.floor(Math.random() * this.tilesY) * this.tileSize,
        width: 50,
        height: 10,
        angle: deg2Rad(-45),
      },
    ];
    // console.log(this.tilesX);
    for (let i = 0; i < this.tilesY + 1; i++) {
      for (let j = 0; j < this.tilesX + 1; j++) {
        if (Math.round(Math.random() * 10) !== 0) {
          continue;
        }
        // const element = array[j];
        this.mirrors.push({
          x: j * this.tileSize,
          y: i * this.tileSize,
          width: 50,
          height: 10,
          angle: deg2Rad(Math.random() * 180),
        });
        // console.log('d');
      }
      // this.mirrors.push({
      //   x: Math.floor(Math.random() * this.tilesX) * this.tileSize,
      //   y: Math.floor(Math.random() * this.tilesY) * this.tileSize,
      //   width: 50,
      //   height: 10,
      //   angle: deg2Rad(Math.random() * 180),
      // });
    }
    this.steelWalls = [{ x: 200, y: 400, width: 50, height: 10 }];
    this.gameStartTime = Date.now();
    this.init();
  }

  init() {
    this.canvas.addEventListener("mousemove", this.handleMouseMove.bind(this));
    this.canvas.addEventListener("mousedown", this.handleLaserCreation.bind(this));
    this.canvas.addEventListener("mouseup", this.handleLaserCreation.bind(this));
    // setTimeout(this.laser.release.bind(this.laser), 1000)
    requestAnimationFrame(this.update.bind(this));
  }

  handleMouseMove(event) {
    if (!this.player.locked) {
      
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
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
      this.player.locked = true
    } else {
      this.lasers[this.latestLaserIdx].release();
      this.latestLaserIdx++;
      this.player.locked = false
    }
  }

  update() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.drawTiles();
    this.drawPlayer();
    this.drawPoint();
    this.drawMirrors();
    this.drawSteelWalls();
    this.updateLaserMirrorBounce();
    this.lasers.forEach((laser) => laser.render(this.ctx));
    requestAnimationFrame(this.update.bind(this));
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
    this.ctx.font = `${this.player.size}px Arial`;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText("😃", 0, 0);

    this.ctx.restore();
  }

  drawPoint() {
    this.ctx.fillStyle = "red";
    this.ctx.beginPath();
    this.ctx.arc(this.point.x, this.point.y, this.point.size, 0, Math.PI * 2);
    this.ctx.fill();
  }

  drawMirrors() {
    this.ctx.fillStyle = "silver";
    this.mirrors.forEach((mirror) => {
      this.ctx.save();
      this.ctx.translate(mirror.x, mirror.y);
      this.ctx.rotate(mirror.angle);
      this.ctx.fillRect(
        -mirror.width / 2,
        -mirror.height / 2,
        mirror.width,
        mirror.height
      );
      this.ctx.restore();
    });
  }

  drawSteelWalls() {
    this.ctx.fillStyle = "gray";
    this.steelWalls.forEach((wall) => {
      this.ctx.fillRect(
        wall.x - wall.width / 2,
        wall.y - wall.height / 2,
        wall.width,
        wall.height
      );
    });
  }

  // updateLaser() {
  //   const speed = 5;

  //   if (this.checkCollision(this.laser, this.point)) {
  //     alert("You Win!");
  //     this.resetGame();
  //   }
  //   let collisionMirror = this.checkMirrorCollision(this.laser);
  //   if (collisionMirror) {
  //     this.laser.points.push({
  //       x: this.laser.x,
  //       y: this.laser.y,
  //       moving: false,
  //     });
  //     // this.laser.moving = false
  //     this.laser.angle = this.reflectAngle(this.laser.angle, collisionMirror.angle);
  //   }

  //   if (this.checkSteelWallCollision(this.laser)) {
  //     alert("You Lose!");
  //     this.resetGame();
  //   }
  // }

  checkCollision(laser, point) {
    const dx = laser.x - point.x;
    const dy = laser.y - point.y;
    return Math.sqrt(dx * dx + dy * dy) < point.size;
  }

  getLaserMirrorCollision(laser) {
    return this.mirrors.find((mirror) => {
      return isPointInPolygon(
        box2points(mirror.x, mirror.y, mirror.width, mirror.height, mirror.angle),
        { x: laser.x, y: laser.y }
      );
    });
  }

  checkSteelWallCollision(laser) {
    return this.steelWalls.some((wall) => {
      const dx = laser.x - wall.x;
      const dy = laser.y - wall.y;
      return Math.abs(dx) <= wall.width / 2 && Math.abs(dy) <= wall.height / 2;
    });
  }

  updateLaserMirrorBounce() {
    // if (Date.now() - this.gameStartTime >= 1000) {
    //   this.laser.bounce(deg2Rad(-45))
    // }
    this.lasers.forEach(laser => {
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
            width: mirror.width,
            height: mirror.height,
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
          laser.points[0].moving = true;
        }
      }
      })
  }

  reflectAngle(reflectAngle, baseAngle) {
    return baseAngle * 2 + Math.PI - reflectAngle;
    // return reflectAngle + Math.PI - 2 * baseAngle + Math.PI;
  }

}

class Laser {
  hold(startPoint = { x: 0, y: 0 }, angle = deg2Rad(-45)) {
    this.x = startPoint.x;
    this.y = startPoint.y;
    this.points = [{ ...startPoint, moving: false, angle }];
    this.laserStarted = true;
    this.angle = angle;
    this.speed = 5;
  }
  release() {
    this.points[0].moving = true;
    this.released = true;
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

  renderLaser(ctx) {
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
    ctx.strokeStyle = "red";
    ctx.stroke();
    ctx.restore();
  }
  bounce(angle) {
    this.points.push({ angle: angle, moving: false, x: this.x, y: this.y });
    this.angle = angle;
  }
}

const canvas = document.getElementById("gameCanvas");
const game = new App(canvas);
