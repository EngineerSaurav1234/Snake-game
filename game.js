var Snake = (function () {

    const INITIAL_TAIL = 4;
    var fixedTail = true;
  
    var intervalID;
  
    var tileCount = 10;
    var gridSize = 400/tileCount;
  
    const INITIAL_PLAYER = { x: Math.floor(tileCount / 2), y: Math.floor(tileCount / 2) };
  
    var velocity = { x:0, y:0 };
    var player = { x: INITIAL_PLAYER.x, y: INITIAL_PLAYER.y };
  
    var walls = false;
  
    var fruit = { x:1, y:1 };
  
    var trail = [];
    var tail = INITIAL_TAIL;
  
    var reward = 0;
    var points = 0;
    var pointsMax = 0;
  
    var ActionEnum = { 'none':0, 'up':1, 'down':2, 'left':3, 'right':4 };
    Object.freeze(ActionEnum);
    var lastAction = ActionEnum.none;
  
    function setup () {
      canv = document.getElementById('gc');
      ctx = canv.getContext('2d');
  
      game.reset();
    }
  
    var game = {
  
      reset: function () {
        ctx.fillStyle = 'grey';
        ctx.fillRect(0, 0, canv.width, canv.height);
  
        tail = INITIAL_TAIL;
        points = 0;
        velocity.x = 0;
        velocity.y = 0;
        player.x = INITIAL_PLAYER.x;
        player.y = INITIAL_PLAYER.y;
        // this.RandomFruit();
        reward = -1;
  
        lastAction = ActionEnum.none;
  
        trail = [];
        trail.push({ x: player.x, y: player.y });
        // for(var i=0; i<tail; i++) trail.push({ x: player.x, y: player.y });
      },
  
      action: {
        up: function () {
          if (lastAction != ActionEnum.down){
            velocity.x = 0;
            velocity.y = -1;
          }
        },
        down: function () {
          if (lastAction != ActionEnum.up){
            velocity.x = 0;
            velocity.y = 1;
          }
        },
        left: function () {
          if (lastAction != ActionEnum.right){
            velocity.x = -1;
            velocity.y = 0;
          }
        },
        right: function () {
          if (lastAction != ActionEnum.left){
            velocity.x = 1;
            velocity.y = 0;
          }
        }
      },
  
      RandomFruit: function () {
        if(walls){
          fruit.x = 1+Math.floor(Math.random() * (tileCount-2));
          fruit.y = 1+Math.floor(Math.random() * (tileCount-2));
        }
        else {
          fruit.x = Math.floor(Math.random() * tileCount);
          fruit.y = Math.floor(Math.random() * tileCount);
        }
      },
  
      log: function () {
        console.log('====================');
        console.log('x:' + player.x + ', y:' + player.y);
        console.log('tail:' + tail + ', trail.length:' + trail.length);
      },
  
      loop: function () {
  
        reward = -0.1;
  
        function DontHitWall () {
          if(player.x < 0) player.x = tileCount-1;
          if(player.x >= tileCount) player.x = 0;
          if(player.y < 0) player.y = tileCount-1;
          if(player.y >= tileCount) player.y = 0;
        }
        function HitWall () {
          if(player.x < 1) game.reset();
          if(player.x > tileCount-2) game.reset();
          if(player.y < 1) game.reset();
          if(player.y > tileCount-2) game.reset();
  
          ctx.fillStyle = 'grey';
          ctx.fillRect(0,0,gridSize-1,canv.height);
          ctx.fillRect(0,0,canv.width,gridSize-1);
          ctx.fillRect(canv.width-gridSize+1,0,gridSize,canv.height);
          ctx.fillRect(0, canv.height-gridSize+1,canv.width,gridSize);
        }
  
        var stopped = velocity.x == 0 && velocity.y == 0;
  
        player.x += velocity.x;
        player.y += velocity.y;
  
        if (velocity.x == 0 && velocity.y == -1) lastAction = ActionEnum.up;
        if (velocity.x == 0 && velocity.y == 1) lastAction = ActionEnum.down;
        if (velocity.x == -1 && velocity.y == 0) lastAction = ActionEnum.left;
        if (velocity.x == 1 && velocity.y == 0) lastAction = ActionEnum.right;
  
        ctx.fillStyle = 'rgba(40,40,40,0.8)';
        ctx.fillRect(0,0,canv.width,canv.height);
  
        if(walls) HitWall();
        else DontHitWall();
  
        // game.log();
  
        if (!stopped){
          trail.push({x:player.x, y:player.y});
          while(trail.length > tail) trail.shift();
        }
  
        if(!stopped) {
          ctx.fillStyle = 'rgba(200,200,200,0.2)';
          ctx.font = "small-caps 14px Helvetica";
          ctx.fillText("(esc) reset", 24, 356);
          ctx.fillText("(space) pause", 24, 374);
        }
  
        ctx.fillStyle = 'green';
        for(var i=0; i<trail.length-1; i++) {
          ctx.fillRect(trail[i].x * gridSize+1, trail[i].y * gridSize+1, gridSize-2, gridSize-2);
  
          // console.debug(i + ' => player:' + player.x, player.y + ', trail:' + trail[i].x, trail[i].y);
          if (!stopped && trail[i].x == player.x && trail[i].y == player.y){
            game.reset();
          }
          ctx.fillStyle = 'lime';
        }
        ctx.fillRect(trail[trail.length-1].x * gridSize+1, trail[trail.length-1].y * gridSize+1, gridSize-2, gridSize-2);
  
        if (player.x == fruit.x && player.y == fruit.y) {
          if(!fixedTail) tail++;
          points++;
          if(points > pointsMax) pointsMax = points;
          reward = 1;
          game.RandomFruit();
          // make sure new fruit didn't spawn in snake tail
          while((function () {
            for(var i=0; i<trail.length; i++) {
              if (trail[i].x == fruit.x && trail[i].y == fruit.y) {
                game.RandomFruit();
                return true;
              }
            }
            return false;
          })());
        }
  
        ctx.fillStyle = 'red';
        ctx.fillRect(fruit.x * gridSize+1, fruit.y * gridSize+1, gridSize-2, gridSize-2);
  
        if(stopped) {
          ctx.fillStyle = 'rgba(250,250,250,0.8)';
          ctx.font = "small-caps bold 14px Helvetica";
          ctx.fillText("press ARROW KEYS to START...", 24, 374);
        }
  
        ctx.fillStyle = 'white';
        ctx.font = "bold small-caps 16px Helvetica";
        ctx.fillText("points: " + points, 288, 40);
        ctx.fillText("top: " + pointsMax, 292, 60);
  
        return reward;
      }
    }
  
    function keyPush (evt) {
      switch(evt.keyCode) {
        case 37: //left
        game.action.left();
        evt.preventDefault();
        break;
  
        case 38: //up
        game.action.up();
        evt.preventDefault();
        break;
  
        case 39: //right
        game.action.right();
        evt.preventDefault();
        break;
  
        case 40: //down
        game.action.down();
        evt.preventDefault();
        break;
  
        case 32: //space
        Snake.pause();
        evt.preventDefault();
        break;
  
        case 27: //esc
        game.reset();
        evt.preventDefault();
        break;
      }
    }
  
    return {
      start: function (fps = 15) {
        window.onload = setup;
        intervalID = setInterval(game.loop, 1000 / fps);
      },
  
      loop: game.loop,
  
      reset: game.reset,
  
      stop: function () {
        clearInterval(intervalID);
      },
  
      setup: {
        keyboard: function (state) {
          if (state) {
            document.addEventListener('keydown', keyPush);
          } else {
            document.removeEventListener('keydown', keyPush);
          }
        },
        wall: function (state) {
          walls = state;
        },
        tileCount: function (size) {
          tileCount = size;
          gridSize = 400 / tileCount;
        },
        fixedTail: function (state) {
          fixedTail = state;
        }
      },
  
      action: function (act) {
        switch(act) {
          case 'left':
            game.action.left();
            break;
  
          case 'up':
            game.action.up();
            break;
  
          case 'right':
            game.action.right();
            break;
  
          case 'down':
            game.action.down();
            break;
        }
      },
  
      pause: function () {
        velocity.x = 0;
        velocity.y = 0;
      },
  
      clearTopScore: function () {
        pointsMax = 0;
      },
  
      data: {
        player: player,
        fruit: fruit,
        trail: function () {
          return trail;
        }
      },
  
      info: {
        tileCount: tileCount
      }
    };
  
  })();
  
  Snake.start(8);
  Snake.setup.keyboard(true);
  Snake.setup.fixedTail(false);


































// Snake.start(8); Snake.setup.keyboard(true); Snake.setup.fixedTail(false);logic of code


// The provided code is a JavaScript implementation of the classic game Snake. Here's a breakdown of the logic and components of the code:

// Variables and Constants

// INITIAL_TAIL: The initial length of the snake's tail.
// fixedTail: A boolean indicating whether the snake's tail should be fixed or not.
// intervalID: An identifier for the game loop interval.
// tileCount: The number of tiles in the game grid.
// gridSize: The size of each tile in the game grid.
// INITIAL_PLAYER: The initial position of the player (snake head).
// velocity: The current velocity of the snake (x and y components).
// player: The current position of the snake head.
// walls: A boolean indicating whether the game has walls or not.
// fruit: The current position of the fruit.
// trail: An array of positions representing the snake's tail.
// reward: The current reward for the game (used for scoring).
// points: The current score.
// pointsMax: The maximum score achieved so far.
// ActionEnum: An enumeration of possible actions (up, down, left, right, none).
// Game Logic

// The game has a setup function that initializes the game canvas and context.
// The game object has several methods:
// reset: Resets the game state to its initial values.
// action: Handles user input (up, down, left, right) and updates the snake's velocity accordingly.
// RandomFruit: Generates a new fruit position randomly.
// log: Logs the current game state to the console.
// loop: The main game loop, which updates the game state and renders the game board.
// The loop function:
// Updates the snake's position based on its velocity.
// Checks for collisions with walls (if enabled) and resets the game if necessary.
// Updates the trail array to reflect the snake's new position.
// Checks for collisions with the fruit and updates the score and fruit position if necessary.
// Renders the game board, including the snake, fruit, and score.
// The keyPush function handles keyboard input and updates the game state accordingly.
// API

// The Snake object has several methods:
// start: Starts the game loop with a specified frames per second (FPS) rate.
// loop: The main game loop.
// reset: Resets the game state.
// stop: Stops the game loop.
// setup: A namespace for setting up game options (keyboard input, walls, tile count, fixed tail).
// action: Performs a specific action (up, down, left, right).
// pause: Pauses the game.
// clearTopScore: Resets the maximum score.
// data: A namespace for accessing game data (player position, fruit position, trail).
// info: A namespace for accessing game information (tile count).
// Overall, the code implements a basic Snake game with features like scoring, fruit generation, and wall collisions.