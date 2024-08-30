 
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

  
  constructor(cubeTexture,cubeTypeName,cubeShape, id) {
    window.scene.easyInitializeTextureCubeType(cubeTexture, cubeTypeName);
    this.cubeShape = cubeShape;
    this.id = id;
    this.originX = -20;
    this.originY = -20;
    this.originZ = -20;
    this.stillAliveVar=true;
    this.cubeTypeName = cubeTypeName;
  }

  // Put the ship down on the board
  placeDown(xCoord,yCoord,zCoord) {
    if (this.checkIfPlacementWithinBounds(xCoord,yCoord,zCoord))
    {
      this.originX = xCoord;
      this.originY = yCoord;
      this.originZ = zCoord;
      for (let i = 0; i< this.cubeShape.length; i++) {
        window.scene.addCubeToScene(this.cubeTypeName, id+i, xCoord + this.cubeShape[i][0], yCoord+ this.cubeShape[i][1], zCoord+this.cubeShape[i][2]);
      }
    }
      
  }
  checkIfPlacementWithinBounds(xCoord,yCoord,zCoord) {
    let cubeLen = this.cubeShape.length;
    let isWithinBounds = true;
    for (let i = 0; i<cubeLen; i++)
      {
        if ((xCoord+this.cubeShape[i][0] < -4) ||  (xCoord+this.cubeShape[i][0] > 5) ||  (yCoord+this.cubeShape[i][1] < -4) || (yCoord+this.cubeShape[i][1] >5) ||  (zCoord+this.cubeShape[i][2] < -4) || (zCoord+this.cubeShape[i][2] >5))
         isWithinBounds = false;
      }
    return isWithinBounds;
  }
  getID() {return id;}

  // return the id of the hit cube, null otherwise
  checkIfHit(xCoord,yCoord,zCoord) {
    for (let i = 0; i<this.cubeShape.length; i++){
      if ((xCoord == originX+this.cubeShape[i][0]) && (yCoord == originY+this.cubeShape[i][1]) && (zCoord == originZ+this.cubeShape[i][2]))
      {return id.toString()+i;}
    }
    return null;
  }
  move(xShift,yShift,zShift) {
    if (checkIfPlacementWithinBounds(this.originX+xShift,this.originY+yShift,this.originZ+zShift))
    {
      for (let i = 0; i<this.cubeShape.length;i++) {
        window.scene.changePositionOfCube(id.toString()+i,this.originX+xShift+this.cubeShape[i][0],this.originY+yShift+this.cubeShape[i][1],this.originZ+zShift+this.cubeShape[i][2]);
      }
return true;
    }
    return false;
  }
  getOrigin() {return [this.originX,this.originY,this.originZ];}
  getTexture() {return this.texture;}
  onEndOfTurn() {}
  onBump() {}
  onTelefrag() {}
  onBeingHit() {}

  onAllHit() { stillAliveVar = false;}
  
  onLevelReset() {
    stillAliveVar=true;
  }

  stillAlive() {return stillAliveVar;}
  

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
}//ship

class ShipHandler {
  constructor() {
  }

  //placeholder for now
  createRandomizedShip() {
    return new Ship("redPattern.png","testShip",[[0,0,0],[0,0,1],[1,0,0]], "testShipOne");
  }
}//shiphandler

window.shipHandler = new ShipHandler();
