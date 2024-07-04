
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
  var[] cubeShape;
  var originX;
  var originY;
  var originZ;
  
  constructor() {}

  // Put the ship down on the board
  placeDown(xCoord,yCoord,zCoord) {}
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
  move(xShift,yShift,zShift) {}
  getOrigin() {return [originX,originY,originZ];}
  getTexture() {return texture;}
  onEndOfTurn() {}
  onBump() {};
  onTelefrag() {};
  onBeingHit() {};
  onAllHit() {};
  

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
