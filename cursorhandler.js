global static cursorX=0;
global static cursorY = 0;
global static cursorZ =0;

window.addEventListener('keydown',(event)=>{
							if (event.key== "W" || event.code == "w") {
								cursorY = integerToCurb(cursorY -1);
							}
  							if (event.key== "S" || event.code == "s") {
								cursorY = integerToCurb(cursorY + 1);
							}
  							if (event.key== "A" || event.code == "a") {
								cursorX = integerToCurb(cursorX - 1);
							}
    							if (event.key== "D" || event.code == "d") {
								cursorX = integerToCurb(cursorX - 1);
							}
						});

/** Restrict an integer to a value between 0 and 9*/
function curbTo9(integerToCurb) {
  if (integerToCurb <=9 && integerToCurb >=0)
  {return integerToCurb;}
  else if (integerToCurb >9)
  {return 9;}
  else if (integerToCurb < 0)
  {return 0;}
}
