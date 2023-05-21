const CELL_SIZE   = 32;    // center-to-center size
const CELL_BORDER =  2;    // working size is SIZE-2*BORDER



class Map {
  constructor(grid, bg,fg, scroll_x,scroll_y) {
    this.grid     = grid;
    this.scroll_x = scroll_x;
    this.scroll_y = scroll_y;


    // there are two canvases:
    //   bg
    //     - Drawn everywhere
    //     - Rarely changes
    //     - Do only partial redraws if possible
    //   fg
    //     - Used to add "tokens" (player, etc.)
    //     - Changes constantly
    //     - Only draw in a few places
    //     - Complete redraw every frame

    bg.style.background = "white";
    fg.style.backgroundColor = "transparent";

    this.bg_ctx = bg.getContext("2d");
    this.fg_ctx = fg.getContext("2d");
console.log(this.bg_ctx.getTransform());


    /* the script in index.html manages the size of the main canvas; it will
     * auto-scale the foreground and background canvases at the same time.
     * So we only need to monitor one of them.
     *
     * RUSS ASKS (20 May 2023):
     * Why is the 'this' pointer not part of the scope of the function, which
     * is saved?  If I use 'this' directly, instead of 'saved_this', I get the
     * ResizeObserver object!  Ick!
     */
    const save_this = this;
    new ResizeObserver(function(event) {console.log(save_this); save_this.drawSizeRefresh(event);}).observe(fg);


    /* we do *NOT* explicitly ask for a redraw during init; instead, we will
     * wait for the ResizeObserver to call us (which happens because of init);
     * this function always asks for a redraw
     */


    const this_save = this;
//    requestAnimationFrame(function () {this_save.shift();});
  }


  shift() {
//console.log(this.bg_ctx.canvas);
    this.bg_ctx.canvas.style.left = parseInt(this.bg_ctx.canvas.style.left)-5;

    const this_save = this;
    requestAnimationFrame(function () {this_save.shift();});
  }


  // call this when you you resize the drawing area (or, in the constructor).
  // We calculate how large the "visible" size is.
  drawSizeRefresh(event) {
console.log("canvas resize");
console.log(event);
console.log(this.bg_ctx.getTransform());
    const {width,height} = event[0].contentRect;

    this.wid_cells = 20;
    this.hei_cells = 20;
    console.log("TODO: drawSizeRefresh(): calculate the values from input data, intsead of hard-coding");

    this.lft_indx = this.scroll_x - Math.floor(this.wid_cells/2);
    this.top_indx = this.scroll_y - Math.floor(this.hei_cells/2);
//    assert(this.lft_indx >= 0);
//    assert(this.top_indx >= 0);
//    assert(this.lft_indx + wid_cells < this.grid   .length);
//    assert(this.top_indx + hei_cells < this.grid[0].length);

    const this_save = this;
    requestAnimationFrame(function() {this_save.draw();});
  }


  draw() {
console.log("draw():", this);
console.log(this.bg_ctx);
console.log(this.bg_ctx.canvas);

    this.bg_ctx.clearRect(0,0, this.bg_ctx.canvas.width, this.bg_ctx.canvas.height);

    console.log("TODO: implement Map.draw()");

    for (var i=0; i<this.wid_cells; i++)
    for (var j=0; j<this.hei_cells; j++)
    {
      const x = this.lft_indx+i;
      const y = this.top_indx+j;

      this.bg_ctx.fillStyle = "green";
      this.bg_ctx.fillRect(i*CELL_SIZE + CELL_BORDER,
                           j*CELL_SIZE + CELL_BORDER,
                           CELL_SIZE-2*CELL_BORDER, CELL_SIZE-2*CELL_BORDER);
    }

    this.completeRedraw = false;
  }
}



//  window.addEventListener("load", function() {
//    console.log("Foo");
//    draw_here = document.getElementById("draw_here");
//    const map = new Map([], draw_here, 0,0);
//  });


