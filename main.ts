namespace SpriteKind {
    export const physicalObject = SpriteKind.create()
    export const Pushable = SpriteKind.create()
}
/**
 * **GAME STATE VARIABLES**
 */
// **COLLISION FUNCTIONS** - Simplified for blocks
function preventWalkingThroughSprite (player2: Sprite, obstacle: Sprite) {
    if (player2.overlapsWith(obstacle)) {
        if (player2.bottom > obstacle.bottom) {
            if (player2.bottom - obstacle.bottom < collisionBuffer) {
                player2.bottom = obstacle.bottom + collisionBuffer
            }
        } else {
            if (obstacle.bottom - player2.bottom < collisionBuffer) {
                player2.bottom = obstacle.bottom - collisionBuffer
            }
        }
    }
}
// **ROCK PUSHING FUNCTION** - Simplified for blocks
function handleRockPushing () {
    if (tinyBlueOx.overlapsWith(rock)) {
        pushAmount = pushSpeed / 60
        // Check if aligned for vertical pushing
        canPushVertically = Math.abs(tinyBlueOx.x - rock.x) < rock.width + pushThreshold
        // Check if aligned for horizontal pushing
        canPushHorizontally = Math.abs(tinyBlueOx.y - rock.y) < rock.height + pushThreshold
        // Try vertical pushing
        if (canPushVertically) {
            if (controller.up.isPressed()) {
                newY = rock.y - pushAmount
                if (isWithinMapBounds(rock, rock.x, newY)) {
                    rock.y = newY
                    rockMoved = true
                    tinyBlueOx.y -= pushAmount * 0.5
                }
            }
            if (controller.down.isPressed()) {
                newY2 = rock.y + pushAmount
                if (isWithinMapBounds(rock, rock.x, newY2)) {
                    rock.y = newY2
                    rockMoved = true
                    tinyBlueOx.y += pushAmount * 0.5
                }
            }
        }
        // Try horizontal pushing
        if (canPushHorizontally) {
            if (controller.left.isPressed()) {
                newX = rock.x - pushAmount
                if (isWithinMapBounds(rock, newX, rock.y)) {
                    rock.x = newX
                    rockMoved = true
                    tinyBlueOx.x -= pushAmount * 0.5
                }
            }
            if (controller.right.isPressed()) {
                newX2 = rock.x + pushAmount
                if (isWithinMapBounds(rock, newX2, rock.y)) {
                    rock.x = newX2
                    rockMoved = true
                    tinyBlueOx.x += pushAmount * 0.5
                }
            }
        }
    }
}
controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
    isBoosting = true
    updatePlayerSpeed()
})
// **CONTROL EVENTS** - Standard MakeCode blocks
controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    tryToJump()
})
function checkIfFallingOffRock () {
    if (isOnObject) {
        // Check all directions: left, right, front
        if (tinyBlueOx.x < rock.left) {
            fellOff = true
        }
        if (tinyBlueOx.x > rock.right) {
            fellOff = true
        }
        if (tinyBlueOx.y > rock.bottom) {
            fellOff = true
        }
        if (fellOff) {
            isJumping = true
            isOnObject = false
            verticalVelocity = 0
            currentGroundLevel = rock.bottom - fallOffset
        }
    }
}
function tryToJump () {
    if (!(isJumping)) {
        isJumping = true
        isOnObject = false
        currentGroundLevel = tinyBlueOx.bottom
        verticalVelocity = jumpPower
    }
}
function checkIfFallingBehindRock () {
    if (isOnObject) {
        if (controller.up.isPressed()) {
            if (tinyBlueOx.y < rock.top) {
                isJumping = false
                isOnObject = false
                isFallingBehindRock = true
                verticalVelocity = 2
                currentGroundLevel = rock.bottom - fallOffset
            }
        }
    }
}
// **DEPTH ORDERING** - Simple function
function updateSpriteDepths () {
    tinyBlueOx.z = tinyBlueOx.bottom
    rock.z = rock.bottom
    tree.z = tree.bottom
}
// **SIMPLE HELPER FUNCTIONS** - Block-friendly
function isWithinMapBounds (sprite: Sprite, newX: number, newY: number) {
    halfWidth = sprite.width / 2
    halfHeight = sprite.height / 2
    if (newX - halfWidth < 0) {
        return false
    }
    if (newX + halfWidth > tilemapWidth) {
        return false
    }
    if (newY - halfHeight < 0) {
        return false
    }
    if (newY + halfHeight > tilemapHeight) {
        return false
    }
    return true
}
// **PHYSICS FUNCTIONS** - Simple and clear
function handleJumping () {
    if (isJumping || isFallingBehindRock) {
        verticalVelocity += gravity
        tinyBlueOx.y += verticalVelocity
        // Check for landing
        if (tinyBlueOx.bottom >= currentGroundLevel) {
            tinyBlueOx.bottom = currentGroundLevel
            verticalVelocity = 0
            isJumping = false
            isFallingBehindRock = false
            isOnObject = false
        }
    }
}
function updatePlayerSpeed () {
    if (isBoosting) {
        controller.moveSprite(tinyBlueOx, boostSpeedX, boostSpeedY)
    } else {
        controller.moveSprite(tinyBlueOx, playerSpeedX, playerSpeedY)
    }
}
controller.B.onEvent(ControllerButtonEvent.Released, function () {
    isBoosting = false
    updatePlayerSpeed()
})
function checkIfLandingOnRock () {
    if (!(isFallingBehindRock)) {
        if (tinyBlueOx.overlapsWith(rock)) {
            if (verticalVelocity > 0) {
                if (tinyBlueOx.bottom >= rock.top) {
                    tinyBlueOx.bottom = rock.top
                    verticalVelocity = 0
                    isJumping = false
                    isOnObject = true
                    currentGroundLevel = rock.top
                }
            }
        }
    }
}
let halfHeight = 0
let halfWidth = 0
let isFallingBehindRock = false
let verticalVelocity = 0
let isJumping = false
let fellOff = false
let isOnObject = false
let isBoosting = false
let newX2 = 0
let newX = 0
let newY2 = 0
let rockMoved = false
let newY = 0
let canPushHorizontally = false
let canPushVertically = false
let rock: Sprite = null
let tree: Sprite = null
let currentGroundLevel = 0
let tilemapHeight = 0
let tilemapWidth = 0
let collisionBuffer = 0
let fallOffset = 0
let pushThreshold = 0
let pushSpeed = 0
let boostSpeedY = 0
let boostSpeedX = 0
let playerSpeedY = 0
let playerSpeedX = 0
let jumpPower = 0
let gravity = 0
// **GAME OBJECTS**
let tinyBlueOx: Sprite = null
let pushAmount = 0
// **TUNABLE VARIABLES** - Easy to adjust in blocks mode
gravity = 2
jumpPower = -14
playerSpeedX = 85
playerSpeedY = 60
boostSpeedX = 120
boostSpeedY = 80
pushSpeed = 40
pushThreshold = 6
fallOffset = 4
collisionBuffer = 2
let defaultGroundLevel = 87
tilemapWidth = 800
tilemapHeight = 600
currentGroundLevel = 87
// **MAIN GAME SETUP** - Uses standard MakeCode patterns
tree = sprites.create(assets.image`myImage`, SpriteKind.physicalObject)
tree.setPosition(44, 87)
rock = sprites.create(assets.image`myImage0`, SpriteKind.Pushable)
rock.setPosition(118, 87)
tinyBlueOx = sprites.create(assets.image`myImage1`, SpriteKind.Player)
tinyBlueOx.setPosition(108, 86)
tinyBlueOx.z = 100
// Set initial player speed
controller.moveSprite(tinyBlueOx, playerSpeedX, playerSpeedY)
scene.cameraFollowSprite(tinyBlueOx)
tiles.setCurrentTilemap(tilemap`level2`)
let textSprite = textsprite.create("", 0, 1)
// Set initial ground level and depths
currentGroundLevel = defaultGroundLevel
updateSpriteDepths()
// **MAIN GAME LOOP** - Standard MakeCode forever loop
game.onUpdate(function () {
    // Handle physics
    handleJumping()
    // Handle collisions and interactions
    checkIfLandingOnRock()
    checkIfFallingOffRock()
    checkIfFallingBehindRock()
    // Handle rock pushing
    handleRockPushing()
    // Prevent walking through objects
    preventWalkingThroughSprite(tinyBlueOx, rock)
    preventWalkingThroughSprite(tinyBlueOx, tree)
    // Update visual depth ordering
    updateSpriteDepths()
    // Update debug display
    textSprite.setText("Rock Y: " + Math.round(rock.y))
})
