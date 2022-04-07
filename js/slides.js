class Slides {
    items = [];
    ui = {
        name: document.querySelector('#settings-sidebar > .image-name')
        , delete: document.querySelector('#settings-sidebar > .actions > button')
        , nav: document.querySelector('.nav')
        , result: document.querySelector('.nav > .result')
        , tags: document.querySelector(".tags-container > .body")
        , tag_action: document.querySelector(".tags-container > .heading > button")
        , gallery: document.querySelector("#gallery")
    };
    imageReg = /[\/.](jpg|jpeg|png)$/i;

    onActive        = function(){};
    onEmpty         = function(){};
    updateStorage   = function(){};

    constructor(args) {

        if(args.items)          this.items          = args.items;
        if(args.onActive)       this.onActive       = args.onActive;
        if(args.onEmpty)        this.onEmpty        = args.onEmpty;
        if(args.updateStorage)  this.updateStorage  = args.updateStorage;

        for(var i = 0; i < this.items.length; i++) {
            this.items[i].active = !i;
            
            for(var j = 0; j < this.items[i].tags.length; j++) {
                this.items[i].tags[j]['editing'] = false;
            }
        }
            
    
        this.updateSlide();
    }

    updateSlide(){
        var curr = this.getActive();
        var name;
        var tags = [];

        if(curr) {
            // Update Canvas
            this.onActive(curr.image, curr.tags);

            name = curr.name;
            tags = curr.tags;
        }

        this.updateName(name);
        this.updateNav();
        this.updateGallery();
    }

    getFirst() {
        return this.items.length > 0 ? this.items[0] : null
    }

    getActive() {
        var curr_index = this.getActiveIndex();
        return curr_index > -1 ? this.items[curr_index] : null;
    }

    getActiveIndex(){
        for(var i = 0; i < this.items.length; i++) {
            if(this.items[i].active) 
                return i;
        }
    }

    addSlide(image, name) {
        this.items.push({ 
            name: name
            , image: image
            , tags: []
            , active: true
        });

        this.updateStorage(this.items);
        this.setActive(this.items.length - 1);
    }

    deleteSlide() {
        var curr_index = this.getActiveIndex();
        var have_prev = curr_index - 1 > -1;
        var have_next = curr_index < this.items.length - 1;
        
        this.items.splice(curr_index, 1);

        if(have_next)
            this.items[curr_index].active = true;
        else if(have_prev)
            this.items[curr_index - 1].active = true;
        else this.onEmpty();

        this.updateSlide();
    }

    setActive(index) {
        var curr = this.getActive();
        curr.active = false;

        if(index < this.items.length && index > -1)
            this.items[index].active = true;
        
        this.updateSlide();
    }

    updateName(name) {
        if(name) {
            this.ui.name.textContent = name;
            this.ui.delete.classList.remove("hidden");
        }
        else {
            this.ui.name.textContent = "No image";
            this.ui.delete.classList.add("hidden");
        }
    }

    updateTags(tags, skip_save) {

        if(!skip_save) {
            // Update
            var curr = this.getActive();

            if(curr)
                curr.tags = tags;

            this.updateStorage(this.items);
        }

        //
        // Update UI
        var n_tags_ui = "Upload an image and drag on the canvas to create a tag.";
        var ui_tags = this.ui.tags;
        var ui_action = this.ui.tag_action;
    
        if(tags.length > 0) {
            n_tags_ui= "";

            var in_edit = false;
            
            for(var i = 0; i < tags.length; i++){
                if(!in_edit)
                    in_edit = tags[i].editing === true;

                var tag = tags[i];
                var text = tags[i].editing ? "Done" : "Adjust";
                var del = tags[i].editing ? "Cancel" : "Delete";
                var delCallback = tags[i].editing ? "cancelEditTag" : "deleteTag";

                n_tags_ui += "<div class='tag' data-type='"+text+"'>";
                n_tags_ui += "  <div class='tag-name'>"+ tag.name +"</div>";
                n_tags_ui += "  <a onclick='editTag("+i+")'>"+text+"</a>";
                n_tags_ui += "  <a onclick='"+delCallback+"("+i+")'>"+del+"</a>";
                n_tags_ui += "</div>";
            }

            if(in_edit) 
                ui_tags.classList.add("repositioning");
            else
                ui_tags.classList.remove("repositioning");
    
            ui_action.classList.remove("hidden");
        }
        else ui_action.classList.add("hidden");
        
        ui_tags.innerHTML = n_tags_ui;
        
    }
    
    updateNav() {
        // Nav Visibility
        if(this.items.length > 0) 
            this.ui.nav.classList.remove("hidden");
        else 
            this.ui.nav.classList.add("hidden");

        
        // Nav Result
        var curr_index = this.getActiveIndex() ?? 0;
        this.ui.result.textContent= (curr_index + 1) + " of " + this.items.length;

    }

    updateGallery() {
        var imgs = '';

        for(var i = 0; i < this.items.length; i++) {
            var img = this.items[i];
            var active_class = img.active ? "active" : "";
            
            imgs += "<div class='"+active_class+"' style='background-image: url(\""+img.image+"\");' name='"+ img.name +"' onclick='onImageSelect("+i+")'></div>";
        }
    
        this.ui.gallery.innerHTML = imgs;
        window.dispatchEvent(new Event("resize"));
    }

    prev() {
        var curr_index = this.getActiveIndex();
        var prev = curr_index - 1;

        if(prev < 0)
            prev = 0;

        this.setActive(prev);   
    }

    next() {
        var curr_index = this.getActiveIndex();
        var next = curr_index + 1;

        if(next >= this.items.length)
            next = this.items.length - 1;

        this.setActive(next);
    }
}