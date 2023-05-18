class GridSystem {
  constructor(matrix) {
    this.matrix = matrix;

    this.outline_width  = 320;
    this.outline_height = 480;

    this.     uiContext = this.#createDrawContext(420,580, "#111");
    this.outlineContext = this.#createDrawContext(320,480, "#444");
    this.    topContext = this.#createDrawContext(320,480, "#111", true);

    this.cellSize = 30;
    this.padding  = 4;
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

  render(player_x, player_y) {
//    assert(0 <= player_x <= this.matrix   .length);
//    assert(0 <= player_y <= this.matrix[0].length);

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
      if (col == player_x && row == player_y)
        fill_color = "#00FF00";
      else if (this.matrix[row][col] > 0)
        fill_color = "#FF0000";
      else
        fill_color = "#0000FF";

      const x = col * (this.cellSize + this.padding) + offset_x;
      const y = row * (this.cellSize + this.padding) + offset_y;

      this.outlineContext.fillStyle = fill_color;
      this.outlineContext.fillRect(x,y, this.cellSize,this.cellSize);
    }


    // text in the UI
    this.uiContext.font      = "20px Courier";
    this.uiContext.fillStyle = "white"
    this.uiContext.fillText("Put your title here", 20,30);
  }
}

const example_starting_matrix = [
  [1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1]
];

var player_x = 2;
var player_y = 3;



const gridSystem = new GridSystem(example_starting_matrix);
gridSystem.render(player_x, player_y);



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

document.addEventListener("keydown", function({key}) {
  var dx=0, dy=0;

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
      console.log("MOVEMENT BLOCKED");
      return;
    }

    player_x += dx;
    player_y += dy;
    gridSystem.render(player_x, player_y);
  }
});

