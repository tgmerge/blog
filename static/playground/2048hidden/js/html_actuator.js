function HTMLActuator() {
  this.tileContainer    = document.querySelector(".tile-container");
  this.scoreContainer   = document.querySelector(".score-container");
  this.bestContainer    = document.querySelector(".best-container");
  this.messageContainer = document.querySelector(".game-message");

  gameContainer         = document.querySelector(".game-container");
  tileContainer         = document.querySelector(".tile-container");

  this.score = 0;
}

HTMLActuator.prototype.actuate = function (grid, metadata) {
  var self = this;

  window.requestAnimationFrame(function () {
    self.clearContainer(self.tileContainer);

    var maxCell = {value: 0};

    grid.cells.forEach(function (column) {
      column.forEach(function (cell) {
        if (cell) {
          self.addTile(cell);

          // find the tile with max value for flashlight
          if (cell.value > maxCell.value)
            maxCell = cell;
        }
      });
    });

    setTimeout(self.updateFlashlight(maxCell), 10);

    self.updateScore(metadata.score);
    self.updateBestScore(metadata.bestScore);

    if (metadata.terminated) {
      self.showTiles();
      if (metadata.over) {
        self.message(false); // You lose
      } else if (metadata.won) {
        self.message(true); // You win!
      }
    }

  });
};

// Continues the game (both restart and keep playing)
HTMLActuator.prototype.continue = function () {
  this.clearMessage();
};

HTMLActuator.prototype.clearContainer = function (container) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
};

HTMLActuator.prototype.addTile = function (tile) {
  var self = this;

  var wrapper   = document.createElement("div");
  var inner     = document.createElement("div");
  var position  = tile.previousPosition || { x: tile.x, y: tile.y };
  var positionClass = this.positionClass(position);

  // We can't use classlist because it somehow glitches when replacing classes
  var classes = ["tile", "tile-" + tile.value, positionClass];

  if (tile.value > 2048) classes.push("tile-super");

  this.applyClasses(wrapper, classes);

  inner.classList.add("tile-inner");
  inner.textContent = tile.value;

  if (tile.previousPosition) {
    // Make sure that the tile gets rendered in the previous position first
    window.requestAnimationFrame(function () {
      classes[2] = self.positionClass({ x: tile.x, y: tile.y });
      self.applyClasses(wrapper, classes); // Update the position
    });
  } else if (tile.mergedFrom) {
    classes.push("tile-merged");
    this.applyClasses(wrapper, classes);

    // Render the tiles that merged
    tile.mergedFrom.forEach(function (merged) {
      self.addTile(merged);
    });
  } else {
    classes.push("tile-new");
    this.applyClasses(wrapper, classes);
  }

  // Add the inner part of the tile to the wrapper
  wrapper.appendChild(inner);

  // Put the tile on the board
  this.tileContainer.appendChild(wrapper);
};

HTMLActuator.prototype.applyClasses = function (element, classes) {
  element.setAttribute("class", classes.join(" "));
};

HTMLActuator.prototype.normalizePosition = function (position) {
  return { x: position.x + 1, y: position.y + 1 };
};

HTMLActuator.prototype.positionClass = function (position) {
  position = this.normalizePosition(position);
  return "tile-position-" + position.x + "-" + position.y;
};

HTMLActuator.prototype.updateScore = function (score) {
  this.clearContainer(this.scoreContainer);

  var difference = score - this.score;
  this.score = score;

  this.scoreContainer.textContent = this.score.toFixed(0);

  if (difference > 0) {
    var addition = document.createElement("div");
    addition.classList.add("score-addition");
    addition.textContent = "+" + difference.toFixed(2);

    this.scoreContainer.appendChild(addition);
  }

  
};

HTMLActuator.prototype.updateBestScore = function (bestScore) {
  this.bestContainer.textContent = parseInt(bestScore).toFixed(0);
};

HTMLActuator.prototype.message = function (won) {
  var type    = won ? "game-won" : "game-over";
  var message = won ? "You win!" : "Game over!";

  this.messageContainer.classList.add(type);
  this.messageContainer.getElementsByTagName("p")[0].textContent = message;
};

HTMLActuator.prototype.clearMessage = function () {
  // IE only takes one value to remove at a time.
  this.messageContainer.classList.remove("game-won");
  this.messageContainer.classList.remove("game-over");
};

HTMLActuator.prototype.hideTiles = function () {
  // hidden mode!
  tileContainer.style.webkitAnimation = "none";
  tileContainer.style.mozAnimation = "none";
  tileContainer.style.animation = "none";
  tileContainer.style.oAnimation = "none";
  
  tileContainer.style.opacity = 0;
  setTimeout(function(){
    tileContainer.style.webkitAnimation = "osuhidden 0.5s 1";
    tileContainer.style.mozAnimation = "osuhidden 0.5s 1";
    tileContainer.style.animation = "osuhidden 0.5s 1";
    tileContainer.style.oAnimation = "osuhidden 0.5s 1";
  }, 0);
};

HTMLActuator.prototype.showTiles = function () {
  // hidden mode!
  tileContainer.style.opacity = 1;
  tileContainer.style.webkitAnimation = "none";
  tileContainer.style.mozAnimation = "none";
  tileContainer.style.animation = "none";
  tileContainer.style.oAnimation = "none";
};

HTMLActuator.prototype.applyFlashlight = function () {
  gameContainer.style.webkitMaskImage = "url('mask.svg')";
  gameContainer.style.webkitMaskRepeat = "no-repeat";
  gameContainer.style.maskImage = "url('mask.svg')";
  gameContainer.style.maskRepeat = "no-repeat";
  document.querySelector("html").style.background = "#070707";
  document.querySelector("body").style.background = "#070707";
}

HTMLActuator.prototype.removeFlashlight = function () {
  gameContainer.style.webkitMaskImage = "none";
  gameContainer.style.webkitMaskRepeat = "no-repeat";
  gameContainer.style.maskImage = "none";
  gameContainer.style.maskRepeat = "no-repeat";
  document.querySelector("html").style.background = "";
  document.querySelector("body").style.background = "";
}

HTMLActuator.prototype.updateFlashlight = function (tile) {
  var baseTile = document.querySelector(".grid-container>:nth-child("+(tile.y+1)+")>:nth-child("+(tile.x+1)+")");
  var maskX = baseTile.offsetLeft - 150 + 'px';
  var maskY = baseTile.offsetTop - 150 + 'px';
  gameContainer.style.webkitMaskPositionX = maskX;
  gameContainer.style.webkitMaskPositionY = maskY;
  gameContainer.style.maskPositionX = maskX;
  gameContainer.style.maskPositionY = maskY;
}