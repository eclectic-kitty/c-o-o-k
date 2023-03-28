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



let ingredients = [];
let ingrNames = ['carrot', 'chicken', 'chile', 'milk', 'pomSeed', 'potato', 'rice', 'vinegar'];
let ingrImgs = [];
let started = false;
//let ingrImgs = {carrot: 0, chicken: 0, chile: 0, milk: 0, pomSeed: 0, potato: 0, rice: 0, vinegar: 0};

function preload() {
  // Load ingredient images
  for (let i = 0; i < ingrNames.length; i++) {
    let img = loadImage('/assets/ingredients/' + ingrNames[i] + '.png');
    ingrImgs.push(img);
  }
}

function setup() {
  frameRate(30);
  noSmooth();
  createCanvas(windowWidth, windowHeight);
  MQTTsetup(); // Setup the MQTT client

  console.log(width + ', ' + height);
}

function draw() {
  if (started && ingredients.length == 0) { spawnIngredients() }

  background(48, 198, 182);
  for (let i = 0; i < ingredients.length; i++) {
    ingredients[i].drawIngr();
  }
}

function spawnIngredients() {
  for (let i = 0; i < ingrNames.length; i++) {
    let ingr = new Ingredient(ingrNames[i], ingrImgs[i]);
    ingredients.push(ingr);
  }
}

function mouseClicked() {
  for (i = 0; i < ingredients.length; i++) {
    ingredients[i].touchedCheck(mouseX, mouseY);
  }
}

class Ingredient {
  constructor (name, img) {
    this.name = name;
    this.img = img;
    this.size = 2.5;
    
    this.x = random(width - 100 * this.size);
    this.y = random(height - 100 * this.size);

    this.held = false;
  }

  drawIngr() {
    if (!this.held) {
      image(this.img, this.x, this.y, 100*this.size, 100*this.size);
    }
  }

  touchedCheck(touchX, touchY) {
    if (!this.held && touchX > this.x && touchX < this.x + 100*this.size && touchY > this.y && touchY < this.y + 100*this.size) {
      sendMQTTMessage(this.name)
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
