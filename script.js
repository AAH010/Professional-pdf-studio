const dropArea = document.getElementById("dropArea");
const fileInput = document.getElementById("fileInput");

let filesArray = [];

dropArea.addEventListener("dragover", (e) => {
    e.preventDefault();
});

dropArea.addEventListener("drop", (e) => {
    e.preventDefault();
    filesArray = [...e.dataTransfer.files];
});

fileInput.addEventListener("change", () => {
    filesArray = [...fileInput.files];
});

async function generatePDF() {

    if (filesArray.length === 0) {
        alert("Upload at least one image!");
        return;
    }

    const { jsPDF } = window.jspdf;

    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
    });

    const bwMode = document.getElementById("bwMode").checked;
    const cropMargin = parseInt(document.getElementById("cropValue").value);

    for (let i = 0; i < filesArray.length; i++) {

        const file = filesArray[i];
        const reader = new FileReader();

        await new Promise((resolve) => {

            reader.onload = function (e) {

                const img = new Image();
                img.src = e.target.result;

                img.onload = function () {

                    const canvas = document.createElement("canvas");
                    const ctx = canvas.getContext("2d");

                    const newWidth = img.width - cropMargin * 2;
                    const newHeight = img.height - cropMargin * 2;

                    canvas.width = newWidth;
                    canvas.height = newHeight;

                    ctx.drawImage(
                        img,
                        cropMargin,
                        cropMargin,
                        newWidth,
                        newHeight,
                        0,
                        0,
                        newWidth,
                        newHeight
                    );

                    if (bwMode) {
                        const imageData = ctx.getImageData(0, 0, newWidth, newHeight);
                        const data = imageData.data;

                        for (let j = 0; j < data.length; j += 4) {
                            const avg = (data[j] + data[j+1] + data[j+2]) / 3;
                            data[j] = avg;
                            data[j+1] = avg;
                            data[j+2] = avg;
                        }

                        ctx.putImageData(imageData, 0, 0);
                    }

                    const finalImage = canvas.toDataURL("image/jpeg", 1.0);

                    if (i !== 0) doc.addPage();

                    const pageWidth = doc.internal.pageSize.getWidth();
                    const pageHeight = doc.internal.pageSize.getHeight();

                    doc.addImage(finalImage, "JPEG", 0, 0, pageWidth, pageHeight);

                    resolve();
                };
            };

            reader.readAsDataURL(file);
        });
    }

    doc.save("AAMIN_PROFESSIONAL_PDF_STUDIO.pdf");
}
