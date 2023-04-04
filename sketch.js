/*
c o o k
CART 263, Creative Computation II, Winter 2023
Concordia University
Aurora Becerra Granados & Abigail Lopez


We are using the Eclipse Paho MQTT client library: https://www.eclipse.org/paho/clients/js/ to create an MQTT client that sends and receives messages. The client is set up for use on the shiftr.io test MQTT broker (https://shiftr.io/try)

Desktop Sketch
*/



// MQTT client details. We are using a public server called shiftr.io. Don't change this.
let broker = {
  hostname: 'public.cloud.shiftr.io',
  port: 443
};
let client;
let creds = {
  clientID: 'p5Client',
  userName: 'public',
  password: 'public'
}
let topic = 'CART253'; // This is the topic we are all subscribed to
// End of MQTT client details

let myName = "display"; // Who are you? Make sure it matches the previous person's variable!
let nextName = "phone"; // Who is next on the list? Make sure it matches the next person's variable!





// declare colour variables
let orange, lOrange, white, lBlue, blue;

let showMenu, ready, potTime, endScreen; // booleans

// declare font variables
let menuFont;

let mButtonArray = []; // declare array for menu buttons objects
let recipe = [];
let ingAdded = []; // ingredients added by other player, object array
let wrongCounter = 0;
let pageNom = []; // array for what pages the user flips to



let ingrNames = ['carrot', 'chicken', 'chile', 'milk', 'pomSeed', 'potato', 'rice', 'vinegar'];
let ingrImgs = [];
let recipIngr = [];
let imgConsome, imgAdobo, imgChiles, imgHalo; // declaring variables for non-ingredient images

function preload() {
  menuFont = loadFont('assets/fonts/menu/CoveredByYourGrace-Regular.ttf'); // load fonts

  imgConsome = loadImage('assets/foods/consome.png');
  imgAdobo = loadImage('assets/foods/adobo.png');
  imgChiles = loadImage('assets/foods/chiles.png');
  imgHalo = loadImage('assets/foods/haloHalo.png');

  // Load ingredient images
  for (let i = 0; i < ingrNames.length; i++) {
    let img = loadImage('/assets/ingredients/' + ingrNames[i] + '.png');
    ingrImgs.push(img);
  }
}

// This is my setup function...
// declaring colours, other variables that need to be assigned values,
// canvas and mqtt stuff
// create four buttons
function setup() {
  // colour palette
  orange = color(255, 159, 28);
  lOrange = color(255, 191, 105);
  white = color(255);
  lBlue = color(203, 243, 240);
  blue = color(48, 198, 182);

  showMenu = true; // Display menu screen
  ready = false;
  potTime = false;
  endScreen = false;

  createCanvas(800, 500);
  MQTTsetup(); // Setup the MQTT client

  for(let i = 0; i < 4; i++){ // create four buttons
    mButtonArray[i] = new MenuButtons(i);
  }
}

function draw() {
  background(orange);

  if(showMenu){
    menuScreen();
  }



  if(potTime){
    background(lOrange);

    for(let i = 0; i < ingAdded.length; i++){
      ingAdded[i].display();
    }

    showPot();
    showRecipe();
  }

  if(endScreen){
    showEnd();
  }
  
}

// function mousePressed(){
//   // Sends a message on mouse pressed to test. You can use sendMQTTMessage(msg) at any time, it doesn't have to be on mouse pressed.
//   sendMQTTMessage("howdy"); // This function takes 1 parameter, here I used a random number between 0 and 255 and constrained it to an integer. You can use anything you want.
// }


function menuScreen(){
  // text box
  noStroke();

  fill(lOrange)
  rect(20, 25, 760, 110, 20); // lighter orange layer
  fill(white);
  rect(30, 40, 740, 80, 20); // white box

  // text
  fill(orange);
  textFont(menuFont);
  textSize(70);
  textAlign(CENTER, CENTER);
  text('CHOOSE YOUR RECIPE!', 400, 70);

  for(let i = 0; i< 4; i++){
    mButtonArray[i].display(); // display menu buttons!
  }

  startButton(); // function to display/work for start button

  itemDesc(); // function to display info abt the food when selected

  imgConsome.resize(100, 100);
  image(imgConsome, 85, 270); // consome de pollo pic

  imgAdobo.resize(100, 100);
  image(imgAdobo, 270, 270); // adobo pic

  imgHalo.resize(100, 100);
  image(imgHalo, 450, 270); // halo halo pic

  imgChiles.resize(100, 100);
  image(imgChiles, 630, 270); // chiles en nogada pic
}

function startButton(){
  if(ready){ // if valid recipe has been chosen, button turns blue to indicate game can start
    fill(blue);
  }
  else{
    fill(lOrange);
  }
  rect(290, 420, 220, 70, 20);

  fill(white); // text
  textSize(64);
  text('BEGIN!', 400, 445);

  if(mButtonArray[0].selected || mButtonArray[1].selected || mButtonArray[2].selected || mButtonArray[3].selected){
    ready = true; // boolean to determine if valid recipe has been selected, and if game can start
  }
  else{
    ready = false;
  }

  if(mouseX >= 290 && mouseX <= 510 && mouseY >= 420 && mouseY <= 490){ // when game is ready to begin...
    if(mouseIsPressed && ready){ // if button clicked:
      setRecipe(); // choose recipe
      showMenu = false; // get rid of menu
      potTime = true; // show pot
      sendMQTTMessage("start!"); // tell other person to start

    }
  }

}

function itemDesc(){ // display info about the recipe!
  if(mButtonArray[0].selected){ // consomme de pollo
    fill(white); // text
    textSize(24);
    text('CONSOME DE POLLO – Scrumptious and homey, this simple classic\nwill lay a blanket over you after you pass out on the couch from\na night of clubbing and kiss you tenderly on the eyelids.', 400, 180);
  }
  else if(mButtonArray[1].selected){ // adobo
    fill(white); // text
    textSize(23)
    text("ADOBO MANOK - Have you called your mom yet? When was the last time you told her\nyou loved her? This savoury chicken served with rice is sure to remind you of your parent's\nimpending mortality. You should visit them. Just pick up the phone.", 400, 180);
  }
  else if(mButtonArray[2].selected){ // halo halo
    fill(white); // text
    textSize(20)
    text("HALO HALO - A popular cold dessert perfect for the summertime! The small light\nat the end of a very long tunnel of despair and dread and hopelessness and thinking\nthat nothing you do will ever matter, and really, when you think about it, is any of it\nworth it? Has anything you've done matter? This refreshing dish will put a pep in your step!", 400, 180);
  }
  else if(mButtonArray[3].selected){ // chiles en nogada
    fill(white); // text
    textSize(20)
    text("CHILES EN NOGADA - Oh boy. Do you remember what it was? Yeah.\nWhat… How would I even describe such a dish? Shall I compare\nthee to the Mexican flag? Shall I describe thine warm, moist insides and\nthou sweet, sweet cream? That’s all I’ve got. This is an appetizing dish, I promise.", 400, 180);
  }
  else{
    fill(white); // text
    textSize(64);
    text('...', 400, 160);
  }
}

class MenuButtons {
  constructor(order) {
    this.order = order;
    this.xPos = 60 + (order * 180); // smaller rect in front
    this.yPos = 250;
    this.size = 150;
    this.roundedCorner = 20;

    this.xPos2 = 50 + (order * 180); // bigger rect in back
    this.yPos2 = 240;
    this.size2 = 170;
    this.selected = false;
  }

  display() {
    if(this.selected){ // if a certain box is clicked, highlight it by making it blue
      fill(blue);
    }
    else{
      fill(lOrange);
    }

    rect(this.xPos2, this.yPos2, this.size2, this.size2, this.roundedCorner); // back rectangle

    fill(white);
    rect(this.xPos, this.yPos, this.size, this.size, this.roundedCorner); // front rect.

    if(mouseIsPressed === true && mouseY >= this.yPos2 && mouseY <= (this.yPos + 170)){
      if(mouseX >= this.xPos2 && mouseX <= (this.xPos2 + 170)){
        this.selected = true; // check if a box has been clicked or not...
      }
      else{
        this.selected = false;
      }
    }
  }

}

class Ingredient {
  constructor(name, img) {
    this.name = name;
    this.img = img;
    this.xPos = 350;
    this.yPos = 0;

    this.size = 150;
  }

  display() {
    fill(0);
    //circle(this.xPos, this.yPos, 20);
    image(this.img, this.xPos, this.yPos, this.size, this.size);
    
    if(this.yPos < 300){
    this.yPos++;
    }

    if(this.yPos == 300 && ingAdded.length == recipIngr.length){
      potTime = false;
      
      endScreen = true;

    }
  }
}

function setRecipe(){ // randomly generate recipe user needs to follow + come up with page numbers users need to flip to
  recipIngr = shuffle(ingrNames); // shuffle array commented out for now, see if people want to have randomized/cute zine recipe book?

  print("og recipe = " + ingrNames); // print og recipe
  print("shuffled array = " + recipIngr); // print shuffled recipe

  // let nomOfIng; // variable to determine how many ingredients should be in the recipe.. 
                // each dish corresponds to a different difficulty

  // if(mButtonArray[0].selected){ // consome de pollo will only have 3 ingredients that need to be chosen
  //   recipIngr = ['carrot', 'chicken', 'chile'];            // if statement will be changed post playtest to include other dishes.
   
  if(mButtonArray[0].selected){ // if consome pollo is selected
    for(let i = 0; i < 5; i++){ // will only have 3 ingredients, therefore pop array 5 times
      recipIngr.pop();
    }
   
    print("new recipe = " + recipIngr); // print recipe that players will have to match
  
  }
  if(mButtonArray[1].selected){ // adobo manok will have 5 ingredients
    for(let i = 0; i < 3; i++){ // therefore pop 3 times
      recipIngr.pop();
    }
   
    print("new recipe = " + recipIngr); // print recipe that players will have to match
  }
  else if(mButtonArray[2].selected){ // halo halo will have 7 ingredients
      recipIngr.pop(); // therefore pop once
    
   
    print("new recipe = " + recipIngr); // print recipe that players will have to match
  
  }
  else if(mButtonArray[3].selected){ // chiles en nogada will have 8 ingredients, no need to pop
    print("new recipe = " + recipIngr); // print recipe
  }

  convertToPageNom(); // choose page numbers that reference ingredients in the recipe
}

function showPot(){
  fill(orange);
  rect(330, 210, 170, 170, 20);
  rect(300, 210, 230, 30, 20);
}

function showRecipe(){
  fill(white);
  textSize(32)
  text('In this order, follow the instructions of the following pages: ', 400, 410);

  textSize(60);
  text(pageNom, 400, 450); // print page numbers
}

function convertToPageNom(){
  for (let i = 0; i < recipIngr.length; i++){ // for as many ingredients as there is in the recipe
    pageNom[i] = choosePage(recipIngr[i]); // page number for said ingredient will be randomized by this function
  }
}

function choosePage(ingr){ // check ingredient name
  if(ingr == "carrot"){
    return int(random(13, 18)); // if ingredient is a carrot, return page number between 13-17
  }
  else if(ingr == "chicken"){
    return int(random(18, 23)); // return page number
  }
  else if(ingr == "chile"){
    return int(random(23, 28)); // return page number
  }
  else if(ingr == "milk"){
    return int(random(28, 33)); // return page nom
  }
  else if(ingr == "pomSeed"){
    return int(random(33, 38)); // return page nom
  }
  else if(ingr == "potato"){
    return int(random(38, 43)); // return page nom
  }
  else if(ingr == "rice"){
    return int(random(43, 48)); // return page nom
  }
  else if(ingr == "vinegar"){
    return int(random(48, 53)); // return page nom
  }
}

function showEnd(){
  if(wrongCounter > 0){
    fill(white);
    textSize(32)
    text('you failed.', 400, 250);
  }
  else{
    fill(white);
    textSize(32)
    text('you cooked food! good job.', 400, 250);
  }
}




// Sending a message like this:
function sendMQTTMessage(msg) {
  message = new Paho.MQTT.Message(myName + "/" + nextName+"/"+ msg); // add messages together:

  message.destinationName = topic;
  print("Message Sent!");
  client.send(message); // send message
}

// When a message arrives, do this:
function onMessageArrived(message) {
  print("Message Received:");
  print(message.payloadString); // Print the incoming message
  // sentIngredient = message;

  let dataReceive = split(trim(message.payloadString), "/");// Split the incoming message into an array deliniated by "/"
  console.log("Message for:");
  console.log(String(dataReceive[1]));
  // 0 is who its from
  // 1 is who its for
  // 2 is the data
  if(dataReceive[1] == myName){ // Check if its for me
    console.log("Its for me! :) ");
    let ingrReceived = dataReceive[2];
    console.log("ingredient added = " + dataReceive[2]);

    console.log(ingrNames.length);
    for (let i = 0; i < ingrNames.length; i++) {
      console.log(ingrReceived + ', ' + ingrNames[i]);
      if (ingrReceived == ingrNames[i]) {
        ingAdded.push(new Ingredient(ingrReceived, ingrImgs[i])); // add to object array
      }
    }

    if (ingAdded.length != recipIngr.length){
      let i = ingAdded.length;
      if (ingAdded[i-1].name != recipIngr[i-1]) {
        wrongCounter++;
      }
    }
    console.log(wrongCounter);
}


}

// Callback functions
function onConnect() {
client.subscribe(topic);
console.log("connected");
// is working
}

function onConnectionLost(response) {
if (response.errorCode !== 0) {
// If it stops working
}
}

function MQTTsetup(){
client = new Paho.MQTT.Client(broker.hostname, Number(broker.port), creds.clientID);
client.onConnectionLost = onConnectionLost;
client.onMessageArrived = onMessageArrived;
client.connect({
    onSuccess: onConnect,
userName: creds.userName, // username
password: creds.password, // password
useSSL: true
});
}
