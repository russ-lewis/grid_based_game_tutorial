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

  render() {
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
      const fill_color = this.matrix[row][col] > 0 ? "#FF0000" : "#0000FF";
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

const gridSystem = new GridSystem(example_starting_matrix);
gridSystem.render();

