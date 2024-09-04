class Card {

  var title;
  var description;
  
  constructor() {}

  onActivation() {}
  onDraw() {}
  onEndTurnInHand() {}
  printCard() {}
}

class BasicShot extends Card {
  title = "Basic Shot";
  description= "+ 7-shot";
  onActivation() {
    window.currentShip = new Ship();
    
  }
  
}

class CardHandler {
  constructor() {
   let b = new BasicShot();
    let c = new BasicShot();
    
    this.fullDeck = { b,c
      
    }
  }
  addCardToDeck(card) {
    this.
  }
}
