class Card {
  
  constructor() {}

  onActivation() {}
  onDraw() {}
  onEndTurnInHand() {}
  printCard(div) {
    div.getElementsByClassName("cardTitle")[0].innerHTML = this.title;
    div.getElementsByClassName("cardInfo")[0].innerHTML = this.description;
    div.getElementsByClassName("topButton")[0].onclick = ()=>{this.onActivation();};
  }
  discardThis() {
    if (window.cardHandler.currentHand.includes(this)) {
    window.cardHandler.currentHand.splice(window.cardHandler.currentHand.indexOf(this),1);
    window.cardHandler.discardPile.push(this);
    //window.updateCardsShown();
    window.cardsNumber = window.cardsNumber -1;
          if (window.cardHandler.drawPile.length === 0) {
      window.cardHandler.shuffleDiscardPileIntoDrawPile();
    }
    }
  }
}

class BasicShot extends Card {
 
  constructor() {
    super();
    this.title = "Basic Shot";
    this.description= "+ 7-shot";

                }
  onActivation() {
    window.shipHandler.createBasicShot();
    this.discardThis();
  }
  
}

class CardHandler {
  constructor() {
   let b = new BasicShot();
    let c = new BasicShot();
    let d = new BasicShot();
    let e = new BasicShot();
    let f = new BasicShot();
    
    this.fullDeck = [b,c,d,e,f];
    this.drawPile = Array.from(this.fullDeck);
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
      window.cardsNumber = window.cardsNumber+1;
      //window.updateCardsShown();
    }
  }

  discardHand() {
    while (this.currentHand.length != 0) {
      this.discardPile.push(this.currentHand.pop());
      window.cardsNumber = window.cardsNumber -1;
    }
  }

  discardSingleCard(index) {
    this.discardPile.push(this.currentHand.splice(index,1)[0]);
    window.cardsNumber = window.cardsNumber -1;
    //window.updateCardsShown();
    if (this.drawPile.length === 0) {
      this.shuffleDiscardPileIntoDrawPile();
    }
    
  }

  shuffleDiscardPileIntoDrawPile() {
    while (this.discardPile.length != 0) {
      this.drawPile.push(this.discardPile.splice(Math.floor(Math.random()*this.discardPile.length),1)[0]);
    }
  }
  
}

window.cardHandler = new CardHandler();
