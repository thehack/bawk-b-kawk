window.onload = function() { 
    //start crafty
    Crafty.init(940, 400);
    Crafty.canvas.init();
    //for the player 
    Crafty.sprite(44, "walk.png", {
        player: [0,0]
        });
    //for the chickens
    Crafty.sprite(32, "animals.png", {
        chicken: [4,4],
        egg: [0,8]
    });
    Crafty.sprite(20, "dirt.png", {
        dirt1: [0,0],
        dirt2: [1,0],
        dirt3: [2,0],
        dirt4: [3,0],
        vFence: [4,0],
        hFence: [5,0],
        tLFence: [6,0],
        bRFence: [7,0],
        bLFence: [8,0],
        tRFence: [9,0]
    });
    var sounds = ["awk", "bawk", "blok", "klawaawk", "woop"]
    for (var i = 0; i < sounds.length; i++) {
        Crafty.audio.add(sounds[i], sounds[i] + ".ogg");
    };
    var eggCount = 0;

    var pickUpEgg = function(egg) {
        egg.destroy();
        Crafty.audio.play("woop");
        eggCount += 1;
        console.log("egg count: " + eggCount);
    };

    var layAnEgg = function(xPos, yPos) {
        if(Crafty.math.randomInt(0, 3600) === 1) {
          var egg = Crafty.e("2D, egg, Canvas, Egg, Collision")
            .attr({x: xPos, y: yPos})
            .onHit('Hero', function() {pickUpEgg(egg) });
            Crafty.audio.play(["blok", "awk", "bawk", "klawaawk"][Crafty.math.randomInt(0, 3)]);
            console.log('laid an egg! ' );
        }
    };

    //the loading screen that will display while our assets load
    Crafty.scene("loading", function() {

        //load takes an array of assets and a callback when complete
        Crafty.load(["walk.png", "animals.png", "dirt.png", "awk.ogg", "bawk.ogg", "blok.ogg", "klawaawk.ogg", "woop.ogg"], function() {
            Crafty.scene("main"); //when everything is loaded, run the main scene
        });

        //black background with some loading text
        Crafty.background("#000");
        Crafty.e("2D, DOM, Text")
            .attr({w: 100, h: 20, x: 400, y: 190})
            .text("Loading")
            .css({"text-align": "center"});
    });

    //automatically play the loading scene
    Crafty.scene("loading");

    Crafty.scene("main", function() {
        // create dirt.
        var generateWorld = function() {
        //generate along the x-axis
            for(var i = 0; i < 47; i++) {
                //generate along the y-axis
                for(var j = 0; j < 20; j++) {
                    if(i==0 && j==0){
                        Crafty.e("2D, Canvas, tLFence")
                            .attr({x: i * 20, y: j * 20});
                    }
                    else if(i==46 && j==0){
                        Crafty.e("2D, Canvas, tRFence")
                            .attr({x: i * 20, y: j * 20});
                    }                    
                    else if(i==0 && j==19){
                        Crafty.e("2D, Canvas, bLFence")
                            .attr({x: i * 20, y: j * 20});
                    }
                    else if(i==46 && j==19){
                        Crafty.e("2D, Canvas, bRFence")
                            .attr({x: i * 20, y: j * 20});
                    }
                    else if((i === 0 || i === 46) && ( j > 0 && j < 19 )){
                        Crafty.e("2D, Canvas, vFence, Solid")
                            .attr({x: i * 20, y: j * 20});
                    }
                    else if ((j===0 || j===19) && (i > 0 && i < 46)) {
                        Crafty.e("2D, Canvas, hFence, Solid")
                            .attr({x: i * 20, y: j * 20});
                    }

                    else {
                    dirtType = Crafty.math.randomInt(1, 4);
                    Crafty.e("2D, Canvas, dirt"+dirtType)
                        .attr({x: i * 20, y: j * 20});
                    }
                }
            }
        }
        generateWorld();

        //create our player entity with some premade components
        Crafty.e("2D, Canvas, player, RightControls, Hero, Collision, Solid")
            .attr({x: Crafty.viewport.width/3, y: Crafty.viewport.height/3})
            .rightControls(1);
        
        //chickens
        for (i=0;i<8;i++){  

        Crafty.e("2D, Canvas, chicken, Animal, Solid")
            .attr({x: Crafty.math.randomInt(40, 900),  y: Crafty.math.randomInt(40, 360)})
        }
    });

    //All the directional controls for our chickens
    Crafty.c("Animal", {

        init: function () {
            var directions = [  {name:  'chickenUp',    x: 0, y: -1, spriteRow: 7}, 
                                {name:  'chickenRight', x: 1, y: 0, spriteRow: 6}, 
                                {name:  'chickenDown',  x: 0, y: 1, spriteRow: 4}, 
                                {name:  'chickenLeft',  x: -1, y: 0, spriteRow: 5}    ];

            // Just to get things started...                    
            if (!direction) {
                var direction = directions[Crafty.math.randomInt(0,3)];
            }
            // defining the 
            this.requires("SpriteAnimation, Collision")
            .animate("chickenUp",3,7,5)
                .animate("chickenRight",3,6,5)
                .animate("chickenDown",3,4,5)
                .animate("chickenLeft",3,5,5)
                .bind("EnterFrame", function() { 
                    // keeping them within the frame
                    if(this.x < this.w) {
                        direction = directions[1];
                    }
                    if(this.x > Crafty.viewport.width) {
                        direction = directions[3];
                    }
                    if(this.y < this.h) {
                        direction = directions[2];
                    }
                    if(this.y > Crafty.viewport.height) {
                        direction = directions[0];
                    }
                    

            // the first frame is speed, the second is second frame is how long to animate for.
                    direction = pickNewDirection();
                    this.animate(direction.name, 30);
                    this.x += direction.x;
                    this.y += direction.y;

                    //pass on the chicken coordinates to the egg
                    layAnEgg(this.x, this.y);
            });

            this.onHit('Hero', function() {console.log('You hit a chicken!') });
            
            // If a random amount of time under 3 seconds has passed, choose a new direction from the directions array.
            var pickNewDirection = function() {
                if(Crafty.math.randomInt(0,150) === 75) {
                     direction = directions[Crafty.math.randomInt(0, 3)];
                //    console.log(direction.name);
                }
                return direction;
            };

        }
    });
    Crafty.c('Egg', {
        init: function() {
            this.requires("Collision");
        }

        
    })

    //create Hero Component
    Crafty.c('Hero', {
        init: function() {
                //setup animations
                this.requires("SpriteAnimation, Collision")
                    .animate("walk_left", 5, 0, 9)
                    .animate("walk_right", 15, 0, 19)
                    .animate("walk_up", 10, 0, 14)
                    .animate("walk_down", 0, 0, 4)
                //change direction when a direction change event is received
                .bind("NewDirection",
                    function (direction) {
                        if (direction.x < 0) {
                            if (!this.isPlaying("walk_left"))
                                this.stop().animate("walk_left", 20, -1);
                        }
                        if (direction.x > 0) {
                            if (!this.isPlaying("walk_right"))
                                this.stop().animate("walk_right", 20, -1);
                        }
                        if (direction.y < 0) {
                            if (!this.isPlaying("walk_up"))
                                this.stop().animate("walk_up", 20, -1);
                        }
                        if (direction.y > 0) {
                            if (!this.isPlaying("walk_down"))
                                this.stop().animate("walk_down", 20, -1);
                        }
                        if(!direction.x && !direction.y) {
                            this.stop();
                        }
                })
                // A rudimentary way to prevent the user from passing solid areas
                .bind('Moved', function(from) {
                    if(this.hit('Solid')){
                        this.attr({x: from.x, y:from.y});
                    }
                });
            return this;
        }
    });

    // He will go where the arrow keys tell him to go.
    Crafty.c("RightControls", {
        init: function() {
            this.requires('Multiway');
        },
        rightControls: function(speed) {
            this.multiway(speed, {UP_ARROW: -90, DOWN_ARROW: 90, RIGHT_ARROW: 0, LEFT_ARROW: 180})
            return this;
        }
    });
};