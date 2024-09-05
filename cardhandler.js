class Card {
  
  constructor() {}

  onActivation() {}
  onDraw() {}
  onEndTurnInHand() {}
  printCard(div) {
    div.getElementsByClassName("cardTitle")[0].innerHTML = this.title;
    div.getElementsByClassName("cardInfo")[0].innerHTML = this.description;
    div.getElementsByClassName("topButton")[0].onclick = this.onActivation();
    
  }
}

class BasicShot extends Card {
  this.title = "Basic Shot";
  this.description= "+ 7-shot";
  onActivation() {
    window.shipHandler.createBasicShot();
  }
  
}

class CardHandler {
  constructor() {
   let b = new BasicShot();
    let c = new BasicShot();
    let d = new BasicShot();
    let e = new BasicShot();
    let f = new BasicShot();
    
    this.fullDeck = { b,c,d,e,f
      
    }
    this.drawPile = this.fullDeck;
    this.discardPile = new Array();
    this.currentHand = new Array();
    
  }
  addCardToDeck(card) {
    this.fullDeck.push(card);
  }
  drawFreshHand() {
    for (let i = 0; i<5; i++) {
    this.drawSingleCard();}
    
  }
  drawSingleCard() {
    if (this.currentHand.length < 10)
    {
      if(this.drawPile.length === 0) {
        this.shuffleDiscardPileIntoDrawPile();
      }
    this.currentHand.push(this.drawPile.pop());
    }
  }

  discardHand() {
    while (this.currentHand.length != 0) {
      this.discardPile.push(this.currentHand.pop());
    }
  }

  discardSingleCard(index) {
    this.discardPile.push(this.currentHand.splice(index,1));
  }

  shuffleDiscardPileIntoDrawPile() {
    while (this.discardPile.length != 0) {
      this.drawPile.push(this.discardPile.splice(Math.floor(Math.random()*this.discardPile.length),1));
    }
  }
  
}

window.cardHandler = new CardHandler();
