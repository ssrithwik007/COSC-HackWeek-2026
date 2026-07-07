const dropZone = document.getElementById("dropZone");
const browseBtn = document.getElementById("browseBtn");
const fileInput = document.getElementById("fileInput");
const preview = document.getElementById("preview");
const metadata = document.getElementById("metadata");

browseBtn.addEventListener("click", () => {
    fileInput.click();
});

dropZone.addEventListener("click", () => {
    fileInput.click();
});

function createMetadataCard(title, items) {
    return `
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">

            <h3 class="text-xl font-bold mb-4 flex items-center gap-2">
                <span>${title}</span>
            </h3>

            <div class="space-y-3">
                ${items.map(item => `
                    <div class="flex justify-between items-center border-b border-slate-100 pb-2">
                        <span class="font-medium text-slate-600">
                            ${item.label}
                        </span>

                        <span class="text-right text-slate-800 break-all">
                            ${item.value}
                        </span>
                    </div>
                `).join("")}
            </div>

        </div>
    `;
}

function formatFileSize(bytes) {
    if(bytes < 1024) return (bytes + "Bytes");
    else if(bytes < 1024 * 1024) return ((bytes/1024).toFixed(2) + " KB");
    else return ((bytes/(1024*1024)).toFixed(2) + " MB");
}

function handleImage(file){
    const image = new Image();
    image.src = URL.createObjectURL(file);
    image.onload = () => {
        image.classList.add("max-w-full", "max-h-96", "rounded-lg", "shadow-lg");
        preview.appendChild(image);

        metadata.innerHTML += createMetadataCard(
            "Image Information",
            [
                {
                    label: "Width",
                    value: `${image.naturalWidth}px`
                },
                {
                    label: "Height",
                    value: `${image.naturalHeight}px`
                }
            ]
        );

        URL.revokeObjectURL(image.src);

        EXIF.getData(file, function() {
            const data = {
                make: EXIF.getTag(this, "Make") || "Not Available",
                model: EXIF.getTag(this, "Model") || "Not Available",
                dateTaken: EXIF.getTag(this, "DateTimeOriginal") || "Not available",
                latitude: EXIF.getTag(this, "GPSLatitude") || "Not available",
                longitude: EXIF.getTag(this, "GPSLongitude") || "Not available"
            }

            metadata.innerHTML += createMetadataCard(
                "EXIF Information",
                [
                    {
                        label: "Camera Make",
                        value: data.make || "Not Available"
                    },
                    {
                        label: "Camera Model",
                        value: data.model || "Not Available"
                    },
                    {
                        label: "Date Taken",
                        value: data.dateTaken || "Not Available"
                    },
                    {
                        label: "Latitude",
                        value: data.latitude || "Not Available"
                    },
                    {
                        label: "Longitude",
                        value: data.longitude || "Not Available"
                    }
                ]
            );
        });

    };
}

async function handlePDF(file) {
    try {
        const arrayBuffer = await file.arrayBuffer();

        const pdf = await pdfjsLib.getDocument({
            data: arrayBuffer
        }).promise;

        // Create canvas
        const canvas = document.createElement("canvas");
        canvas.classList.add(
            "max-w-full",
            "rounded-lg",
            "shadow-lg"
        );

        const context = canvas.getContext("2d");

        // Get first page
        const page = await pdf.getPage(1);

        const viewport = page.getViewport({
            scale: 1.5
        });

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        // Render page
        await page.render({
            canvasContext: context,
            viewport: viewport
        }).promise;

        // Show preview
        preview.appendChild(canvas);

        // Show metadata
        metadata.innerHTML += createMetadataCard(
            "PDF Information",
            [
                {
                    label: "Pages",
                    value: pdf.numPages
                }
            ]
        );
    }
    catch (error) {
        console.error(error);

        preview.innerHTML = `
            <p class="text-red-500">
                Failed to load PDF.
            </p>
        `;
    }
}

function inspectFile(file) {
    preview.innerHTML = "";
    metadata.innerHTML = "";
    const size = formatFileSize(file.size);
    const modifiedDate = new Date(file.lastModified).toLocaleString();

    metadata.innerHTML = createMetadataCard(
        "General Information",
        [
            {
                label: "Name",
                value: file.name
            },
            {
                label: "Size",
                value: size
            },
            {
                label: "Type",
                value: file.type
            },
            {
                label: "Modified",
                value: modifiedDate
            }
        ]
    );
    if (file.type.startsWith("image/")) {
        handleImage(file);
    }
    else if (file.type === "application/pdf") {
        handlePDF(file);
    }

}

fileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    inspectFile(file);
});

dropZone.addEventListener("dragover", (event) => {
    event.preventDefault();

    dropZone.classList.add("border-blue-500", "bg-blue-50");
});

dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("border-blue-500", "bg-blue-50");
});

dropZone.addEventListener("drop", (event) => {
    event.preventDefault();

    dropZone.classList.remove("border-blue-500", "bg-blue-50");

    const file = event.dataTransfer.files[0];

    if (!file) return;

    inspectFile(file);
});
