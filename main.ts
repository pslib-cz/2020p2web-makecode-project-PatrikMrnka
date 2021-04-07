namespace SpriteKind {
    export const Coin = SpriteKind.create()
    export const Spawn = SpriteKind.create()
    export const Fireball = SpriteKind.create()
    export const Princess = SpriteKind.create()
}

function startIntroduction () //initialize starting instructions
{
    scene.setBackgroundImage(assets.image`doomBackground`)
    game.setDialogFrame(assets.image`introductionFrame`)
    game.setDialogCursor(assets.image`introductionSword`)
    startInstruction()
}
function startInstruction () //starting instructions
{
    game.showLongText("Welcome to the game!", DialogLayout.Bottom)
    game.showLongText("Move with the left and right buttons.", DialogLayout.Bottom)
    game.showLongText("Jump with A or up button.", DialogLayout.Bottom)
    game.showLongText("Shoot with B button.", DialogLayout.Bottom)
    game.showLongText("Collect shoes along the way for the princess.", DialogLayout.Bottom)
    game.showLongText("Avoid the eggs!", DialogLayout.Bottom)
    game.showLongText("Your main objective...", DialogLayout.Bottom)
    game.showLongText("Save the princess in hell from dragons!", DialogLayout.Bottom)
}

//start introduction call
startIntroduction()

function startNextLevel () {
    //level settings
    if (myLevel == 0) {
        tiles.setTilemap(tilemap`level1`)
    } else if (myLevel == 1) {
        tiles.setTilemap(tilemap`level2`)
    } else if (myLevel == 2) {
        tiles.setTilemap(tilemap`level3`)
    } else {
        game.over(true, effects.confetti)
    }

    //hero settings
    info.setLife(6) //health count

    //scene settings
    // scene.setBackgroundColor(9) //background color
    scene.setBackgroundImage(assets.image`doomBackground`)
    scene.cameraFollowSprite(myHero) //camera following myHero

    for (let value of sprites.allOfKind(SpriteKind.Coin)) { //destroying all coins from the level before after entering portal to the next level
        value.destroy()
    }
    for (let value of sprites.allOfKind(SpriteKind.Enemy)) { //destroying all enemy from the level before after entering portal to the next level
        value.destroy()
    }
    for (let value of sprites.allOfKind(SpriteKind.Spawn)) { //destroying all spawns from the level before after entering portal to the next level
        value.destroy()
    }

    //hero spawning
    tiles.placeOnRandomTile(myHero, assets.tile`spawnBlock`) //place hero on spawnBlock
    for (let value of tiles.getTilesByType(assets.tile`spawnBlock`)) { //get array of all spawnBlock locations for spawning hero
        tiles.setTileAt(value, assets.tile`transparency16`) //set transparent block instead of spawnBlock
    }

    //Enemy spawn settings
    for (let value of tiles.getTilesByType(assets.tile`spawnEnemyBlock`)) { //get array of all spawnEnemyBlock locations for spawning Enemy
        mySpawn = sprites.create(assets.image`dragonEgg`, SpriteKind.Spawn)
        tiles.placeOnTile(mySpawn, value) //placing spawn on all spawnEnemyBlock locations
        tiles.setTileAt(value, assets.tile`transparency16`) //set transparent block instead of spawnEnemyBlock
    }

    //Fireball spawn settings
    for (let value of tiles.getTilesByType(assets.tile`fireBall`)) { //get array of all fireBall locations for spawning Enemy
    myFireBall = sprites.create(assets.tile`fireBall`, SpriteKind.Fireball)
    tiles.placeOnTile(myFireBall, value) //placing spawn on all fireBall locations
        animation.runMovementAnimation(myFireBall, "c 0 -100 0 100 0 0", 2500, true)
        myFireBall.startEffect(effects.fire)
        tiles.setTileAt(value, assets.tile`transparency16`) //set transparent block instead of fireBall
    }

    //Princess spawn settings
    for (let value of tiles.getTilesByType(assets.tile`princessBlock`)) { //get array of all princessBlock locations for spawning Enemy
        myPrincess = sprites.create(assets.image`princessHero`, SpriteKind.Princess)
        tiles.placeOnTile(myPrincess, value) //placing spawn on all princessBlock locations
        tiles.setTileAt(value, assets.tile`transparency16`) //set transparent block instead of princessBlock
        myPrincess.say("Thank you!")
}

    //coin settings
    for (let value of tiles.getTilesByType(assets.tile`coinBlock`)) { //get array of all coinBLock locations for spawning coins
        myCoin = sprites.create(assets.image`shoeCoin`, SpriteKind.Coin)
        tiles.placeOnTile(myCoin, value) //placing coin on all coinBlock locations
        tiles.setTileAt(value, assets.tile`transparency16`) //set transparent block instead of coinBlock
        animation.runImageAnimation( //coin frames
        myCoin,
        assets.animation`shoeAnimation`,
        100, //duration every frame
        true //loop yes
        )
    }
}

//Overlaps

sprites.onOverlap(SpriteKind.Player, SpriteKind.Coin, function (sprite, otherSprite) {
    info.changeScoreBy(3) // score + 3 when overlaps with coin
    otherSprite.destroy() // destroy coin when overlaps
    music.baDing.play() //play baDing when overlaps
})

sprites.onOverlap(SpriteKind.Player, SpriteKind.Spawn, function (sprite, otherSprite) {
    myDragon = sprites.create(assets.image`dragonEnemy`, SpriteKind.Enemy)
    otherSprite.destroy(effects.fire, 200) //destroy dragon when overlaps
    animation.runImageAnimation(
        myDragon,
        assets.animation`dragonAnimation`,
        100, //duration frame
        true //loop yes
    )
    myDragon.setPosition(myHero.x + 80, myHero.y - 80) //dragon spawn position
    myDragon.follow(myHero, 75) //dragon follows myHero with 75 speed
})

sprites.onOverlap(SpriteKind.Player, SpriteKind.Enemy, function (sprite, otherSprite) {
    otherSprite.destroy(effects.fire, 300)
    if (myHero.y < otherSprite.y) { //if myHero is higher thand dragon, kill dragon
        info.changeScoreBy(5)
        info.changeLifeBy(1)
    }
    else {
        info.changeLifeBy(-1)
    }
})

scene.onOverlapTile(SpriteKind.Player, assets.tile`deadBlock`, function (sprite, location) {
    game.over(false, effects.melt)
})

scene.onOverlapTile(SpriteKind.Player, (assets.tile`portalBlock`) , function (sprite, location) {
    myLevel += 1
    startNextLevel()
})

sprites.onOverlap(SpriteKind.Player, SpriteKind.Fireball, function (sprite, otherSprite) {
    info.changeLifeBy(-1)
    otherSprite.destroy(effects.fire)
})

sprites.onOverlap(SpriteKind.Enemy, SpriteKind.Projectile, function (sprite, otherSprite) {
    info.changeScoreBy(2)
    sprite.destroy(effects.fire, 500)
    otherSprite.destroy(effects.fire, 500)
})

let myDragon: Sprite = null
let mySpawn: Sprite = null
let myCoin: Sprite = null
let myHero: Sprite = null
let myLevel = 0
let myProjectile: Sprite = null
let myFireBall: Sprite = null
let myPrincess: Sprite = null

//hero settings default
myHero = sprites.create(assets.image`princeHeroFront`, SpriteKind.Player)
controller.moveSprite(myHero, 100, 0)
myHero.setBounceOnWall(false)


//hero moving
game.onUpdate(function () {
    myHero.setImage(assets.image`princeHeroFront`)
    if (myHero.vy < 0) {
        myHero.setImage(assets.image`princeHeroJump`)
    } else if (myHero.vy > 1) {
        myHero.setImage(assets.image`princeHeroFall`)
    } else if (controller.left.isPressed()) {
        myHero.setImage(assets.image`princeHeroLeft`)
    } else if (controller.right.isPressed()) {
        myHero.setImage(assets.image`princeHeroRight`)
    }

    //wall jump
    if ((myHero.isHittingTile(CollisionDirection.Left) || myHero.isHittingTile(CollisionDirection.Right)) && (myHero.vy >= 0)) {
        myHero.vy = 0
        myHero.ay = 0
        myHero.setImage(assets.image`princeClimb`)
    } else {
        myHero.ay = 350 //hero acceleration on y 
    }
    if (myHero.isHittingTile(CollisionDirection.Left)) {
        myHero.image.flipX()
        myHero.setImage(myHero.image)
    }
})

//hero jump
controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    if (myHero.vy == 0) {
        myHero.vy = -150
    }
})

//hero firing
controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
    if (controller.left.isPressed()) {
        myProjectile = sprites.createProjectileFromSprite(assets.image`projectileHero`, myHero, -400, -100)
    } else if (controller.right.isPressed()) {
        myProjectile = sprites.createProjectileFromSprite(assets.image`projectileHero`, myHero, 400, -100)
    } else if (controller.up.isPressed()) {
        myProjectile = sprites.createProjectileFromSprite(assets.image`projectileHero`, myHero, 0, -150)
    } else {
        myProjectile = sprites.createProjectileFromSprite(assets.image`projectileHero`, myHero, 300, -100)
    }
    myProjectile.startEffect(effects.warmRadial)
})

startNextLevel()