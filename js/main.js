var storage = new Storage({ key: 'slides', def: [] });

var canvas = new Canvas({ 
    canvas: document.getElementById('artwork')
    , onUpdate: onUpdate
});

var slides = new Slides({
    items: storage.value()
    , onActive:         function (img, tags)    { canvas.setImage(img, tags); }
    , onEmpty:          function ()             { canvas.clear(); }
    , updateStorage:    function (items)        { storage.save(items); }
});

function onUpdate (tags) {
    if(slides)
        slides.updateTags(tags);
}

function uploadImage(input) {
    
    if(input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onloadstcanvas = function(e) {
            var is_img = imageReg.test(input.files[0].name);
            
            if(!is_img) {
                alert("File must be jpg or jpeg or png");
                reader.abort();
            }
        }

        reader.onload = function(e) {
            var image_name = prompt("Image name", input.files[0].name);

            if(!image_name) {
                image_name = prompt("Image name cannot be empty");

                if(image_name) 
                    slides.addSlide(e.target.result, image_name);
                        
                else 
                    alert("Image not uploaded");

            } else slides.addSlide(e.target.result, image_name);
        }

        reader.readAsDataURL(input.files[0]);
    }
}

function deleteImage() {
    var yes = confirm("Are you sure?");

    if(!yes)
        return;
    
    slides.deleteSlide();
    canvas.clear()
}

function editTag(index) {
    canvas.editTag(index);
}

function cancelEditTag(index) {
    var yes = confirm("Are you sure?");

    if(yes)
        canvas.cancelEditTag(index);
}

function deleteTag(index) {
    var yes = confirm("Are you sure?");

    if(yes)
        canvas.deleteTag(index);
}

function deleteAllTags() {
    var yes = confirm("Are you sure?");

    if(yes)
        canvas.deleteAllTag();
}

function onPrev(){
    slides.prev();
}

function onNext(){
    slides.next();
}

function onImageSelect(z) {
    slides.setActive(z)
}
