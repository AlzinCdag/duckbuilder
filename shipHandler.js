
// Each of the battleship types should extend this class.
// Each battleship should have the following parameters intrinsically:
//   A unique ship ID;
//   A unique cube texture;
//   A shape, stored as a list of cube coordinates relative to an origin;
//   An HTML graphical user interface displaying the things below;
//   An event to trigger on the placement of the ship on the field; (e.g., set to move in one of the cardinal directions)
//   An event to trigger at the end of your turn, possibly modified by you on aforementioned GUI: (e.g. move in said direction, rotate);
//   An event to trigger on bumping into an enemy ship (e.g., explode, stop moving)
//   An event to trigger on being placed in the same space as an enemy ship (e.g., return to your hand, explode)
//   A missile type to send when you use it (see MissileHandler.js)
//   An event to trigger on being hit by a missile (e.g. deactivate all moving and such, revenge hit)
//   An event to trigger on having all its cells be hit by a missile (e.g. explode)
class Ship {
  const id;
  const cubeTexture;
  var originX;
  var originY;
  var originZ;
  
  constructor(cubeTexture,cubeTypeName,cubeShape, id) {
    window.scene.easyInitializeTextureCubeType(cubeTexture, cubeTypeName);
    this.cubeShape = cubeShape;
    this.id = id;
  }

  // Put the ship down on the board
  placeDown(xCoord,yCoord,zCoord) {
    if (checkIfPlacementWithinBounds(xCoord,yCoord,zCoord))
    {
      originX = xCoord;
      originY = yCoord;
      originZ = zCoord;
      for (let i = 0; i< cubeShape.length; i++) {
        window.scene.addCubeToScene(cubeTypeName, id+i, xCoord + cubeShape[i][0], yCoord+ cubeShape[i][1], zCoord+cubeShape[i][2]);
      }
    }
      
  }
  checkIfPlacementWithinBounds(xCoord,yCoord,zCoord) {
    let cubeLen = cubeShape.length;
    let isWithinBounds = true;
    for (let i = 0; i<cubeLen; i++)
      {
        if xCoord+cubeShape[i][0] < -4 ||  xCoord+cubeShape[i][0] > 5 ||  yCoord+cubeShape[i][1] < -4 || yCoord+cubeShape[i][1] >5 ||  zCoord+cubeShape[i][2] < -4 || zCoord+cubeShape[i][2] >5
         isWithinBounds = false;
      }
    return isWithinBounds;
  }
  getID() {return id;}

  // return the id of the hit cube, null otherwise
  checkIfHit(xCoord,yCoord,zCoord) {
    for (let i = 0; i<cubeShape.length; i++){
      if ((xCoord == originX+cubeShape[i][0]) && (yCoord == originY+cubeShape[i][1]) && (zCoord == originZ+cubeShape[i][2]))
      {return id.toString()+i;}
    }
    return null;
  }
  move(xShift,yShift,zShift) {
    if (checkIfPlacementWithinBounds(originX+xShift,originY+yShift,originZ+zShift))
    {
      for (let i = 0; i<cubeShape.length,i++) {
        window.scene.changePositionOfCube(id.toString()+i,originX+xShift+cubeShape[i][0],originY+yShift+cubeShape[i][1],originZ+zShift+cubeShape[i][2]);
      }
return true;
    }
    return false;
  }
  getOrigin() {return [originX,originY,originZ];}
  getTexture() {return texture;}
  onEndOfTurn() {}
  onBump() {}
  onTelefrag() {}
  onBeingHit() {}
  onAllHit() {}
  onLevelReset() {}
  

  // The following are placeholders to be used in the GUI for certain elements

  guiSetPlusX(xUpBool) {}
  guiSetMinusX(xDnBool) {}
  guiSetPlusY(yUpBool) {}
  guiSetMinusY(yDnBool) {}
  guiSetPlusZ(zUpBool) {}
  guiSetMinusZ(zDnBool) {}
  guiSetInteger(guiInt) {}
  
  //finalize changes set in gui
  guiExecute() {}

  // preview the change
  onGuiModification() {}

  //
}
