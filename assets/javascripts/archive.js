function Archive(image_metadata) {

    this.image_metadata = image_metadata;

}

Archive.prototype.save = async function() {

    function getImageDimensions(fileRef) {
        return new Promise(accept => {
            var reader = new FileReader();
            reader.addEventListener("load", function() {

                var image = new Image();

                image.addEventListener("load", function() {

                    accept({
                        width: image.naturalWidth,
                        height: image.naturalHeight
                    });

                });

                image.src = reader.result;

            });

            reader.readAsDataURL(fileRef);

        });

    }

    var zip = new JSZip();

    document.getElementById("waitMessage").textContent = "";
    document.getElementById("waitDialog").style.display = "inline-block";

    for (var metadata in this.image_metadata) {

        if (!this.image_metadata[metadata].include_in_archive) {
            continue;
        }

        if (!('width' in this.image_metadata[metadata].dimensions && 'height' in this.image_metadata[metadata].dimensions)) {

            var dimensions = await getImageDimensions(this.image_metadata[metadata].fileref);

            this.image_metadata[metadata].set_dimensions(dimensions.width, dimensions.height);

        }

        var attributes = {
            filename: metadata,
            size: this.image_metadata[metadata].size,
            dimensions: this.image_metadata[metadata].dimensions,
            regions: this.image_metadata[metadata].regions
        }

        var tags = JSON.stringify(attributes);
        var tags_file_name = metadata.replace(/\.[^/.]+$/, "");

        zip.file(metadata, this.image_metadata[metadata].fileref);
        zip.file(`${tags_file_name}.json`, tags);

        window.setTimeout((filename) => {
            document.getElementById("waitMessage").textContent = `Generating : ${filename}`;
        }, 1, tags_file_name);

    }

    window.setTimeout(() => {
        document.getElementById("waitMessage").textContent = "Saving Archive...";
    }, 1, tags_file_name);

    zip.generateAsync({ type: "blob" })
        .then(function(blob) {
            var click = function(node) {
                var event = new MouseEvent("click");
                node.dispatchEvent(event);
            }

            document.body.onfocus = function() {
                document.getElementById("waitDialog").style.display = "none";
                document.body.onfocus = null;
            }

            var saveLink = document.createElementNS("http://www.w3.org/1999/xhtml", "a");
            var canUseSaveLink = "download" in saveLink;
            var properties = { type: 'application/zip' };
            var filename = "yatt.zip";

            var file = new Blob([blob], properties);

            var fileURL = URL.createObjectURL(file);

            saveLink.href = fileURL;
            saveLink.download = filename;

            click(saveLink);

        });

}

Archive.prototype.load = function(img_metadata) {

    return new Promise(accept => {

        document.getElementById("waitMessage").textContent = "";
        document.getElementById("waitDialog").style.display = "inline-block";

        window.setTimeout(() => {
            function get_blob(file) {

                return new Promise(resolve => {
                    file.async("blob").then(function(blob) {
                        resolve(blob);
                    });

                });

            }

            function read_blob(url) {

                return new Promise(resolve => {
                    var reader = new FileReader();

                    reader.onload = function() {
                        resolve(reader.result);
                    }

                    reader.readAsText(url);

                });

            }
            var loadButton = document.createElementNS("http://www.w3.org/1999/xhtml", "input");

            loadButton.setAttribute("type", "file");
            loadButton.accept = '.zip';

            loadButton.onchange = function(event) {
                document.getElementById("waitMessage").textContent = "";
                document.getElementById("waitDialog").style.display = "inline-block";

                var user_selected_archives = event.target.files;

                for (var iFile = 0; iFile < user_selected_archives.length; ++iFile) {

                    var reader = new FileReader();

                    reader.onload = function() {
                        var images = {};
                        var tags = {};
                        var names = {};

                        var zip = new JSZip();

                        zip.loadAsync(reader.result).then(async function(zip) {
                            var files = zip.file(/.*/);

                            for (var iFile = 0; iFile < files.length; iFile++) {
                                var file = files[iFile];
                                var fileUrl = await get_blob(file);
                                var image_name = file.name.replace(/\.[^/.]+$/, "");

                                if (file.name.endsWith('.json')) {
                                    var json = await read_blob(fileUrl);

                                    tags[image_name] = JSON.parse(json);

                                } else {
                                    images[image_name] = fileUrl;
                                    names[image_name] = file.name;

                                    window.setTimeout((filename) => {
                                        document.getElementById("waitMessage").textContent = `Loading : ${filename}`;
                                    }, 1, file.name);
                                }

                            }

                            document.getElementById("waitDialog").style.display = "none";

                            accept({
                                images: images,
                                tags: tags,
                                names: names
                            });

                        });

                    }

                    reader.readAsArrayBuffer(user_selected_archives[iFile]);

                }

            };

            document.body.onfocus = function() {

                document.getElementById("waitDialog").style.display = "none";
                document.body.onfocus = null;

            }

            loadButton.click();

        }, 100);

    });

}