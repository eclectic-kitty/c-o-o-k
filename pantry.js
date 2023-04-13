/*
This is the script for the pantry display / controller.
On this screen, the player can see and select the ingredients that will end up in the pot.

We are using the Eclipse Paho MQTT client library: https://www.eclipse.org/paho/clients/js/ to 
create an MQTT client that sends and receives messages. The client is set up for use on the shiftr.io 
test MQTT broker (https://shiftr.io/try)
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

let myName = "pantry"; // Who are you? Make sure it matches the previous person's variable!
let nextName = "pot"; // Who is next on the list? Make sure it matches the next person's variable!





// MQTT Setup above
///////////////////////////////////////////////////////////////////////////////////////////////////
// Pantry code below





let ingredients = []; // Array to hold ingredient objects
// Array to contain ingredient names
let ingrNames = ['carrot', 'chicken', 'chile', 'milk', 'pomSeed', 'potato', 'rice', 'vinegar', 'blank'];
let ingrImgs = []; // Array that will hold ingredient images
let started = false; // Boolean to signal if game has started

// Variables to hold  Models
let pantry;
let hinges;
let door;

function preload() {
  // Load ingredient images
  for (let i = 0; i < ingrNames.length; i++) { // Cycle through ingredient names array
    let img = loadImage('/assets/ingredients/' + ingrNames[i] + '.png'); // For each, get its image
    ingrImgs.push(img); // Add image to images array
  }

  // Load  models
  pantry = loadModel('assets/pantry.obj');
  hinges = loadModel('assets/hinges.obj');
  door = loadModel('assets/door.obj');
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL); // Setup canvas
  angleMode(DEGREES)
  MQTTsetup(); // Setup the MQTT client
}

function draw() {
  noStroke(); // Sets no stroke for  models
  background(48, 198, 182); // Sets background to a cool saturated blue

  // Code in following "if" runs once game has started
  if (started) {
    if (ingredients.length == 0) { // If no ingredients have spawned yet,
      spawnIngredients(); 
    }

    // Sets up lights
    ambientLight(200); // Ambient light from all directions
    let lC = 255; // Variable for directional light's intensity
    directionalLight(lC, lC, lC, -0.5, 1, -0.45) // A directional light that shines towards the left, downwards, and forwards

    drawPantry();

    // Draw each ingredient
    for (let i = 0; i < ingredients.length; i++) {
      ingredients[i].drawIngr();
    }
  }
}

// Draws pantry models
function drawPantry() {
  push(); // Push and pop to isolate position, rotation, scale, materials
    // Place models
    scale(19, 16, 16);
    translate(-7, -20.5, -5);
    rotateX(-90)
    // Matte orange material for pantry
    ambientMaterial(190, 115, 10);
    model(pantry); // Draw pantry
    model(door); // Draw door

    shininess(3); // Sets shininess of specularMaterial()
    specularMaterial(182, 219, 217); // Sets a blue metallic material
    model(hinges); // Draw door hinges
  pop();
}

function spawnIngredients() {
  let i = 0; // Index for current ingredient
  // THe two for loops keep track of x and y position of ingrdients
  for (let x = 0; x < 3; x++) {
    for (let y = 0; y < 3; y++) {
      // Create ingredient, using the index to pass name and image, and passing along x and y position
      let ingr = new Ingredient(ingrNames[i], ingrImgs[i], x, y);
      ingredients.push(ingr);
      i++; // Increase ingredient index
    }
  }
}

// Control mouse clicks
function mouseClicked() {
  for (i = 0; i < ingredients.length; i++) { // For each ingredient,
    ingredients[i].clickedCheck(mouseX, mouseY); // CHeck if ingredient has been clicked on
  }
}

class Ingredient {
  constructor (name, img, x, y) {
    this.name = name; // Set ingredient name
    this.img = createGraphics(100, 100); // Create canvas for image
    this.img.image(img, 0, 0, 100, 100); // Sets image in canvas
    
    this.x = (x-1) * 190; // Sets x position in 3D space for display
    this.x2D = width/2 + this.x // Sets x position in 2D space for selection
    this.y = (y-1) * 220; // Sets y position in 3D space for display
    this.y2D = height/2 + this.y // Sets y position in 2D space for selection
    // The separate 2d position is necessary as 0,0 is in the center in 3D, but in the top left corner in 2D

    this.clicked = false; // Boolean
  }
  
  drawIngr() {
    if (!this.clicked) { // If ingredient has not been clicked
      push(); // Push and pop to isolate position & scale
        // Position ingredient plane
        translate(this.x, this.y, 0);
        scale(1.8);

        texture(this.img); // Sets canvas with image as texture for plane
        plane(100, 100); // Draw plane
      pop();
    }
  }

  clickedCheck(touchX, touchY) {
    // "If" chechs if the mouse is within bounds of the ingrdient. 
    if (!this.clicked && touchX > this.x-80 && touchX < this.x+80 && touchY > this.y-80 && touchY < this.y+80) {
      sendMQTTMessage(this.name); // Sends ingredient name to pot screen
      this.clicked = true; // Signals to rest of script that the ingredient has been touched
    }
  }
}

// Test function to see interface before game starts
function keyPressed() {
  if (keyCode == 32) {
    started = true;
  }
}





// Our code above
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
// 0 is who its from
// 1 is who its for
// 2 is the data

  if(dataReceive[1] == myName){ // Check if its for me
    console.log("Its for me! :) ");
  
    if (dataReceive[2] == "start!") {
      started = true;
    }
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
