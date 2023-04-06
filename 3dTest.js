let pot;
let shiny = 0;

let ingrNames = ['carrot', 'chicken', 'chile', 'milk', 'pomSeed', 'potato', 'rice', 'vinegar'];
let ingrImgs = [];
let ingAdded = []; // ingredients added by other player, object array

let currIngr = 0;

let cam;

function preload() {
    pot = loadModel('assets/pooot.obj');

    // Load ingredient images
    for (let i = 0; i < ingrNames.length; i++) {
      let img = loadImage('/assets/ingredients/' + ingrNames[i] + '.png');
      ingrImgs.push(img);
    }
}

function setup() {
    createCanvas(800, 500, WEBGL);
    angleMode(DEGREES);

    cam = createCamera();
    cam.setPosition(0, -300, 275)
    cam.tilt(45)
    //cam.move(0, -200, 430)
    //cam.lookAt(0, 0, 0)
}

function draw() {
    background(255, 191, 105);
    noStroke();
    orbitControl();
    
    ambientLight(200);
    let lC = 60; 
    directionalLight(lC, lC, lC, -0.5, 1, -0.35) // for z axise, into the screen is lower numbers, out of the screen is higher
    

    push();
    scale(5);
    shininess(2);
    specularMaterial(160, 190, 190);
    translate(0, 8, 0); // z: 350
    rotateY(90);
    rotateZ(180);
    model(pot);
    pop();

    for (let i = 0; i < ingAdded.length; i++) {
        ingAdded[i].updatePos();
        push();
        ingAdded[i].display();
        pop();
    }
}

function mouseClicked() {
    newIngr = new Ingredient(ingrNames[currIngr], ingrImgs[currIngr]);
    ingAdded.push(newIngr);
    currIngr++;
}


class Ingredient {
    constructor(name, img) {
        this.name = name;
        this.img = createGraphics(100, 100);
        this.img.image(img, 0, 0, 100, 100);
        
        this.xOff = 0;
        this.yOff = -280; //-280
        this.zOff = 0;
  
        this.size = 150;
    }
  
    display() {
        translate(this.xOff, this.yOff, this.zOff)
        texture(this.img);
        //fill(255);
        plane(100, 100);
  
        // if(this.yPos == 300 && ingAdded.length == recipIngr.length){
        //     potTime = false;
        
        //     endScreen = true;
        // }
    }

    updatePos() {
        if(this.yOff < -60){
            this.yOff++;
            console.log(this.yOff);
        }
    }
  }