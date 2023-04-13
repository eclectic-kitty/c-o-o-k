/*
Script to run on phone


We are using the Eclipse Paho MQTT client library: https://www.eclipse.org/paho/clients/js/ to create an MQTT client that sends and receives messages. The client is set up for use on the shiftr.io test MQTT broker (https://shiftr.io/try)

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

let myName = "phone"; // Who are you? Make sure it matches the previous person's variable!
let nextName = "display"; // Who is next on the list? Make sure it matches the next person's variable!


// declare colour variables
let orange, lOrange, white, lBlue, blue, yBrown, purple, black;

let ingredients = [];
let ingrNames = ['carrot', 'chicken', 'chile', 'milk', 'pomSeed', 'potato', 'rice', 'vinegar', 'blank'];
let ingrImgs = [];
let started = false;
let pantry;
let hinges;
let door;

function preload() {
  // Load ingredient images
  for (let i = 0; i < ingrNames.length; i++) {
    let img = loadImage('/assets/ingredients/' + ingrNames[i] + '.png');
    ingrImgs.push(img);
  }

  pantry = loadModel('assets/pantry.obj');
  hinges = loadModel('assets/hinges.obj');
  door = loadModel('assets/door.obj');
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  frameRate(30);
  ellipseMode(CORNER)
  angleMode(DEGREES)
  MQTTsetup(); // Setup the MQTT client

  blue = color(48, 198, 182);
}

function draw() {
  noStroke();

  background(blue);

  if (started) {
    if (ingredients.length == 0) { 
      spawnIngredients(); 
    }

    ambientLight(200);
    let lC = 255; // Variable for directional light's intensity
    directionalLight(lC, lC, lC, -0.5, 1, -0.45) // A directional light that shines towards the left, downwards, and forwards

    push();
      scale(19, 16, 16);
      translate(-7, -20.5, -5);
      rotateX(-90)
      ambientMaterial(190, 115, 10);
      model(pantry);
      model(door);

      shininess(3); // Sets shininess of specularMaterial()
      specularMaterial(182, 219, 217); // Sets a blue metallic material
      model(hinges);
    pop();

    for (let i = 0; i < ingredients.length; i++) {
      ingredients[i].drawIngr();
    }
  }
}

function spawnIngredients() {
  // for (let i = 0; i < ingrNames.length; i++) {
  //   let ingr = new Ingredient(ingrNames[i], ingrImgs[i]);
  //   ingredients.push(ingr);
  // }
  let i = 0;
  for (let x = 0; x < 3; x++) {
    for (let y = 0; y < 3; y++) {
      let ingr = new Ingredient(ingrNames[i], ingrImgs[i], x, y);
      ingredients.push(ingr);
      i++;
    }
  }
}

function mouseClicked() {
  for (i = 0; i < ingredients.length; i++) {
    ingredients[i].touchedCheck(mouseX, mouseY);
  }
}

class Ingredient {
  constructor (name, img, x, y) {
    console.log(name)
    this.name = name;
    this.img = createGraphics(100, 100);
    this.img.image(img, 0, 0, 100, 100); // Sets image
    this.size = 250;
    
    this.xOff = (x-1) * 190;
    this.x = width/2 + this.xOff
    this.yOff = (y-1) * 220;
    this.y = height/2 + this.yOff
    console.log(width/2 + ' + ' + this.xOff + ', ' + height/2 + ' + ' + this.yOff)
    console.log(this.x + ', ' + this.y)

    this.held = false;
  }

  drawIngr() {
    if (!this.held) {
      push();
        translate(this.xOff, this.yOff, 0);
        scale(1.8);
        texture(this.img);
        plane(100, 100);
      pop();
    }
  }

  touchedCheck(touchX, touchY) {
    if (!this.held && touchX > this.x - 80 && touchX < this.x + 80 && touchY > this.y - 80 && touchY < this.y + 80) {
      sendMQTTMessage(this.name);
      this.held = true;
    }
  }
}


function keyPressed() {
  if (keyCode == 32) {
    started = true;
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
