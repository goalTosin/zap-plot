const me = makeElt
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
      x: (this.tilesX * this.tileSize) / 2,
      y: this.tileSize,
      size: 30,
      angle: 0,
      locked: false,
      sprite: new Sprite(
        "data:image/webp;base64,UklGRpQFAABXRUJQVlA4WAoAAAAwAAAAIgAAIgAASUNDUMgBAAAAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADZBTFBIKAEAAA2QY9u2aVvz2bZtswK2bdu2bYU2MvtHP7Rt2z8yz9nrlSAiJgA8FRz11N88vPAUzC0SgjQAKOnafd9dOMnEuUsL/9fxiZdt3OAl2e8CnnatUrEvudnMg6HbWPEBl+BaMFVaOtH7P98UsO55OvIv9XGwH1489Y9hUE5kfQfgYEpi6zALoBm01b0/oO1AZGK0h0RQxy/Ai8xnV9CJTF5JHfRGSsdAWe4YyH+WpvvyXp7u7RNVEbLbX8+5Un18gh1fqj1gPoFqCXh0yZfm4SUA9e00LQBw7mwaxdmLf6G4VJfdlyT883P0miSrn5H476WuJVbV4Lg+tinB4mcWOJ8oaA3ndzoXPO9X3O/04Hah8Sn4n659khhg+a9HBzOfwPbq3OYzG0EAN8ETVlA4IHYCAACQDQCdASojACMAPm0ukEWkIqGXHAcwQAbEtgBca0AwU7QQYDbAeYDznedV6xr0JelA/bD0jLuVo44/n9szNLn1s3f0n7A/6vdXb9biZS/2aRYNBw7/6NcjyVaicEZ6sGYiuXkLArNbG/ysUYW30vJ+ZZg/qgAA/v5JtutaGxlzxDm6KL96f0x1/cN5bbpBXRwp+P8bTDB5M91bTboT8DftdQmXF4Afb0Fri5WWZHE6n0CXTCfq0vp2Fu0FPxhiS/zZXTRGvXU+iDdkop1odFxBfWjdezjxP/ifKg57/ErAH+TZgcbYOjdOOLh3jDwA7PkixJGcqx8PXqd2OrSldEmiv3WVXkpjV6+FRsWnMEWby+/G7cGXfW+CHZoiDdDqnXJg0bbXbcatqqYKywuqDMoa/H46//eurAAcaCLS7E0/IwH5y/1kwDyMWpojk5onOhEH+Ll3Bn5GXb4zxp+sKK2DGr2tWnFlVM3la7ZpUfeFpW1ovw7Da8u31ruvX+fP11FEd71SX2xVluiT28Pof8JMTg10Ms/+mp2KEY5L9Cw3a8Ah7T8GinpWWyH8kyZopwBWd/WiMyf7vFzv10j6UCUVKq2mA22zqE8d3jv/GQkoImVtK6INcpy911zI2c0A8Yptf+jvcCBGE2P/eGREpn4OngtPMtkZXupo9LsaOIL0QBKyl2L/kdJv68quuWXzR8xg6/+HE5/Sg7U5PbZ6/soYROC5RvdwDwHN9vjWGYQSu48Jf6bvTa5+9fQev/3zbaKTli4tFAGwwYzC1s+wKgT4SODCYUqEnsWsPBO/pgi2Jp4lyZGAp2mcZnqnFoxkc8CTDBxAAAA="
      ),
    };
    this.winPoint = {
      x: NaN,
      y: NaN,
      radius: 10,
    };

    // this.winPoint = {
    //   x: 15 * this.tileSize,
    //   y: 3 * this.tileSize,
    //   radius: 10,
    // };
    this.lasers = [new Laser()];
    this.laserLimit = 10;
    this.latestLaserIdx = 0;
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
    this.gameStartTime = Date.now();
    this.mirrorHeight = 10;
    this.mirrorWidth = 50;
    // this.init();
  }

  init() {
    this.inited = true;
    this.canvas.addEventListener("mousemove", this.handleMouseMove.bind(this));
    this.canvas.addEventListener("touchmove", this.handleTouchMove.bind(this));
    this.canvas.addEventListener("mousedown", this.handleLaserCreation.bind(this));
    this.canvas.addEventListener("touchstart", this.handleLaserCreation.bind(this));
    this.canvas.addEventListener("mouseup", this.handleLaserCreation.bind(this));
    this.canvas.addEventListener("touchend", this.handleLaserCreation.bind(this));
    this.canvas.addEventListener("touchcancel", this.handleLaserCreation.bind(this));
    // setTimeout(this.laser.release.bind(this.laser), 1000)
    requestAnimationFrame(this.update.bind(this));
  }

  handleTouchMove(e) {
    this.handleMouseMove(e.changedTouches[0])
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
    let delL =[]
    for (let i = 0; i < this.lasers.length; i++) {
      const laser = this.lasers[i];
      if (!laser) {
        continue
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
          createWindow("You win!!!", str2elt(me('div', [me('p', 'Congrats, you won!!'), me('p', 'Now, you can move to the next level...Sorry, not available')])));
          delL.push(i)
          // this.isWon = true;
          // setTimeout((() => (this.isWon = false)).bind(this), 3000);
        }
      }
    }
    this.deleteLasers(delL)
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
  }

  drawMirrors() {
    this.ctx.fillStyle = "silver";
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
