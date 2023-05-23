const CELL_SIZE   = 32;    // center-to-center size
const CELL_BORDER =  2;    // working size is SIZE-2*BORDER



class Map {
  constructor(bg,fg, status_pane) {
    const SIZE = 100;

    this.scroll_x = 8;
    this.scroll_y = 8;

    this.grid = new Array(SIZE);
    for (var i=0; i<SIZE; i++) {
      this.grid[i] = new Array(SIZE);
      for (var j=0; j<SIZE; j++)
        this.grid[i][j] = 0;
    }
    this.grid[2][3] = "yellow";
    this.grid[1][5] = "green";


    // the user can change this at any time.  It is the color that we will set
    // the next time that the user clicks anywhere.
    this.activeColor = "blue";


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


    this.status_pane = status_pane;


    /* the script in index.html manages the size of the main canvas; it will
     * auto-scale the foreground and background canvases at the same time.
     * So we only need to monitor one of them.
     */
    new ResizeObserver(this.drawSizeRefresh.bind(this)).observe(fg);

    /* we do *NOT* explicitly ask for a redraw during init; instead, we will
     * wait for the ResizeObserver to call us (which happens because of init);
     * this function always asks for a redraw
     */


    /* we use the keyboard to scroll around on the map.  keyUp and keyDown
     * events update the 'this.vel' object, which is used below (in drawSizeRefresh())
     * to adjust the scroll position slowly.
     *
     * TODO: Why does this appear to require the 'document'?  I can't make this
     *       work if I add a listener to the foreground context.  Compare to
     *       click event - I'm confused.
     */
    this.keyUp_handler();
    document.addEventListener("keydown", this.keyDown_handler.bind(this));
    document.addEventListener("keyup",   this.keyUp_handler  .bind(this));


    /* mouse clicks */
    fg.addEventListener("click", this.click_handler.bind(this));


    /* mouse moves; update the status box */
    fg.addEventListener("mousemove", this.mouseMove_handler.bind(this)); 
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

    /* do we need to update the status pane, maybe? */
    if (this.vel.x != 0 || this.vel.y != 0)
      this.update_status_pane();

    const lft_raw = this.scroll_x - wid_cells/2;
    const rgt_raw = this.scroll_x + wid_cells/2;
    const top_raw = this.scroll_y - hei_cells/2;
    const bot_raw = this.scroll_y + hei_cells/2;

    /* round the values to useful array indices.  But also bound them */
console.log(this.grid.length, this.grid[0].length);
    var lft = Math.max(Math.floor(lft_raw), 0);
    var top = Math.max(Math.floor(top_raw), 0);
    var rgt = Math.min(Math. ceil(rgt_raw), this.grid   .length-1);
    var bot = Math.min(Math. ceil(bot_raw), this.grid[0].length-1);


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
      if (this.grid[x][y] == 0) {
        this.bg_ctx.strokeStyle = "black";
        this.bg_ctx.beginPath();
        this.bg_ctx.rect(x*CELL_SIZE + CELL_BORDER, y*CELL_SIZE + CELL_BORDER,
                         CELL_SIZE-2*CELL_BORDER, CELL_SIZE-2*CELL_BORDER);
        this.bg_ctx.stroke();
      }
      else
      {
        this.bg_ctx.fillStyle = this.grid[x][y];
        this.bg_ctx.fillRect(x*CELL_SIZE + CELL_BORDER, y*CELL_SIZE + CELL_BORDER,
                             CELL_SIZE-2*CELL_BORDER, CELL_SIZE-2*CELL_BORDER);
      }
    }


    /* top and bottom edges */
    this.bg_ctx.fillStyle = "red";
    for (var x=this.drawIndices.left-1; x<=1+this.drawIndices.right; x++)
    {
      y = -1;
      this.bg_ctx.fillRect(x*CELL_SIZE + CELL_BORDER,
                           y*CELL_SIZE + CELL_BORDER,
                           CELL_SIZE-2*CELL_BORDER, CELL_SIZE-2*CELL_BORDER);
      y = this.drawIndices.bottom+1;
      this.bg_ctx.fillRect(x*CELL_SIZE + CELL_BORDER,
                           y*CELL_SIZE + CELL_BORDER,
                           CELL_SIZE-2*CELL_BORDER, CELL_SIZE-2*CELL_BORDER);
    }
    /* left and right edges */
    for (var y=this.drawIndices.top-1; y<=1+this.drawIndices.bottom; y++)
    {
      x = -1;
      this.bg_ctx.fillRect(x*CELL_SIZE + CELL_BORDER,
                           y*CELL_SIZE + CELL_BORDER,
                           CELL_SIZE-2*CELL_BORDER, CELL_SIZE-2*CELL_BORDER);
      x = this.drawIndices.right+1;
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


  click_handler({offsetX,offsetY}) {
    const transform_matrix = this.bg_ctx.getTransform();
    const translate_X = transform_matrix.m41;
    const translate_Y = transform_matrix.m42;

    const indx_X = Math.floor((offsetX - translate_X) / CELL_SIZE);
    const indx_Y = Math.floor((offsetY - translate_Y) / CELL_SIZE);

    if (indx_X < 0 || indx_X >= this.grid   .length ||
        indx_Y < 0 || indx_Y >= this.grid[0].length)
    {
      console.log("Click indices out of range:", indx_X,indx_Y);
      return;
    }

    this.grid[indx_X][indx_Y] = this.activeColor;
    requestAnimationFrame(this.draw_bg.bind(this));
  }


  mouseMove_handler({offsetX,offsetY}) {
    /* we need to update the status page when the mouse moves, OR the page
     * moves underneath it.  So we save the most recent mouse position, from
     * this mouseMove event, into a variable that will still be available
     * later, if the map moves underneath it.  (A quick Google search didn't
     * find a more direct "get cur mouse position" API.)  So we will *update*
     * the current position, and then call the update-status function; in the
     * map scrolling case, we will not change the current position, but will
     * call status-update.
     */
    this.cur_mouse_pos = {x:offsetX, y:offsetY};
    this.update_status_pane();
  }
  update_status_pane() {
    const transform_matrix = this.bg_ctx.getTransform();
    const translate_X = transform_matrix.m41;
    const translate_Y = transform_matrix.m42;

    const indx_X = Math.floor((this.cur_mouse_pos.x - translate_X) / CELL_SIZE);
    const indx_Y = Math.floor((this.cur_mouse_pos.y - translate_Y) / CELL_SIZE);

    if (indx_X < 0 || indx_X >= this.grid   .length ||
        indx_Y < 0 || indx_Y >= this.grid[0].length)
    {
      return;
    }

    this.status_pane.innerHTML = `(${indx_X},${indx_Y})\n<br>` +
                                 `grid: ${this.grid[indx_X][indx_Y]}`;
  }
}


