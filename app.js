var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'phaser-example', { preload: preload, create: create, update: update, render: render });

var myUsername = 'Gedos';

var socket = io();

const otherUsers = {};

function preload() {
    game.load.image('background','assets/debug-grid.png');
    game.load.image('bullet', 'assets/bullet.png');
    game.load.image('ship', 'assets/ship.png');

}

var sprite;
var weapon;
var cursors;
var fireButton;

function create() {
  game.add.tileSprite(0, 0, 1920, 1920, 'background');

game.world.setBounds(0, 0, 1920, 1920);

    //  Creates 30 bullets, using the 'bullet' graphic
    weapon = game.add.weapon(30, 'bullet');

    //  The bullet will be automatically killed when it leaves the world bounds
    weapon.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;

    //  The speed at which the bullet is fired
    weapon.bulletSpeed = 600;

    //  Speed-up the rate of fire, allowing them to shoot 1 bullet every 60ms
    weapon.fireRate = 100;

    sprite = this.add.sprite(400, 300, 'ship');

    sprite.anchor.set(0.5);

    game.physics.arcade.enable(sprite);

    sprite.body.drag.set(70);
    sprite.body.maxVelocity.set(200);

    //  Tell the Weapon to track the 'player' Sprite
    //  With no offsets from the position
    //  But the 'true' argument tells the weapon to track sprite rotation
    weapon.trackSprite(sprite, 0, 0, true);

    cursors = this.input.keyboard.createCursorKeys();

    fireButton = this.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);

    game.camera.follow(sprite);

    socket.emit('newPlayer', myUsername, sprite.x, sprite.y);
    socket.on('newPlayer', (username, xPos, yPos) => {
      newShip = this.add.sprite(400, 300, 'ship');
      newShip.x = xPos;
      newShip.y = yPos;
      otherUsers[username] = newShip;
    });

    socket.on('location', (username, xPos, yPos) => {
      otherUsers[username].x = xPos;
      otherUsers[username].y = yPos;
    });

}

function update() {

    if (cursors.up.isDown)
    {
        game.physics.arcade.accelerationFromRotation(sprite.rotation, 300, sprite.body.acceleration);
    }
    else
    {
        sprite.body.acceleration.set(0);
    }

    if (cursors.left.isDown)
    {
        sprite.body.angularVelocity = -300;
    }
    else if (cursors.right.isDown)
    {
        sprite.body.angularVelocity = 300;
    }
    else
    {
        sprite.body.angularVelocity = 0;
    }

    if (fireButton.isDown)
    {
        weapon.fire();
    }

    game.world.wrap(sprite, 16);

    socket.emit('location', myUsername, sprite.x, sprite.y);
    console.log(otherUsers);
}

function render() {

    weapon.debug();

}
