//start crafty
    Crafty.init();
    Crafty.canvas.init();
    //for the player 
    Crafty.sprite(44, "walk.png", {
        player: [0,0]
        });
    //for the chickens
    Crafty.sprite(32, "animals.png", {
        chicken: [4,4]
    });

    //the loading screen that will display while our assets load
    Crafty.scene("loading", function() {

        //load takes an array of assets and a callback when complete
        Crafty.load(["http://thehack.github.com/bawk-b-kawk/game/walk.png", "http://thehack.github.com/bawk-b-kawk/game/animals.png"], function() {
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

        //create our player entity with some premade components
        Crafty.e("2D, Canvas, player, RightControls, Hero, Collision, Solid")
            .attr({x: Crafty.viewport.width/3, y: Crafty.viewport.height/3})
            .rightControls(1);
        
        //chickens
        for (i=0;i<20;i++){  

        Crafty.e("2D, Canvas, chicken, Animal, Solid")
            .attr({x: 100, y: 200})
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
                    // keepiong them within the frame
                    if(this.x < this.w) {
                        direction = directions[1];
                    }
                    if(this.x > Crafty.viewport.height) {
                        direction = directions[3];
                    }
                    if(this.y < this.h) {
                        direction = directions[2];
                    }
                    if(this.y > Crafty.viewport.width) {
                        direction = directions[0];
                    }
                    
 
            // the first frame is speed, the second is second frame is how long to animate for.
                    if(!this.isPlaying()){
                        direction = pickNewDirection();
                    this.animate(direction.name, 30);
                    this.x += direction.x;
                    this.y += direction.y;
                    }
                    
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
    });​