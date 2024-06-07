const me = makeElt; //The available modes are:To to anything, you must be in a mode.
function showInstructions() {
  const instructions = str2elt(
    me("div", [
      me("p", "To create any object, an edit mode must be set."),
      me("p", "The available edit modes are:"),
      me("ul", [
        me("li", "Create Mirror"),
        me("li", "Delete Mirror"),
        me("li", "Change winning point"),
      ]),
      me(
        "p",
        "The last mode is Play, however, this mode is only made to play the game with the newly made environment, not to edit game environment"
      ),
      me("p", "The default mode is Play"),
      me("p", "To navigate through modes, press its corresonding key as shown below:"),
      me("ul", [
        me("li", "Play: P"),
        me("li", "Create Mirror: M"),
        me("li", "Delete Mirror: U"),
        me("li", "Move Winning Point: W"),
        me("li", "No mode: Escape"),
      ]),
    ])
  );
  createWindow("Instructions", instructions);
}
showInstructions();

function showDoneMenu() {
  const donwMenu = str2elt(
    me("div", [
      me("p", "This is the level data:"),
      me("textarea",  game.compileLevelData() ),
      me("button", 'Copy', { value: 'game.copyLevelData()' }),
      me("button", 'Copy', { value: 'game.copyLevelData()' }),
    ])
  );
  createWindow("Level Data", donwMenu);
}

let mode = {
  play: true,
  createMirror: false,
  deleteMirror: false,
  moveWinPoint: false,
};
// createWindow('Welcome')
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
      locked: false,
      sprite: new Sprite("../images/happy.webp"),
    };
    this.winPoint = {
      x: NaN,
      y: NaN,
      radius: 10,
    };
    this.lasers = [new Laser()];
    this.laserLimit = 10;
    this.latestLaserIdx = 0;
    this.mirrors = [];
    this.creationMirror = null;
    this.futureWinPoint = null;
    this.keysDown = {};
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
    this.gameStartTime = Date.now();
    this.mirrorHeight = 10;
    this.mirrorWidth = 50;
    this.init();
  }

  mode2none() {
    Object.keys(mode).forEach((m) => {
      mode[m] = false;
    });
  }

  handleModeChange(e) {
    let modeTamper = true;
    switch (e.key) {
      case "p":
        this.mode2none();
        mode.play = true;
        break;
      case "m":
        this.mode2none();
        mode.createMirror = true;
        break;
      case "u":
        this.mode2none();
        mode.deleteMirror = true;
        break;
      case "w":
        this.mode2none();
        mode.moveWinPoint = true;
        break;
      case "Escape":
        this.mode2none();
        break;
      default:
        modeTamper = false;
        break;
    }
    if (modeTamper) {
      this.creationMirror = null;
    }
  }

  keyed(e) {
    this.keysDown[e.key] = e.type === "keydown";
    // console.log(e);
    // console.log(this.keysDown);
  }

  init() {
    addEventListener("mousemove", this.handleMouseMove.bind(this));
    addEventListener("mousedown", this.handleLaserCreation.bind(this));
    addEventListener("mouseup", this.handleLaserCreation.bind(this));
    addEventListener("click", this.handleClick.bind(this));
    addEventListener("keydown", this.handleModeChange.bind(this));
    addEventListener("keydown", this.keyed.bind(this));
    addEventListener("keyup", this.keyed.bind(this));
    // setTimeout(this.laser.release.bind(this.laser), 1000)
    requestAnimationFrame(this.update.bind(this));
  }

  handleMouseMove(event) {
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    if (!this.player.locked) {
      this.player.angle = Math.atan2(mouseY - this.player.y, mouseX - this.player.x);
    }
    if (mode.createMirror) {
      this.updateTempMirror(mouseX, mouseY);
    } else if (mode.deleteMirror) {
      this.updateTempMirrorDeletion(mouseX, mouseY);
    } else if (mode.moveWinPoint) {
      this.updateTempWinPoint(mouseX, mouseY);
    }
  }
  updateTempWinPoint(x, y) {
    let tx = Math.round(x / this.tileSize) * this.tileSize;
    let ty = Math.round(y / this.tileSize) * this.tileSize;
    this.futureWinPoint = { x: tx, y: ty };
  }

  adiquifyLasers() {
    if (this.lasers[this.latestLaserIdx] == null) {
      this.lasers[this.latestLaserIdx] = new Laser();
    }
  }
  updateTempMirrorDeletion(x, y) {
    let tx = Math.round(x / this.tileSize) * this.tileSize;
    let ty = Math.round(y / this.tileSize) * this.tileSize;
    for (let i = 0; i < this.mirrors.length; i++) {
      const m = this.mirrors[i];
      if (tx === m.x && ty === m.y) {
        m.mirrorToDel = true;
      } else {
        m.mirrorToDel = false;
      }
    }
  }

  updateTempMirror(x, y) {
    if (this.creationMirror === null) {
      this.creationMirror = {
        angle: 0,
      };
    }
    const angle = Math.atan2(y - this.creationMirror.y, x - this.creationMirror.x);
    if (this.creationMirror && !this.creationMirror.toBeRotated) {
      this.creationMirror.x = Math.round(x / this.tileSize) * this.tileSize;
      this.creationMirror.y = Math.round(y / this.tileSize) * this.tileSize;
      this.creationMirror.angle = Math.round(angle / (Math.PI / 2)) * (Math.PI / 2);
    }
    if (this.creationMirror.toBeRotated) {
      this.creationMirror.angle = this.keysDown.Control
        ? Math.round(angle / (Math.PI / 4)) * (Math.PI / 4)
        : angle;
    }
  }

  handleClick(event) {
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (mode.createMirror) {
      if (!this.creationMirror) {
        return;
      }
      if (!this.creationMirror.toBeRotated) {
        this.creationMirror.toBeRotated = true;

        console.debug("clicked once");
      } else {
        console.debug("clicked twice");
        this.mirrors.push(this.creationMirror);
        this.creationMirror = null;
      }
    } else if (mode.deleteMirror) {
      let tx = Math.round(x / this.tileSize) * this.tileSize;
      let ty = Math.round(y / this.tileSize) * this.tileSize;

      let mirrorToDel = this.mirrors.findIndex((m) => tx === m.x && ty === m.y);
      if (mirrorToDel !== -1) {
        this.mirrors.splice(mirrorToDel, 1);
      }
    } else if (mode.moveWinPoint) {
      this.winPoint.x = this.futureWinPoint.x;
      this.winPoint.y = this.futureWinPoint.y;
    }
  }

  handleLaserCreation(e) {
    if (mode.play) {
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
    for (let i = 0; i < this.lasers.length; i++) {
      const laser = this.lasers[i];
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
          createWindow("You win!!!");
        }
      }
    }
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
    this.ctx.fillStyle = "green";
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
    this.ctx.fillStyle = "red";
    this.ctx.beginPath();
    this.ctx.arc(this.winPoint.x, this.winPoint.y, this.winPoint.radius, 0, Math.PI * 2);
    this.ctx.fill();
    if (mode.moveWinPoint && this.futureWinPoint) {
      this.ctx.fillStyle = "#ff000080";
      this.ctx.beginPath();
      this.ctx.arc(
        this.futureWinPoint.x,
        this.futureWinPoint.y,
        this.winPoint.radius,
        0,
        Math.PI * 2
      );
      this.ctx.fill();
    }
  }

  drawMirrors() {
    const drawMirror = (mirror, opacity) => {
      this.ctx.save();
      this.ctx.translate(mirror.x, mirror.y);
      this.ctx.rotate(mirror.angle);
      if (mirror.mirrorToDel) {
        this.ctx.fillStyle = "#ff0000";
      } else this.ctx.fillStyle = "#c0c0c0" + (opacity ? opacity : "ff");
      // console.log(this.ctx.fillStyle);
      this.ctx.fillRect(
        -this.mirrorWidth / 2,
        -this.mirrorHeight / 2,
        this.mirrorWidth,
        this.mirrorHeight
      );
      this.ctx.restore();
    };
    // console.log(this.ctx.fillStyle);
    this.mirrors.forEach((m) => drawMirror(m));
    if (this.creationMirror) {
      drawMirror(this.creationMirror, !this.creationMirror.toBeRotated ? "80" : "f0");
    }
  }

  checkCollision(laser, point) {
    const dx = laser.x - point.x;
    const dy = laser.y - point.y;
    return Math.sqrt(dx * dx + dy * dy) < point.size;
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
  compileLevelData() {
    return JSON.stringify({
      mirrors: this.mirrors.map(m => {
        delete m.toBeRotated
        delete m.mirrorToDel
        return m
      }),
      winPoint: this.winPoint,
    });
  }

  copyLevelData() {
    navigator.clipboard.writeText(this.compileLevelData())
    console.log('copied!');
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
    ctx.strokeStyle = "green";
    ctx.lineWidth = 2;
    ctx.lineJoin = "bevel";
    ctx.stroke();
    ctx.shadowColor = "green";
    ctx.shadowBlur = 12;
    ctx.s;
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

const canvas = document.getElementById("gameCanvas");
const game = new App(canvas);
