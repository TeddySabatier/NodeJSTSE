window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

var groundCv = document.getElementById("ground");
var groundCtx = groundCv.getContext("2d");

var objectCv = document.getElementById("object");
var objectCtx = objectCv.getContext("2d");
    objectCtx.font = "14px Verdana";
    objectCtx.fillStyle = "white";
    objectCtx.lineWidth = 3;

var canvasDim = {
    width: groundCv.width,
    height: groundCv.height
};

// Sprite loading
    var sprite = {
        grass: null
    }

    var spriteLoaded = function () {

        this.loaded = true;

        for (var name in sprite) {
            if (!sprite[name].loaded) {
                return;
            }
        }

        init();
    };

    sprite.grass = new Image();
    sprite.grass.src = "./texture/grass.png";
    sprite.grass.onload = spriteLoaded;

function init () {
    for (var l = 0 ; l * 97 <= canvasDim.height ; l++) {
        for (var c = 0 ; c * 97 <= canvasDim.width ; c++) {
            groundCtx.drawImage(sprite.grass, c * 97, l * 97, 97, 97);
        }
    }

}
