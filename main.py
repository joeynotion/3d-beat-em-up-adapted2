@namespace
class SpriteKind:
    physicalObject = SpriteKind.create()
    Pushable = SpriteKind.create()
"""

Movement & jump variables

"""
"""

Declare variables

"""
def dontWalkThroughTree():
    if tinyBlueOx.overlaps_with(tree):
        if tinyBlueOx.bottom > tree.bottom:
            if tinyBlueOx.bottom - tree.bottom < 2:
                tinyBlueOx.bottom = tree.bottom + 2
        else:
            if tree.bottom - tinyBlueOx.bottom < 2:
                tinyBlueOx.bottom = tree.bottom - 2
# Jump function

def on_a_pressed():
    global isJumping, isOnObject, currentGroundLevel, vy
    if not (isJumping):
        isJumping = True
        # Prevent sticking to an object
        isOnObject = False
        # Store the height before jumping
        currentGroundLevel = tinyBlueOx.bottom
        vy = jumpPower
controller.A.on_event(ControllerButtonEvent.PRESSED, on_a_pressed)

# **NEW: Rock Pushing (Fixed Side Pushing & Prevented Sliding)**
def pushRock():
    global pushSpeed, originalX, originalY, rockMoved
    if tinyBlueOx.overlaps_with(rock):
        # The rock moves at a slower speed than the player
        pushSpeed = 40
        # Track if the rock moved
        # **Temporarily disable collision blocking while pushing**
        originalX = tinyBlueOx.x
        originalY = tinyBlueOx.y
        # **Vertical Pushing (Up/Down)**
        if abs(tinyBlueOx.z - rock.z) < pushThreshold:
            if controller.up.is_pressed() and rock.top - pushSpeed / 60 > 0:
                rock.y -= pushSpeed / 60
                rockMoved = True
            if controller.down.is_pressed() and rock.bottom + pushSpeed / 60 < scene.screen_height():
                rock.y += pushSpeed / 60
                rockMoved = True
        # **Horizontal Pushing (Left/Right)**
        if abs(tinyBlueOx.y - rock.y) < rock.height / 2 + pushThreshold:
            if controller.left.is_pressed() and rock.left - pushSpeed / 60 > 0:
                rock.x -= pushSpeed / 60
                rockMoved = True
            if controller.right.is_pressed() and rock.right + pushSpeed / 60 < scene.screen_width():
                rock.x += pushSpeed / 60
                rockMoved = True
        # **Prevent Player From Sliding Off the Rock**
        if rockMoved:
            # Keep player against the rock
            tinyBlueOx.x = originalX
            # Prevent unintended movement away from the rock
            tinyBlueOx.y = originalY
# **Landing on objects dynamically updates where the player stands**
def checkLandingOnObjects():
    global vy, isJumping, isOnObject, currentGroundLevel
    if not (isFallingBehindRock) and tinyBlueOx.overlaps_with(rock) and vy > 0 and tinyBlueOx.bottom >= rock.top:
        tinyBlueOx.bottom = rock.top
        vy = 0
        isJumping = False
        # Mark that the player is standing on an object
        isOnObject = True
        # Update ground level to the rock height
        currentGroundLevel = rock.top
# **Properly Drop Off the Back of the Rock Without Re-Locking**
def checkForFallingBehindRock():
    global isJumping, isOnObject, isFallingBehindRock, vy, currentGroundLevel
    if isOnObject:
        # If the player moves up off the rock
        if controller.up.is_pressed() and tinyBlueOx.y < rock.top:
            # Disable jump logic
            isJumping = False
            # Make sure they are no longer "on" the rock
            isOnObject = False
            # NEW: Mark as falling behind the rock
            isFallingBehindRock = True
            # Apply small downward force immediately
            vy = 2
            # Set smooth transition height
            currentGroundLevel = rock.bottom - fallOffset
# Gravity & jumping logic
def applyJumpPhysics():
    global vy, isJumping, isFallingBehindRock, isOnObject
    if isJumping or isFallingBehindRock:
        vy += gravity
        tinyBlueOx.y += vy
        # Stop falling when reaching stored ground level
        if tinyBlueOx.bottom >= currentGroundLevel:
            tinyBlueOx.bottom = currentGroundLevel
            vy = 0
            isJumping = False
            # Reset fall state
            isFallingBehindRock = False
            # Reset object state when landing
            isOnObject = False
# **Ensure natural z-depth positioning**
def updateLayering():
    # Let the existing system handle depth naturally
    tinyBlueOx.z = tinyBlueOx.bottom
    # Ensure rock maintains correct depth ordering
    rock.z = rock.bottom
# **Prevent walking through objects using the original system**
def dontWalkThroughRock():
    if tinyBlueOx.overlaps_with(rock):
        if tinyBlueOx.bottom > rock.bottom:
            if tinyBlueOx.bottom - rock.bottom < 2:
                tinyBlueOx.bottom = rock.bottom + 2
        else:
            if rock.bottom - tinyBlueOx.bottom < 2:
                tinyBlueOx.bottom = rock.bottom - 2
# **Detect stepping off objects properly and dynamically update ground level**
def checkForFallingOffObjects():
    global isJumping, isOnObject, vy, currentGroundLevel
    if isOnObject:
        # If the player's X position is no longer above the rock, they should fall
        if tinyBlueOx.x < rock.left or tinyBlueOx.x > rock.right:
            # Start falling
            isJumping = True
            isOnObject = False
            # Reset vertical velocity
            vy = 0
            # Set smooth landing height
            currentGroundLevel = rock.bottom - fallOffset
isFallingBehindRock = False
rockMoved = False
originalY = 0
originalX = 0
pushSpeed = 0
vy = 0
isOnObject = False
isJumping = False
tinyBlueOx: Sprite = None
tree: Sprite = None
pushThreshold = 0
fallOffset = 0
currentGroundLevel = 0
jumpPower = 0
gravity = 0
rock: Sprite = None
# Shared gravity for jumping and falling
gravity = 2
jumpPower = -14
# Prevents re-locking on the rock
# Default ground level, updates dynamically
currentGroundLevel = 87
# Tracks if the player is standing on an object
# Offset for smooth landing when walking off the side of the rock
fallOffset = 4
# Allows slight misalignment for pushing
pushThreshold = 6
# Initialize objects
tree = sprites.create(assets.image("""
        myImage
        """),
    SpriteKind.physicalObject)
tree.set_position(44, 87)
tree.z = tree.bottom
# Now pushable!
rock = sprites.create(assets.image("""
    myImage0
    """), SpriteKind.Pushable)
rock.set_position(118, 87)
rock.z = rock.bottom
tinyBlueOx = sprites.create(assets.image("""
    myImage1
    """), SpriteKind.player)
tinyBlueOx.set_position(108, 86)
tinyBlueOx.z = 100
# Allow free movement
controller.move_sprite(tinyBlueOx, 85, 60)
scene.camera_follow_sprite(tinyBlueOx)
tiles.set_current_tilemap(tilemap("""
    level2
    """))
textSprite = textsprite.create("", 0, 1)
# Game loop

def on_on_update():
    applyJumpPhysics()
    checkLandingOnObjects()
    checkForFallingOffObjects()
    checkForFallingBehindRock()
    # NEW: Handles rock pushing (fixed downward stop and side pushing)
    pushRock()
    dontWalkThroughRock()
    dontWalkThroughTree()
    # Ensure correct z-ordering
    updateLayering()
    textSprite.set_text(convert_to_text(rock.y))
game.on_update(on_on_update)
