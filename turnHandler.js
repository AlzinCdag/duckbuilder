
// start match
// load the list of all ships
// Click to expand each ship's GUI
// Select each ship to place
// Limit this to once per turn
// Send ship actions from GUI back to ship
// button to end turn and activate all this
// track all ships' survival
// end match
// select ship to add to the next match

class TurnHandler {
  
  constructor() {

    this.listOfShips1 = [];
    this.listOfShips2 = [];
  }
  

  startTurn() {}

  // return 0 if nobody has won yet
  // return 1 if side 1 has won
  // return 2 if side 2 has won or something has gone horribly wrong
  checkWin() {
    let matchOver = 0;
    let side1IsAlive = false;
    for (let i =0; i<listOfShips1; i++)
    {
      if (listOfShips1[i].stillAlive()) {
        side1IsAlive = true;
      }
    }
        let side2IsAlive = false;
    for (let i =0; i<listOfShips2; i++)
    {
      if (listOfShips2[i].stillAlive()) {
        side2IsAlive = true;
      }
    }
    if (side1IsAlive && side2IsAlive) 
    {return 0;}
    else if (side1IsAlive && !side2IsAlive) {
      return 1;
    }
    else {return 2;}
  }
  
  endTurn() {}

   selectShipSide1() {
    let select = document.getElementById("select");
    select.style.display = "block";
    let option1 = document.createElement("button");
    let option2 = document.createElement("button");
     option1.style.margin = "25";
    option1.innerHTML = "Option 1";
    option2.innerHTML = "Option 2";
    option1.onclick= function() {
      const test1 = window.shipHandler.createRandomizedShip();
  listOfShips1.push(test1);
  select.style.display="none";};

  select.innerHTML = "";
  select.appendChild(option1);
  select.appendChild(option2);
    
  }
}

window.turnHandler = new TurnHandler();
