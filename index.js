class GridSystem {
  constructor(matrix) {
    this.matrix = matrix;

    this.outline_width  = 320;
    this.outline_height = 480;

    this.cellSize = 30;
    this.padding  = 4;

    this.     uiContext = this.#createDrawContext(420,580, "#111");
    this.outlineContext = this.#createDrawContext(320,480, "#444");
    this. playerContext = this.#createDrawContext(320,480, "#111", true);

    this.ugly_house = new Image();
    this.ugly_house.src = "assets/images/ugly_house.png";    
  }

  #createDrawContext(w, h, color="#111", isTransparent=false) {
    const canvas  = document.createElement("canvas");
    document.body.appendChild(canvas);

    canvas.width  = w;
    canvas.height = h;
    canvas.style.position   = "absolute";
    canvas.style.background = color;
    if (isTransparent) {
      canvas.style.backgroundColor = "transparent";
    }
    canvas.style.marginLeft = (window.innerWidth  - w)/2 + "px";
    canvas.style.marginTop  = (window.innerHeight - h)/2 + "px";

    return canvas.getContext("2d");
  }

  render_map() {
    const area_width  = this.outline_width;
    const area_height = this.outline_height;

    const map_width  = this.matrix   .length * (this.cellSize+this.padding) - this.padding/2;
    const map_height = this.matrix[0].length * (this.cellSize+this.padding) - this.padding/2;

//    assert(area_width  >= map_width);
//    assert(area_height >= map_height);
    const offset_x = (area_width  - map_width )/2;
    const offset_y = (area_height - map_height)/2;

    for (var row=0; row < this.matrix   .length; row++)
    for (var col=0; col < this.matrix[0].length; col++)
    {
      var fill_color;
      if (this.matrix[row][col] > 0)
        fill_color = "#FF0000";
      else
        fill_color = "#0000FF";

      const x = col * (this.cellSize + this.padding) + offset_x;
      const y = row * (this.cellSize + this.padding) + offset_y;

      this.outlineContext.fillStyle = fill_color;
      this.outlineContext.fillRect(x,y, this.cellSize,this.cellSize);

      if (this.matrix[row][col] == 2)
        this.playerContext.drawImage(this.ugly_house, x,y);
    }


    // text in the UI
    this.uiContext.font      = "20px Courier";
    this.uiContext.fillStyle = "white"
    this.uiContext.fillText("Put your title here", 20,30);
  }

  render_player(player_x, player_y) {
//    assert(0.5 <= player_x <= this.width -0.5)
//    assert(0.5 <= player_y <= this.height-0.5)

    const area_width  = this.outline_width;
    const area_height = this.outline_height;

    const map_width  = this.matrix   .length * (this.cellSize+this.padding) - this.padding/2;
    const map_height = this.matrix[0].length * (this.cellSize+this.padding) - this.padding/2;

//    assert(area_width  >= map_width);
//    assert(area_height >= map_height);
    const offset_x = (area_width  - map_width )/2;
    const offset_y = (area_height - map_height)/2;

    this.playerContext.clearRect(0,0, this.outline_width, this.outline_height);

    const x = player_x * (this.cellSize+this.padding) + offset_x;
    const y = player_y * (this.cellSize+this.padding) + offset_y;

    this.playerContext.fillStyle = "#00FF00";
    this.playerContext.fillRect(x,y, this.cellSize,this.cellSize);
  }
}

const example_starting_matrix = [
  [1, 2, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1]
];



const gridSystem = new GridSystem(example_starting_matrix);

// don't attempt to draw the map until the sprites have loaded.
window.addEventListener("load", function() { gridSystem.render_map(); });



var player_x = 2;
var player_y = 3;
gridSystem.render_player(player_x, player_y);



var dx = 0;
var dy = 0;

const TWEEN_LEN  = 20;
var   tweenCount = 0;

var queued_key = 0;

function updatePlayer()
{
//  assert(dx != 0 || dy != 0);
//  assert(0 <= tweenCount < TWEEN_LEN);

  tweenCount++;
  if (tweenCount == TWEEN_LEN)
  {
    player_x += dx;
    player_y += dy;
    dx = dy = tweenCount = 0;

    if (queued_key != 0)
    {
      const toSend = queued_key;
      queued_key = 0;
      keyDown_handler({key:toSend});
    }
  }
  else
    requestAnimationFrame(updatePlayer);

  var x = player_x + dx * (tweenCount/TWEEN_LEN);
  var y = player_y + dy * (tweenCount/TWEEN_LEN);
  gridSystem.render_player(x,y);
}



// RUSS NOTES:
//
// This is very strange JavaScript magic, but I'm using it here because the
// tutorial did so (although it looked for {keyCode} instead of {key}.  While
// I'm not convinced that this language feature is any code, I know that I need
// to learn about it, if I'm going to use other people's code.
//
// The issue here is the curly-braces around the function parameter: this code
// automatically extracts the matching field name from the object which is
// passed.  That is, the "keydown" Event Listener actually gets an event
// object, which has a bunch of fields.  If you used a parameter name 'event',
// then you could access the key using 'event.key'.  But if you put curly
// braces around the parameter, then the field 'event.key' is auto-extracted as
// part of the parameter passing, and thus, you see *ONLY* the key field, not
// the entire object.
//
// FWIW, you can actually declare groups of pseudo-parameters that way; for
// instance, the syntax {key,keyCode} is perfectly valid.

function keyDown_handler({key}) {
  if (dx != 0 || dy != 0)
  {
    queued_key = key;
    return;
  }

  if (key == "ArrowLeft")
    dx = -1;
  if (key == "ArrowRight")
    dx = 1;
  if (key == "ArrowUp")
    dy = -1;
  if (key == "ArrowDown")
    dy = 1;

  if (dx != 0 || dy != 0)
  {
    if (gridSystem.matrix[player_y+dy][player_x+dx] > 0)
    {
      dx = dy = 0;
      return;
    }

    requestAnimationFrame(updatePlayer);
  }
}



document.addEventListener("keydown", keyDown_handler);

