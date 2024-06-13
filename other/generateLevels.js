function generateLevel(
  tileSize,
  tilesX,
  tilesY,
  laserStartX,
  laserStartY,
  rightMirrorCount,
  wrongMirrorCount
) {
  // generate a random winpoint
  const winPoint = genRandWinpoint(tileSize, tilesX, tilesY);
  // instanciate mirrors
  const mirrors = [];
  // generate mirrors that direct point the laser at the right point
  mirrors.push(
    ...genMirrors(
      tileSize,
      tilesX,
      tilesY,
      laserStartX,
      laserStartY,
      100,
      winPoint
    )
  );
  // generate mirrors that confuse the player and doesn't direct the laser up at the right point
  // const wrongWinPoint = {
  //   x: Math.random())
  // }
  // mirrors.push(...genRandWinpoint())
  return { winPoint, mirrors };
}

function genRandWinpoint(tileSize, tilesX, tilesY) {
  const randP = (t) => tileSize + Math.floor(Math.random() * (t - 1)) * tileSize;
  return {
    x: randP(tilesX),
    y: randP(tilesY),
    radius: 10,
  };
}

function genMirrors(tileSize, tilesX, tilesY, x = NaN, y = NaN, mirrors = -1, winPoint) {
  const ms = [];
  for (let i = 0; i < mirrors; i++) {
    ms.push({
      x: Math.floor(Math.random() * tilesX) * tileSize,
      y: Math.floor(Math.random() * tilesY) * tileSize,
      angle: Math.random() * Math.PI
    });
  }
  return ms;
}
function reflectAngle(reflectAngle, baseAngle) {
  return baseAngle * 2 + Math.PI - reflectAngle;
  // return reflectAngle + Math.PI - 2 * baseAngle + Math.PI;
}
