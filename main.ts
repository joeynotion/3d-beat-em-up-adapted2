namespace SpriteKind {
    export const physicalObject = SpriteKind.create()
    export const Pushable = SpriteKind.create()
    export const Destructible = SpriteKind.create()
}
/**
 * **GAME STATE VARIABLES**
 */
function createInteractableSprite (objectSprite: Sprite, jumpHeightPixels: number, moveable: boolean, destructible: boolean) {
    interactableSprites.push(objectSprite)
    interactableJumpHeights.push(jumpHeightPixels)
    interactableMoveable.push(moveable)
    interactableDestructible.push(destructible)
}
function getInteractableIndex (target: Sprite) {
    for (let index = 0; index <= interactableSprites.length - 1; index++) {
        if (interactableSprites[index] == target) {
            return index
        }
    }
    return -1
}
function getInteractableSurfaceY (target: Sprite) {
    let objectIndex2 = getInteractableIndex(target)
    if (objectIndex2 >= 0) {
        return target.bottom - interactableJumpHeights[objectIndex2]
    }
    return target.top
}
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
function handleSpritePushing (pushableSprite: Sprite) {
    if (tinyBlueOx.overlapsWith(pushableSprite)) {
        pushAmount = pushSpeed / 60
        // Check if aligned for vertical pushing
        canPushVertically = Math.abs(tinyBlueOx.x - pushableSprite.x) < pushableSprite.width + pushThreshold
        // Check if aligned for horizontal pushing
        canPushHorizontally = Math.abs(tinyBlueOx.y - pushableSprite.y) < pushableSprite.height + pushThreshold
        // Try vertical pushing
        if (canPushVertically) {
            if (controller.up.isPressed()) {
                newY = pushableSprite.y - pushAmount
                if (isWithinMapBounds(pushableSprite, pushableSprite.x, newY)) {
                    pushableSprite.y = newY
                    rockMoved = true
                    tinyBlueOx.y -= pushAmount * 0.5
                }
            }
            if (controller.down.isPressed()) {
                newY2 = pushableSprite.y + pushAmount
                if (isWithinMapBounds(pushableSprite, pushableSprite.x, newY2)) {
                    pushableSprite.y = newY2
                    rockMoved = true
                    tinyBlueOx.y += pushAmount * 0.5
                }
            }
        }
        // Try horizontal pushing
        if (canPushHorizontally) {
            if (controller.left.isPressed()) {
                newX = pushableSprite.x - pushAmount
                if (isWithinMapBounds(pushableSprite, newX, pushableSprite.y)) {
                    pushableSprite.x = newX
                    rockMoved = true
                    tinyBlueOx.x -= pushAmount * 0.5
                }
            }
            if (controller.right.isPressed()) {
                newX2 = pushableSprite.x + pushAmount
                if (isWithinMapBounds(pushableSprite, newX2, pushableSprite.y)) {
                    pushableSprite.x = newX2
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
        fellOff = false
        let activeSprite = currentPlatformSprite
        if (!(activeSprite)) {
            return
        }
        // Check all directions: left, right, front
        if (tinyBlueOx.x < activeSprite.left) {
            fellOff = true
        }
        if (tinyBlueOx.x > activeSprite.right) {
            fellOff = true
        }
        if (tinyBlueOx.y > activeSprite.bottom) {
            fellOff = true
        }
        if (fellOff) {
            isJumping = true
            isOnObject = false
            verticalVelocity = 0
            currentGroundLevel = activeSprite.bottom - fallOffset
            currentPlatformSprite = null
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
        let activeSprite2 = currentPlatformSprite
        if (!(activeSprite2)) {
            return
        }
        if (controller.up.isPressed()) {
            if (tinyBlueOx.y < activeSprite2.top) {
                isJumping = false
                isOnObject = false
                isFallingBehindRock = true
                verticalVelocity = 2
                currentGroundLevel = activeSprite2.bottom - fallOffset
                currentPlatformSprite = null
            }
        }
    }
}
// **DEPTH ORDERING** - Simple function
function updateSpriteDepths () {
    tinyBlueOx.z = tinyBlueOx.bottom
    for (let value of interactableSprites) {
        value.z = value.bottom
    }
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
function checkIfLandingOnInteractable () {
    if (!(isFallingBehindRock)) {
        for (let landingSprite of interactableSprites) {
            if (tinyBlueOx.overlapsWith(landingSprite)) {
                if (verticalVelocity > 0) {
                    let surfaceY = getInteractableSurfaceY(landingSprite)
                    if (tinyBlueOx.bottom >= surfaceY) {
                        tinyBlueOx.bottom = surfaceY
                        verticalVelocity = 0
                        isJumping = false
                        isOnObject = true
                        currentGroundLevel = surfaceY
                        currentPlatformSprite = landingSprite
                    }
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
let currentPlatformSprite: Sprite = null
let interactableDestructible: boolean[] = []
let interactableMoveable: boolean[] = []
let interactableJumpHeights: number[] = []
let interactableSprites: Sprite[] = []
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
createInteractableSprite(rock, 8, true, false)
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
    checkIfLandingOnInteractable()
    checkIfFallingOffRock()
    checkIfFallingBehindRock()
    // Handle interactable pushing and collisions
    for (let value2 of interactableSprites) {
        let objectIndex = getInteractableIndex(value2)
        if (objectIndex >= 0) {
            if (interactableMoveable[objectIndex]) {
                handleSpritePushing(value2)
            }
        }
        preventWalkingThroughSprite(tinyBlueOx, value2)
    }
    // Prevent walking through objects
    preventWalkingThroughSprite(tinyBlueOx, tree)
    // Update visual depth ordering
    updateSpriteDepths()
    // Update debug display
    textSprite.setText("Rock Y: " + Math.round(rock.y))
})
