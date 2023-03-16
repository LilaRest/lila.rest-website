window.addEventListener("load", function () {

  // Constants
  const boxRetractionDistance = 45 / 100; // In % of the ball size

  // Variables
  let dirsKeysChanged = false;
  let ballsMoving = false;
  const balls = [];

  // Build the 'dirs' object which holds properties about each direction
  const dirsNames = ["up", "right", "down", "left"];
  const dirs = {};
  dirsNames.forEach(dir => dirs[dir] = {
    pressed: false,
    opp: dirsNames[dirsNames.indexOf(dir) + (2 * ([2, 3].includes(dirsNames.indexOf(dir)) ? -1 : 1))],
    diags: [0, 2].includes(dirsNames.indexOf(dir)) ? ["left", "right"] : ["up", "down"],
    axis: [0, 2].includes(dirsNames.indexOf(dir)) ? "top" : "left",
    axisDir: [1, 2].includes(dirsNames.indexOf(dir)) ? 1 : -1
  });

  // Build the 'boxes' object which holds boxes elements and properties
  let boxes = [];
  document.querySelectorAll(".box").forEach(box => {
    boxes.push({
      el: box,
      retracted: false
    });
  });

  class Ball {
    /**
     * @param id (string) The HTML identifier of the ball's div
     * @param top (number) The initial top position of the ball.                   In px
     * @param left (number) The initial left position of the ball.                 In px
     * @param size (number) The initial size the ball.                             In px
     * @param minSpeed (number) The minimum speed at which the ball can move.      In px/s
     * @param maxSpeed (number) The maximum speed at which the ball can move.      In px/s
     * @param accelerationInertia (number) The lower the heavier the ball is.      In %
     * @param descelerationInertia (number) The lower the heavier the ball is.     In %
     * @param impactEnergyLoss (number) The amount of energy lost after an impact. In %
     */
    constructor (id, top, left, size, minSpeed, maxSpeed, accelerationInertia, descelerationInertia, impactEnergyLoss) {
      this.el = document.querySelector(`#${id}`);
      if (this.el) {

        // Set ball's position and size
        this.el.style.top = top + "px";
        this.el.style.left = left + "px";
        this.el.style.height = size + "px";
        this.el.style.width = size + "px";

        // Set ball's properties
        this.minSpeed = minSpeed;
        this.maxSpeed = maxSpeed;
        this.accelerationInertia = accelerationInertia;
        this.descelerationInertia = descelerationInertia;
        this.impactEnergyLoss = impactEnergyLoss;

        // Define utils vars
        this.lastUpdateTime = null;
        this.speeds = {};
        dirsNames.forEach(dir => this.speeds[dir] = 0);
        this.bounds = {};
        dirsNames.forEach(dir => this.bounds[dir] = 0);

        // Append the ball instance to the balls list
        balls.push(this);
      }
      else throw `ball element with id #${id} doesn't exist.`;
    }

    // Virtual top property
    get top () {
      return Number(this.el.style.top.replace("px", ""));
    }
    set top (pos) {
      this.el.style.top = pos + "px";
    }

    // Virtual left property
    get left () {
      return Number(this.el.style.left.replace("px", ""));
    }
    set left (pos) {
      this.el.style.left = pos + "px";
    }

    // Virtual size property
    get size () {
      return Number(this.el.style.height.replace("px", ""));
    }
    set size (pos) {
      this.el.style.height = pos + "px";
      this.el.style.width = pos + "px";
    }

    updateBounds () {
      this.bounds.up = scrollY;
      this.bounds.right = scrollX + innerWidth - this.size;
      this.bounds.down = scrollY + innerHeight - this.size;
      this.bounds.left = scrollX;
    }

    updatePosition (time) {
      // Save old top and left values for later comparison
      const oldTop = this.top;
      const oldLeft = this.left;

      // Update the directions' speeds
      let changedDirsNames = [];
      for (const [dirName, dir] of Object.entries(dirs)) {
        if (dir.pressed && !dirs[dir.opp].pressed) {
          if (this.speeds[dirName] >= this.minSpeed) {
            // If the dir has a faster diagonal dir and is below 15% of maxSpeed, slightly decreases the acceleration inertia
            // This help to make the direction change more fluent and reactive when the ball is already rolling at high speed
            let hasFasterDiag = dir.diags.some((diagName) => this.speeds[diagName] > this.maxSpeed * 70 / 100);
            if (hasFasterDiag && this.speeds[dirName] < this.maxSpeed * 15 / 100) this.speeds[dirName] *= 1 + this.accelerationInertia * 1.5;

            // Else apply the default inertia
            else this.speeds[dirName] *= 1 + this.accelerationInertia;

            // Ensure the direction speed doesn't exceed maxSpeed
            if (this.speeds[dirName] > this.maxSpeed) this.speeds[dirName] = this.maxSpeed;
          }
          else this.speeds[dirName] = this.minSpeed;
          changedDirsNames.push(dirName);
        }
        else if (this.speeds[dirName] >= this.minSpeed) {
          if (dirs[dir.opp].pressed) this.speeds[dirName] /= 1 + this.accelerationInertia;
          else this.speeds[dirName] /= 1 + this.descelerationInertia;
          changedDirsNames.push(dirName);
        }
      }

      // Ensure main diagonal speed doesn't exceed maxSpeed by normalizing it if needed
      const usedSpeeds = { ...this.speeds };
      const mainDirName = Object.entries(this.speeds).reduce((max, entry) => entry[1] >= max[1] ? entry : max, [0, -Infinity])[0];
      const mainDirDiags = dirs[mainDirName].diags;
      const mainDiagName = this.speeds[mainDirDiags[0]] >= this.speeds[mainDirDiags[1]] ? mainDirDiags[0] : mainDirDiags[1];
      const diagSpeedsSum = this.speeds[mainDirName] + this.speeds[mainDiagName];
      if (diagSpeedsSum >= this.maxSpeed) {
        [mainDirName, mainDiagName].forEach(dirName => usedSpeeds[dirName] = usedSpeeds[dirName] / diagSpeedsSum * this.maxSpeed);
      }

      // Apply directions distances
      for (const dirName of changedDirsNames) {
        let distance = usedSpeeds[dirName];
        if (this.lastUpdateTime) distance *= (time - this.lastUpdateTime) * 10 ** -3;
        this[dirs[dirName].axis] += distance * dirs[dirName].axisDir;
      }

      // Continue if the ball position has changed
      if (this.top !== oldTop || this.left !== oldLeft) {

        // Define the position as currently updating
        this.lastUpdateTime = time;

        // Update ball bounds
        this.updateBounds();

        // Prevent the ball from crossing bounds and handle bouncing
        for (const dirName of changedDirsNames) {
          let bouncingDir = false;
          if (dirs[dirName].axisDir === 1) {
            if (this[dirs[dirName].axis] >= this.bounds[dirName]) bouncingDir = true;
          }
          else if (this[dirs[dirName].axis] <= this.bounds[dirName]) bouncingDir = true;
          if (bouncingDir) {
            this[dirs[dirName].axis] = this.bounds[dirName];
            this.speeds[dirs[dirName].opp] = this.speeds[dirName] / (1 + this.impactEnergyLoss);
            this.speeds[dirName] = 0;
          }
        }
      }

      // Else set lastUpdateTime to null to stop updating position
      else this.lastUpdateTime = null;
    }
  };

  function moveBalls () {
    window.requestAnimationFrame((time) => {

      const ballsToUpdate = balls.filter(ball => ball.lastUpdateTime !== null || dirsKeysChanged);
      if (ballsToUpdate.length > 0) {
        ballsMoving = true;

        dirsKeysChanged = false;

        // Update balls positions.
        ballsToUpdate.forEach(ball => ball.updatePosition.call(ball, time));

        // Handle boxes retraction
        boxes.forEach(box => {
          let retractionRequired = false;
          for (const ball of ballsToUpdate) {
            const ballPosYStart = ball.top;
            const ballPosYEnd = ball.top + ball.size;
            const ballPosXStart = ball.left;
            const ballPosXEnd = ball.left + ball.size;
            const boxPosYStart = box.el.offsetTop + (boxRetractionDistance * ball.size);
            const boxPosYEnd = box.el.offsetTop + box.el.offsetHeight - (boxRetractionDistance * ball.size);
            const boxPosXStart = box.el.offsetLeft + (boxRetractionDistance * ball.size);
            const boxPosXEnd = box.el.offsetLeft + box.el.offsetWidth - (boxRetractionDistance * ball.size);
            if (boxPosYStart <= ballPosYEnd &&
              boxPosYEnd >= ballPosYStart &&
              boxPosXStart <= ballPosXEnd &&
              boxPosXEnd >= ballPosXStart) {
              if (!box.retracted) {
                box.el.classList.add("retracted");
                box.retracted = true;
              }
              retractionRequired = true;
              break;
            }
          }
          if (!retractionRequired) {
            box.el.classList.remove("retracted");
            box.retracted = false;
          }
        });
        moveBalls();
      }
      else {
        ballsMoving = false;
      }
    });
  }

  function onKeyEvent (e) {
    // If the event happens on a direction key
    const keyDir = e.key.replace("Arrow", "").toLowerCase();
    if (dirsNames.includes(keyDir)) {

      // Set the new key pressed state
      dirs[keyDir].pressed = e.type === "keydown" ? true : false;

      // Indicate that directions keys has changed.
      dirsKeysChanged = true;

      // Initiate balls movement if not already moving.
      if (!ballsMoving) moveBalls();
    }
  }
  window.addEventListener("keydown", onKeyEvent);
  window.addEventListener("keyup", onKeyEvent);

  // Instantiate balls
  new Ball(
    id = "ball",
    top = 0,
    left = 0,
    size = 100,
    minSpeed = 0.5,
    maxSpeed = 1000,
    accelerationInertia = 12 / 100,
    descelerationInertia = 4 / 100,
    impactEnergyLoss = 40 / 100,
  );
});