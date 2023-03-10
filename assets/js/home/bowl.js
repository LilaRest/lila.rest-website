window.addEventListener("load", function () {

  // Variables & Constants
  const b = document.querySelector("#bowl");
  let bLeft = 0;
  let bTop = innerHeight;
  let bSize = 100;
  let bMaxVelocity = 20;
  let bInertia = 10 / 100; // In percentage (%)
  let bImpactEnergyLoss = 25 / 100;

  let dirs = {
    up: {
      pressed: false,
      velocity: 0,
      bound: 0
    },
    down: {
      pressed: false,
      velocity: 0,
      bound: 0
    },
    right: {
      pressed: false,
      velocity: 0,
      bound: 0
    },
    left: {
      pressed: false,
      velocity: 0,
      bound: 0
    }
  };
  let lastMovementInterval = null;

  // Initialize bowl position and size
  b.style.left = bLeft + "px";
  b.style.top = bTop + "px";
  b.style.height = bSize + "px";
  b.style.width = bSize + "px";


  function updateBounds () {
    dirs.up.bound = scrollY;
    dirs.right.bound = scrollX + innerWidth - bSize;
    dirs.down.bound = scrollY + innerHeight - bSize;
    dirs.left.bound = scrollX;
  }
  updateBounds();


  function apply (dir) {
    switch (dir) {
      case "up":
        bTop -= dirs[dir].velocity;
        break;
      case "right":
        bLeft += dirs[dir].velocity;
        break;
      case "down":
        bTop += dirs[dir].velocity;
        break;
      case "left":
        bLeft -= dirs[dir].velocity;
        break;
    }
  }

  function updatePosition () {
    updateBounds();

    const oldBTtop = bTop;
    const oldBLeft = bLeft;

    for (const dir of ["up", "right", "down", "left"]) {
      if (dirs[dir].pressed) {
        if (dirs[dir].velocity >= 0.1) {
          const newVelocity = dirs[dir].velocity *= 1 + bInertia;
          if (newVelocity > bMaxVelocity) dirs[dir].velocity = bMaxVelocity;
          else dirs[dir].velocity = newVelocity;
        }
        else dirs[dir].velocity = 0.1;
        apply(dir);
      }
      else if (dirs[dir].velocity >= 0.1) {
        dirs[dir].velocity /= 1 + bInertia;
        apply(dir);
      }
    }

    // Prevent the bowl from crossing bounds and handle bouncing
    if (bTop <= dirs.up.bound) {
      bTop = dirs.up.bound;
      dirs.down.velocity = dirs.up.velocity / (1 + bImpactEnergyLoss);
      // if (dirs.down.velocity < 0.5) dirs.down.velocity = 0;
      dirs.up.velocity = 0;
    }
    else if (bTop >= dirs.down.bound) {
      bTop = dirs.down.bound;
      dirs.up.velocity = dirs.down.velocity / (1 + bImpactEnergyLoss);
      // if (dirs.up.velocity < 0.5) dirs.up.velocity = 0;
      dirs.down.velocity = 0;
    }

    if (bLeft <= dirs.left.bound) {
      bLeft = dirs.left.bound;
      dirs.right.velocity = dirs.left.velocity / (1 + bImpactEnergyLoss);
      // if (dirs.right.velocity < 0.5) dirs.right.velocity = 0;
      dirs.left.velocity = 0;
    }
    else if (bLeft >= dirs.right.bound) {
      bLeft = dirs.right.bound;
      dirs.left.velocity = dirs.right.velocity / (1 + bImpactEnergyLoss);
      if (dirs.left.velocity < 0.5) dirs.left.velocity = 0;
      dirs.right.velocity = 0;
    }

    if (bTop === oldBTtop && bLeft === oldBLeft) clearInterval(lastMovementInterval);
    else {
      b.style.top = bTop + "px";
      b.style.left = bLeft + "px";

      // Fit near angles
      // - Top-left
      if (bTop < dirs.up.bound + 10 && bLeft < dirs.left.bound + 10) b.style.borderTopLeftRadius = "15px";
      else b.style.borderTopLeftRadius = "100%";

      // - Top-right
      if (bTop < dirs.up.bound + 10 && bLeft > dirs.right.bound - 10) b.style.borderTopRightRadius = "15px";
      else b.style.borderTopRightRadius = "100%";

      // - Bottom-left
      if (bTop > dirs.down.bound - 10 && bLeft < dirs.left.bound + 10) b.style.borderBottomLeftRadius = "15px";
      else b.style.borderBottomLeftRadius = "100%";

      // - Bottom-right
      if (bTop > dirs.down.bound - 10 && bLeft > dirs.right.bound - 10) b.style.borderBottomRightRadius = "15px";
      else b.style.borderBottomRightRadius = "100%";
    }
  }


  function updateMovement () {
    if (lastMovementInterval) clearInterval(lastMovementInterval);
    lastMovementInterval = setInterval(updatePosition, 10);
  }

  function onKeyEvent (e) {
    let pressedKeysChange = true;
    const newState = e.type === "keydown" ? true : false;

    // Update new pressed key states
    if (e.key === "ArrowUp" && dirs.up.pressed !== newState)
      dirs.up.pressed = newState;
    else if (e.key === "ArrowRight" && dirs.right.pressed !== newState)
      dirs.right.pressed = newState;
    else if (e.key === "ArrowDown" && dirs.down.pressed !== newState)
      dirs.down.pressed = newState;
    else if (e.key === "ArrowLeft" && dirs.left.pressed !== newState)
      dirs.left.pressed = newState;
    else pressedKeysChange = false;

    // If a key press has changed, update the bowl movement
    if (pressedKeysChange) updateMovement();
  }

  window.addEventListener("keydown", onKeyEvent);
  window.addEventListener("keyup", onKeyEvent);
});