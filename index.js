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


    /* the script in index.html manages the size of the main canvas; it will
     * auto-scale the foreground and background canvases at the same time.
     * So we only need to monitor one of them.
     */
    new ResizeObserver(this.drawSizeRefresh.bind(this)).observe(fg);

    /* we do *NOT* explicitly ask for a redraw during init; instead, we will
     * wait for the ResizeObserver to call us (which happens because of init);
     * this function always asks for a redraw
     */


    this.keyUp_handler();
    document.addEventListener("keydown", this.keyDown_handler.bind(this));
    document.addEventListener("keyup",   this.keyUp_handler  .bind(this));
  }


  // call this when you you resize the drawing area (or, in the constructor).
  // We calculate how large the "visible" size is.
  drawSizeRefresh() {
    const wid = parseInt(this.bg_ctx.canvas.style.width);
    const hei = parseInt(this.bg_ctx.canvas.style.height);

    const wid_cells = wid/CELL_SIZE;
    const hei_cells = hei/CELL_SIZE;

    /* before we *use* the scroll state, update it if the window's in motion */
    this.scroll_x += this.vel.x;
    this.scroll_y += this.vel.y;

    const lft_raw = this.scroll_x - wid_cells/2;
    const rgt_raw = this.scroll_x + wid_cells/2;
    const top_raw = this.scroll_y - hei_cells/2;
    const bot_raw = this.scroll_y + hei_cells/2;

    var lft = Math.floor(lft_raw);
    var rgt = Math. ceil(rgt_raw);
    var top = Math.floor(top_raw);
    var bot = Math. ceil(bot_raw);


    /* the bounds of our draw loop (the "draw indices") need to use the rounded
     * values.  The transform matrix will use the floating-point original
     * values, so that we can have smooth scrolling.
     */
    this.drawIndices = {left:lft, top:top, right:rgt, bottom:bot};


    /* set the transform based on the raw values (but scaled up because the
     * cell sizes are a lot larger than single pixels).  Note that we apply
     * the - transform as well, because we want the (virtual) origin of the
     * drawing to move up and left as we think that we are drawing deeper to
     * the right and bottom.
     */
    this.bg_ctx.reset();
    this.fg_ctx.reset();

    const translate_x = -lft_raw * CELL_SIZE;
    const translate_y = -top_raw * CELL_SIZE;

    this.bg_ctx.translate(translate_x, translate_y);
    this.fg_ctx.translate(translate_x, translate_y);


    this.draw_bg();
    this.draw_fg();
//    requestAnimationFrame(this.draw_bg.bind(this));
//    requestAnimationFrame(this.draw_fg.bind(this));
  }


  draw_bg() {
    for (var x=this.drawIndices.left; x<=this.drawIndices.right ; x++)
    for (var y=this.drawIndices.top ; y<=this.drawIndices.bottom; y++)
    {
      if (x%5 == 0 && y%5 == 0)
          continue;
      this.bg_ctx.fillStyle = "green";
      this.bg_ctx.fillRect(x*CELL_SIZE + CELL_BORDER,
                           y*CELL_SIZE + CELL_BORDER,
                           CELL_SIZE-2*CELL_BORDER, CELL_SIZE-2*CELL_BORDER);
    }


    /* top and bottom edges */
    for (var x=this.drawIndices.left; x<=this.drawIndices.right ; x++)
    {
      this.bg_ctx.fillStyle = "red";

      y = 0;
      this.bg_ctx.fillRect(x*CELL_SIZE + CELL_BORDER,
                           y*CELL_SIZE + CELL_BORDER,
                           CELL_SIZE-2*CELL_BORDER, CELL_SIZE-2*CELL_BORDER);
      y = 50;
      this.bg_ctx.fillRect(x*CELL_SIZE + CELL_BORDER,
                           y*CELL_SIZE + CELL_BORDER,
                           CELL_SIZE-2*CELL_BORDER, CELL_SIZE-2*CELL_BORDER);
    }
    /* left and right edges */
    for (var y=this.drawIndices.top; y<=this.drawIndices.bottom; y++)
    {
      this.bg_ctx.fillStyle = "red";

      x = 0;
      this.bg_ctx.fillRect(x*CELL_SIZE + CELL_BORDER,
                           y*CELL_SIZE + CELL_BORDER,
                           CELL_SIZE-2*CELL_BORDER, CELL_SIZE-2*CELL_BORDER);
      x = 50;
      this.bg_ctx.fillRect(x*CELL_SIZE + CELL_BORDER,
                           y*CELL_SIZE + CELL_BORDER,
                           CELL_SIZE-2*CELL_BORDER, CELL_SIZE-2*CELL_BORDER);
    }
  }


  draw_fg() {
  }


  keyDown_handler({key}) {
    const SPEED = .25;

    if (key == "ArrowLeft")
      this.vel = {x:-SPEED, y:0};
    if (key == "ArrowRight")
      this.vel = {x: SPEED, y:0};
    if (key == "ArrowUp")
      this.vel = {x:0,      y:-SPEED};
    if (key == "ArrowDown")
      this.vel = {x:0,      y: SPEED};

    if (this.vel.x != 0 || this.vel.y != 0)
      requestAnimationFrame(this.drawSizeRefresh.bind(this));
  }
  keyUp_handler() {
    this.vel = {x:0, y:0};
  }
}


