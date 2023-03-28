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

let showMenu, ready, potTime; // booleans

// declare font variables
let menuFont;

let mButtonArray = []; // declare array for menu buttons objects
let ingArray = []; // ingredients array original
let recipe = [];
let ingAdded = []; // ingredients added by other player, object array
let playerAttempt = []; // ingredients added by other player, string array
let ingCounter;

let imgConsome, imgLock, imgCarrot, imgChicken, imgChile; // declaring variables for images

function preload() {
  menuFont = loadFont('assets/fonts/menu/CoveredByYourGrace-Regular.ttf'); // load fonts

  imgConsome = loadImage('assets/foods/consome.png');
  imgLock = loadImage('assets/lock.png');
  imgCarrot = loadImage('assets/ingredients/carrot.png');

  ingArray = ["carrot", "chicken", "chile", "milk", "pomSeed", "potato", "rice", "vinegar"];
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

  ingCounter = 0;

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
    showPot();
  }

  for(let i = 0; i < ingCounter; i++){
    ingAdded[i].display();
  }
}

// function mousePressed(){
//   // Sends a message on mouse pressed to test. You can use sendMQTTMessage(msg) at any time, it doesn't have to be on mouse pressed.
//   sendMQTTMessage("howdy"); // This function takes 1 parameter, here I used a random number between 0 and 255 and constrained it to an integer. You can use anything you want.
// }


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
    console.log("ingredient added = " + dataReceive[2]);

      // You can do something like this to compare. Dont' forget to make it an int
    ingAdded[ingCounter] = new Ingredient(dataReceive[2]); // add to object array
    playerAttempt[ingCounter] = dataReceive[2]; // add to string array
    ingCounter++; // increase nom of ings
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

  image(imgConsome, 85, 270); // consome de pollo pic

  for(let i = 0; i < 3; i++){
    image(imgLock, 270 + (i* 180), 270);
  }
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

  if(mButtonArray[0].selected){ // rn we're playtesting only the first recipe, so if that's clicked, boolean = true
    ready = true;
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
  else if(mButtonArray[1].selected || mButtonArray[2].selected || mButtonArray[3].selected){ // unplayable for first playtest
    fill(white); // text
    textSize(32)
    text('we cant play this one yet sorry :(', 400, 180);
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
  constructor(name) {
    this.name = name;
    this.xPos = random(800);
    this.yPos = random(500);
  }

  display() {
    fill(0);
    circle(this.xPos, this.yPos, 20);
  }
}

function setRecipe(){
  print(ingArray); // og array
 // recipe = shuffle(ingArray); // shuffle array commented out for now, see if people want to have randomized/cute zine recipe book?
  print(recipe);

  let nomOfIng; // variable to determine how many ingredients should be in the recipe.. 
                // each dish corresponds to a different difficulty

  if(mButtonArray[0].selected){ // consome de pollo will only have 3 ingredients that need to be chosen
    nomOfIng = 5;               // if statement will be changed post playtest to include other dishes.
  }

  for(let i = 0; i < nomOfIng; i++){ // shorten array
    recipe = shorten(ingArray); //for if we want to randomize things
  }

  print(recipe);
  // ADD A THING TO SEND RECIPE!!!!! post playtest, we need to ask if people like zine or not

}

function showPot(){
  background(lOrange);
  fill(orange);
  rect(330, 250, 170, 170, 20);
  rect(300, 250, 230, 30, 20);
}