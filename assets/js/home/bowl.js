window.addEventListener("load", function () {

  // Settings
  const b = document.querySelector("#bowl");
  let bLeft = 0;
  let bTop = 0;
  let bSize = 100;
  let bMaxVelocity = 25;
  let bMinVelocity = 0.5;
  let bInertia = 10 / 100; // In % | The lower the heavier the bowl is
  let bImpactEnergyLoss = 50 / 100; // In % | The higher the higher the loss is

  // Variables, constants & objects used by the program
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

  const diags = {
    up: ["left", "right"],
    right: ["up", "down"],
    down: ["left", "right"],
    left: ["up", "down"],
  };

  // Initialize bowl position and size
  b.style.left = bLeft + "px";
  b.style.top = bTop + "px";
  b.style.height = bSize + "px";
  b.style.width = bSize + "px";

  // Retrieve boxes and get their positions
  let boxes = [];
  document.querySelectorAll(".box").forEach(box => {
    boxes.push({
      el: box,
      retracted: false
    });
  });

  function updateBounds () {
    dirs.up.bound = scrollY;
    dirs.right.bound = scrollX + innerWidth - bSize;
    dirs.down.bound = scrollY + innerHeight - bSize;
    dirs.left.bound = scrollX;
  }

  function applyDistance (dir, distance) {
    switch (dir) {
      case "up":
        bTop -= distance;
        break;
      case "right":
        bLeft += distance;
        break;
      case "down":
        bTop += distance;
        break;
      case "left":
        bLeft -= distance;
        break;
    }
  }

  function applyDirs (changedDirs) {
    for (const dir of changedDirs) {
      let appliedDistance = dirs[dir].velocity;
      diags[dir].forEach((diag) => {
        if (changedDirs.includes(diag)) appliedDistance /= 1.5;
      });
      applyDistance(dir, appliedDistance);
    }
  }

  function getOpposedDir (dir) {
    switch (dir) {
      case "up": return "down";
      case "right": return "left";
      case "down": return "up";
      case "left": return "right";
    }
  }

  function updatePosition () {
    // Update bowl bounds
    updateBounds();

    // Save old bTop and bLeft values for later comparison
    const oldBTtop = bTop;
    const oldBLeft = bLeft;

    // Update the directions velocity
    let changedDirs = [];
    for (const dir of Object.keys(dirs)) {
      const oppDir = getOpposedDir(dir);
      if (dirs[dir].pressed && !dirs[oppDir].pressed) {
        if (dirs[dir].velocity >= bMinVelocity) {
          dirs[dir].velocity = dirs[dir].velocity *= 1 + bInertia;
          if (dirs[dir].velocity > bMaxVelocity) dirs[dir].velocity = bMaxVelocity;
        }
        else dirs[dir].velocity = bMinVelocity;
        changedDirs.push(dir);
      }
      else if (dirs[dir].velocity >= bMinVelocity) {
        dirs[dir].velocity /= 1 + bInertia;
        changedDirs.push(dir);
      }
    }
    applyDirs(changedDirs);

    // Prevent the bowl from crossing bounds and handle bouncing
    if (bTop <= dirs.up.bound) {
      bTop = dirs.up.bound;
      dirs.down.velocity = dirs.up.velocity / (1 + bImpactEnergyLoss);
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

      // Handle boxes retraction
      boxes.forEach(box => {
        if (!box.retracted) {
          if (
            box.el.offsetTop <= (bTop + bSize) &&
            (box.el.offsetTop + box.el.offsetHeight) >= bTop &&
            box.el.offsetLeft <= (bLeft + bSize) &&
            (box.el.offsetLeft + box.el.offsetWidth) >= bLeft) {
            box.el.classList.add("retracted");
            box.retracted = true;
          }
        }
        else {
          if (
            box.el.offsetTop > (bTop + bSize) ||
            (box.el.offsetTop + box.el.offsetHeight) < bTop ||
            box.el.offsetLeft > (bLeft + bSize) ||
            (box.el.offsetLeft + box.el.offsetWidth) < bLeft) {
            box.el.classList.remove("retracted");
            box.retracted = false;
          }
        }
      });
    }
  }


  function updateMovement () {
    if (lastMovementInterval) clearInterval(lastMovementInterval);
    lastMovementInterval = setInterval(updatePosition, 20);
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