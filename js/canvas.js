function wrapText (ctx, text, x, y, max_width, line_height) {
    var words = text.split(' ');
    var line= '';

    for(var i = 0; i < words.length; i++) {
        var test_line = line + words[i] + ' ';
        var metrics = ctx.measureText(test_line);
        
        if(metrics.width > max_width && i > 0) {
            ctx.fillText(line, x, y);
            line = words[i] + ' ';
            y += line_height;
        }
        else line = test_line;

        ctx.fillText(line, x, y);
    }
}

class Canvas {

    title   = "";
    tags    = [];
    image   = "";
    img_attr; 
    resized = true;

    highlight = false;
    wrapper;
    canvas;
    ctx;

    constructor(args) {
        if(!args)
            return;
        
        if(args.onUpdate) 
            this.onUpdate = args.onUpdate;
        
        if(args.canvas) {
            this.canvas = args.canvas;
            this.wrapper = this.canvas.parentNode;
            this.guide = this.wrapper.querySelector('.guiding--block');

            this.ctx = this.canvas.getContext('2d');
            
            this.listenHighlight();
            
            window.onresize = function () {
                this.resized = true;

                this.canvas.width = this.wrapper.offsetWidth;
                this.canvas.height = this.wrapper.offsetHeight;

                if(this.canvas.width <= 767)
                    this.canvas.height = this.canvas.width;

                this.reDraw();
            }.bind(this);

            window.dispatchEvent(new Event("resize"));
        }
    } // end constructor

    reDraw() {
        if(!this.canvas)  console.log("No canvas to draw on ..");
        else {
            if(!this.image)
                return;
             
            if(typeof this.onUpdate === "function")
                this.onUpdate(this.tags);
            
            this.updateImageRatio(this.image, this.canvas);

            this.ctx.clearRect(0,0, this.canvas.width, this.canvas.height);

            var img_attr = this.img_attr;

            if(!this.img_attr)
                return;
            
            this.ctx.drawImage(
                this.image
                , 0, 0
                , this.image.width, this.image.height
                , img_attr.x, img_attr.y
                , img_attr.width, img_attr.height
            );

            //this.ctx.strokeRect(img_attr.x, img_attr.y, img_attr.width, img_attr.height)

            if(this.tags.length > 0) {
                
                var padding = 8;
                var color = "#000";
                var font_size = window.innerWidth * 0.02;

                if(font_size > 18)
                    font_size = 18;

                for(var i = 0; i < this.tags.length; i++) {
                    var t = this.tags[i];

                    var tag_left    = t.left * img_attr.width + img_attr.x;
                    var tag_top     = t.top * img_attr.height + img_attr.y;

                    var tag_width   = t.width * img_attr.width;
                    var tag_height  = t.height * img_attr.height;


                    this.ctx.beginPath();
                    this.ctx.rect(tag_left, tag_top, tag_width, tag_height);
                    this.ctx.strokeStyle = color;
                    this.ctx.stroke();

                    this.ctx.font= font_size + "px Arial";
                    this.ctx.textAlign="left"; 
                    this.ctx.textBaseline = "top";
                    this.ctx.fillStyle = color;

                    var text_top    = tag_top  + padding;
                    var text_left   = tag_left + padding;
                    var text_width  = tag_width- padding * 2;
                    var line_height = font_size + 3;

                    wrapText(this.ctx, t.name, text_left, text_top, text_width, line_height);
                }
            }
        }
    }

    updateImageRatio(el, canvas) {

        if(!this.resized || !el.height || !el.width)
            return;

        var ratio_height = canvas.height / el.height;
        var ratio_width = canvas.width / el.width;
        var ratio = Math.min(ratio_height, ratio_width);

        var shift_x = ( canvas.width - el.width * ratio ) / 2;
        var shift_y = ( canvas.height - el.height * ratio ) / 2;  

        var img_w_ratio = el.width * ratio;
        var img_h_ratio = el.height * ratio;

        this.img_attr = {
            x: shift_x
            , y: shift_y
            , width: img_w_ratio
            , height: img_h_ratio
            , ratio
        };

        this.resized = false;
    }

    listenHighlight () {
        if(!this.image) {
            this.wrapper.onmousedown = function(){
                alert("Please upload an image to begin.");
            }

            return;
        }

        var state = {
            mouse_down: false
            , start_x: 0
            , start_y: 0
        };

        function calHighlight(ax) {
            // Handle state
            var n_width = ax.x - state.start_x;
            var n_height = ax.y - state.start_y;
            var n_left = state.start_x;
            var n_top = state.start_y;

            if(n_width <= 0) {
                n_width *= -1;
                n_left -= n_width;
            }

            if(n_height <= 0) {
                n_height *= -1;
                n_top -= n_height;
            }

            return {
                width: n_width,
                height: n_height,
                x: n_left,
                y: n_top
            }
        }

        var getAxis = function (e) {
            var boundary = this.wrapper.getBoundingClientRect();
            var x_axix = e.clientX - boundary.left;
            var y_axix = e.clientY - boundary.top;
    
            return { x: x_axix, y: y_axix }
        }.bind(this)

        this.wrapper.onmouseleave = function () {
            this.wrapper.style.cursor="auto";

            if(this.guide)
                this.guide.classList.remove('active');
        }.bind(this)

        this.wrapper.onmousedown = function(e) {
            var axis = getAxis(e)

            state.start_x = axis.x;
            state.start_y = axis.y;
            state.mouse_down = true;

            this.wrapper.style.cursor="crosshair";

            if(this.guide) {
                this.guide.classList.add('active');
                this.guide.style.left = axis.x + 'px';
                this.guide.style.top = axis.y + 'px';
                this.guide.style.width = '0px';
                this.guide.style.height = '0px';
            }
        }.bind(this)

        this.wrapper.onmouseup = function (e) {
            
            var threshold_w = 20;
            var threshold_h = 20;

            var axis = getAxis(e)
            var attr = calHighlight(axis)

            state.mouse_down = false;
            this.wrapper.style.cursor="auto";

            if(attr.width <= threshold_w || attr.height < threshold_h) {
                if(this.guide)
                    this.guide.classList.remove('active');

            } else {
                var tag = window.prompt("Enter a name");

                if(tag && tag.trim() !== "") {

                    var img_attr = this.img_attr;
                    var img_width = parseFloat(img_attr.width);
                    var img_height = parseFloat(img_attr.height);

                    this.tags.push({ 
                        name: tag
                        , left: (attr.x - img_attr.x) / img_width
                        , top: (attr.y - img_attr.y) / img_height
                        , width: attr.width / img_width
                        , height: attr.height / img_height
                    });

                    this.reDraw();

                    if(typeof this.onUpdate === "function") 
                        this.onUpdate(this.tags);
                } // end tag

                if(this.guide)
                    this.guide.classList.remove('active');
            }

        }.bind(this)

        this.wrapper.onmousemove = function (e) {
            if(!state.mouse_down)
                return;
            
            var axis = getAxis(e)
            var attr = calHighlight(axis)

            // Draw
            if(this.guide) {
                this.guide.style.top = attr.y + 'px';
                this.guide.style.left = attr.x + 'px';
                this.guide.style.width = attr.width + 'px';
                this.guide.style.height = attr.height + 'px';
            }
        }.bind(this)

        this.highlight = true;
    }

    setImage(img, n_tags) {
        this.resized = true;
        this.tags = [];

        if(n_tags)
            this.tags = n_tags;
            
        if(!this.image) {
            this.image = new Image();
            this.image.onload = this.reDraw.bind(this);
        }

        if(!this.highlight)
            this.listenHighlight();

        this.image.src = img;
    }

    deleteTag(index) {
        if(this.tags && this.tags.hasOwnProperty(index)) {
            this.tags.splice(index, 1);
            
            this.reDraw();
        }
    }

    deleteAllTag() {
        this.tags = [];

        this.reDraw();
    }

    clear() {
        this.ctx.clearRect(0,0, this.canvas.width, this.canvas.height);

        if(typeof this.onUpdate === "function")
            this.onUpdate([]);
    }
}