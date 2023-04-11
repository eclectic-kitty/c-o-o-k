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





// MQTT Setup above
///////////////////////////////////////////////////////////////////////////////////////////////////
// Main setup + draw() below





// declare colour variables
let orange, lOrange, white, lBlue, blue, yBrown, purple, black;


let showMenu, ready, potTime, endScreen, camSetUp; // booleans

let Cam, endCam; // variable for the camera

let menu; // variable for the menu's canvas
let instructions; // variable for the in-game instructions' canvas
let end; // vaariable for end screen

let playerScore; // variable for calculating player score

// declare font variables
let menuFont;

let mButtonArray = []; // declare array for menu buttons objects
let recipe = []; // Variable for recipe
let ingrAdded = []; // ingredients added by other player, object array
let wrongCounter = 0; // Variable for keeping track of player mistakes
let pageNom = []; // array for what pages the user flips to

let ingrNames = ['carrot', 'chicken', 'chile', 'milk', 'pomSeed', 'potato', 'rice', 'vinegar'];
let ingrImgs = []; // Array that will hold ingredient images
let recipIngr = []; // Array that will hold a given recipe's ingredients
let imgConsome, imgAdobo, imgChiles, imgHalo; // declaring variables for non-ingredient images

let pot; // Variable for pot 3d model
let brothModel; // Variable for broth 3d model
let version = 0; // Variable used in moving broth


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

  pot = loadModel('assets/pooot.obj');
  brothModel = loadModel('assets/broth.obj');
}

// declaring colours, other variables that need to be assigned values,
// canvas and mqtt stuff
// create four buttons
function setup() {
  createCanvas(800, 500, WEBGL); // Set up canvas
  angleMode(DEGREES);
  MQTTsetup(); // Setup the MQTT client

  // colour palette
  orange = color(255, 159, 28);
  lOrange = color(255, 191, 105);
  white = color(255);
  lBlue = color(203, 243, 240);
  blue = color(48, 198, 182);
  yBrown = color(161, 135, 59),
  purple = color(160, 103, 230),
  black = color(0),

  showMenu = true; // Display menu screen
  ready = false;
  potTime = false;
  endScreen = false;
  camSetUp = false;

  menu = createGraphics(800, 500); // Sets up menu canvas
  instructions = createGraphics(800, 500); // Sets up in-game instructions' canvas
  end = createGraphics(800, 500); // sets up end screen

  for(let i = 0; i < 4; i++){ // create four buttons
    mButtonArray[i] = new MenuButtons(i);
  }
}

function draw() {
  noStroke();
  orbitControl();

  // Draws menu screen
  if(showMenu){
    menu.background(orange);
    menuScreen();
    texture(menu); // Sets menu canvas as texture
    plane(800, 500); // Draws a plane, same size as screen
  }

  // Draws pot screen
  if(potTime){
    // Set camera position for pot screen
    if (!camSetUp) { // Runs once
      cam = createCamera(); // Creates new camera
      cam.setPosition(0, -300, 275)
      cam.tilt(45)
      camSetUp = true; // switches boolean so code runs once
    }

    background(lOrange);

    // Sets up the lights
    ambientLight(200); // Ambient light from all directions
    let lC = 60; // Variable for directional light's intensity
    directionalLight(lC, lC, lC, -0.5, 1, -0.35) // A directional light that shines towards the left, downwards, and forwards

    drawPot(); // Draw pot
    
    broth.bubble(); // Update broth shape
    broth.display(); // Draw broth

    // Displays each ingredient
    for (let i = 0; i < ingrAdded.length; i++) {
      ingrAdded[i].updatePos(); // Updates the ingredeint's position
      ingrAdded[i].display(); // Draws ingredient
    }

    // Draws instructions & pages
    showInstr();
  }

  // Draws end screen
  if(endScreen){
    //cam.setPosition(0, 0, 0);
    print("HELP");

    background(orange);
    showEnd();
    texture(end);
    plane(800, 500);
  }
}






// Main setup + draw() above
///////////////////////////////////////////////////////////////////////////////////////////////////
// Menu screen code below





function menuScreen(){
  // text box
  menu.noStroke();



  menu.fill(lOrange)
  menu.rect(20, 25, 760, 110, 20); // lighter orange layer
  menu.fill(white);
  menu.rect(30, 40, 740, 80, 20); // white box

  // text
  menu.fill(orange);
  menu.textFont(menuFont);
  menu.textSize(70);
  menu.textAlign(CENTER, CENTER);
  menu.text('CHOOSE YOUR RECIPE!', 400, 70);

  for(let i = 0; i< 4; i++){
    mButtonArray[i].display(); // display menu buttons!
  }

  startButton(); // function to display/work for start button

  itemDesc(); // function to display info abt the food when selected

  imgConsome.resize(100, 100);
  menu.image(imgConsome, 85, 270); // consome de pollo pic

  imgAdobo.resize(100, 100);
  menu.image(imgAdobo, 270, 270); // adobo pic

  imgHalo.resize(100, 100);
  menu.image(imgHalo, 450, 270); // halo halo pic

  imgChiles.resize(100, 100);
  menu.image(imgChiles, 630, 270); // chiles en nogada pic
}

function startButton(){
  if(ready){ // if valid recipe has been chosen, button turns blue to indicate game can start
    menu.fill(blue);
  }
  else{
    menu.fill(lOrange);
  }
  menu.rect(290, 420, 220, 70, 20);

  menu.fill(white); // text
  menu.textSize(64);
  menu.text('BEGIN!', 400, 445);

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
    menu.fill(white); // text
    menu.textSize(24);
    menu.text('CONSOME DE POLLO – Scrumptious and homey, this simple classic\nwill lay a blanket over you after you pass out on the couch from\na night of clubbing and kiss you tenderly on the eyelids.', 400, 180);
  }
  else if(mButtonArray[1].selected){ // adobo
    menu.fill(white); // text
    menu.textSize(23)
    menu.text("ADOBO MANOK - Have you called your mom yet? When was the last time you told her\nyou loved her? This savoury chicken served with rice is sure to remind you of your parent's\nimpending mortality. You should visit them. Just pick up the phone.", 400, 180);
  }
  else if(mButtonArray[2].selected){ // halo halo
    menu.fill(white); // text
    menu.textSize(20)
    menu.text("HALO HALO - A popular cold dessert perfect for the summertime! The small light\nat the end of a very long tunnel of despair and dread and hopelessness and thinking\nthat nothing you do will ever matter, and really, when you think about it, is any of it\nworth it? Has anything you've done matter? This refreshing dish will put a pep in your step!", 400, 180);
  }
  else if(mButtonArray[3].selected){ // chiles en nogada
    menu.fill(white); // text
    menu.textSize(20)
    menu.text("CHILES EN NOGADA - Oh boy. Do you remember what it was? Yeah.\nWhat… How would I even describe such a dish? Shall I compare\nthee to the Mexican flag? Shall I describe thine warm, moist insides and\nthou sweet, sweet cream? That’s all I’ve got. This is an appetizing dish, I promise.", 400, 180);
  }
  else{
    menu.fill(white); // text
    menu.textSize(64);
    menu.text('...', 400, 160);
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
      menu.fill(blue);
    }
    else{
      menu.fill(lOrange);
    }

    menu.rect(this.xPos2, this.yPos2, this.size2, this.size2, this.roundedCorner); // back rectangle

    menu.fill(white);
    menu.rect(this.xPos, this.yPos, this.size, this.size, this.roundedCorner); // front rect.

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





// Menu screen code above
///////////////////////////////////////////////////////////////////////////////////////////////////
// Pot & end screen code below





function drawPot() {
  push(); // Pushed and popped to make sure scale, translation, etc. doesn't affect other things drawn
    scale(5);
    shininess(2); // Sets shininess of specularMaterial()
    specularMaterial(182, 219, 217); // Sets a blue metallic material
    translate(0, 8, 0); // Positions pot a little low
    rotateY(90); // Rotates pot to face up (model by default did not)
    rotateZ(180);
    model(pot); // Draws pot
  pop();
}

// Object for broth is defined
const broth = {
  limit: 2,
  bubbleSpeed: 0.2,
  change: 0,
  change2: 0,
  change3: 0,


  display() {
    push();
      let bad1 = lerpColor(orange, yBrown, this.change);
      let bad2 = lerpColor(yBrown, purple, this.change2);
      let bad3 = lerpColor(purple, black, this.change3);

      shininess(8); // Sets a low shininess for specularMaterial()

      if(playerScore < 30){ // if they get under 30% the correct ingredients, they fail
        specularMaterial(bad3); // change to black
        this.change3 += 0.005; // change the middle number so there's an animated gradient
      }
      else if (playerScore > 30 && playerScore < 50){ // if player gets 30-50% ingredients right
        specularMaterial(bad2); // change to purple
        this.change2 += 0.005;
      }
      else if (playerScore > 50 && playerScore < 75){ // if player has 50-75% right
        specularMaterial(bad1); // change to yellowy brown intermediary
        this.change += 0.005;
      }
      else{ // if player gets everything right
        specularMaterial(orange); // orange
      }

      scale(5); // Translate, rotate, and scale are the same as the pot 
      translate(0, 10, 0); 
      rotateY(90);
      rotateZ(180);
      model(brothModel); // Draws broth
    pop();
  },

  // "Bubbles" broth, randomly moves vertices along y position
  // This code mostly is an edited version of code from:
  // https://stackoverflow.com/questions/74291143/how-do-i-access-vertex-coordinates-of-an-obj-model-in-p5-js
  bubble() {
    for (const v of brothModel.vertices) { // For each vertex in broth
      v.y += random(-this.bubbleSpeed, this.bubbleSpeed); // Move along y axis a random amount, limited by set speed
      v.y = constrain(v.y, 15 - this.limit, 15 + this.limit) // Constrains broth's y position to a certain height & depth
    }

    brothModel.computeNormals(); // Updates the normals for lighting calculations
    
    // Update the geometry id so that the vertex buffer gets recreated
    // Without this p5.js will reused the cached vertex buffer.
    brothModel.gid = `brothModel-version-${version++}`;
  }
}

// Class for ingredients
class Ingredient {
  constructor(name, img) {
      this.name = name; // Sets name of ingredient
      this.img = createGraphics(100, 100); // Creates canvas for ingredient image
      this.img.image(img, 0, 0, 100, 100); // Sets image
      
      this.xOff = random(-60, 60); // Sets a random x position, within pot
      this.yOff = -280; // Sets y position just above where visible
      this.zOff = map(ingrAdded.length + 1, 1, recipIngr.length, -60, 60 ); // Sets y position 
      // The y position is set according to how many ingredients there currently are
  }

  display() {
    push();
      translate(this.xOff, this.yOff, this.zOff) // Sets ingredient position
      texture(this.img); // Sets image canvas as texture for ingredient's place
      //fill(255);
      plane(100, 100); // Draws ingredient plane
    pop();

    if(this.yOff <= -60 && ingAdded.length == recipIngr.length){
         potTime = false;
         endScreen = true;
         cam.setPosition(0, 0, 275);
        // cam.tilt(0);
    }
  }

  // Updates ingredient position
  updatePos() {
      if(this.yOff < -60){ // As long as ingredient is above final position
          this.yOff += 1.5;
      }
  }
}

function showInstr(){
  push();
    instructions.noStroke();
    instructions.fill(blue);
    instructions.rect(210, 400, 370, 47, 20)

    instructions.textFont(menuFont);
    instructions.textAlign(CENTER, CENTER);

    instructions.fill(white);
    instructions.textSize(16)
    instructions.text('In this order, follow the instructions of the following pages: ', 400, 410);

    instructions.textSize(27);
   // instructions.text(frameRate(), 400, 427)
    instructions.text(pageNom, 400, 427); // print page numbers
    
    rotateX(45);
    translate(0, -70, 150);
    texture(instructions);
    plane(800, 500);
  pop();
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

function convertToPageNom(){
  for (let i = 0; i < recipIngr.length; i++){ // for as many ingredients as there is in the recipe
    pageNom[i] = choosePage(recipIngr[i]); // page number for said ingredient will be randomized by this function
  }
}

function choosePage(ingr){ // check ingredient name
  if(ingr == "carrot"){
    return int(random(14, 19)); // if ingredient is a carrot, return page number between 13-17
  }
  else if(ingr == "chicken"){
    return int(random(19, 24)); // return page number
  }
  else if(ingr == "chile"){
    return int(random(24, 29)); // return page number
  }
  else if(ingr == "milk"){
    return int(random(29, 33)); // return page nom
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
  playerScore = ((recipIngr.length - wrongCounter)/recipIngr.length) * 100; // calculate player score on a percentage

  if(playerScore < 50){ // if they get under half the correct ingredients, they fail
    end.fill(white);
    end.textAlign(CENTER, CENTER);
    end.textSize(32)
    end.text('you failed.', 400, 250);
  }
  else if (playerScore > 50 && playerScore < 100){ // if player gets majority of ingredients right
    end.fill(white);
    end.textAlign(CENTER, CENTER);
    end.textSize(32)
    end.text('you cooked food! good job.', 400, 250);
  }
  else{ // if player gets everything right
    end.fill(white);
    end.textAlign(CENTER, CENTER);
    end.textSize(32)
    end.text('you made the best meal!\ngood job!!!\nyou are a cooking master!', 400, 250);
  }
}

function keyPressed() {
  if (keyCode == LEFT_ARROW) {
    test = new Ingredient(ingrNames[0], ingrImgs[0])
    ingrAdded.push(test);
  }
}




// Pot & end screen code above
///////////////////////////////////////////////////////////////////////////////////////////////////
// MQTT code below




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
        ingrAdded.push(new Ingredient(ingrReceived, ingrImgs[i])); // add to object array
      }
    }

    if (ingrAdded.length != recipIngr.length){
      let i = ingrAdded.length;
      if (ingrAdded[i-1].name != recipIngr[i-1]) {
        wrongCounter++;
      }
    }
    console.log("ingredients wrong: " + wrongCounter);
    print("ingredients added: " + ingAdded.length);
    print("recipe length: " + recipIngr.length);
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
