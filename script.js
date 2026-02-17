const { jsPDF } = window.jspdf;

let folders = JSON.parse(localStorage.getItem("folders")) || [];

function saveData() {
    localStorage.setItem("folders", JSON.stringify(folders));
    updateStorage();
}

function createFolder() {
    const name = document.getElementById("folderName").value;
    if (!name) return alert("Enter folder name");

    folders.push({ name: name, files: [] });
    saveData();
    renderFolders();
}

function renderFolders() {
    const list = document.getElementById("folderList");
    list.innerHTML = "";

    folders.forEach((folder, i) => {
        list.innerHTML += `
            <div class="folder">
                <b>${folder.name}</b><br>
                Files: ${folder.files.length}
            </div>
        `;
    });
}

function generatePDF() {
    const input = document.getElementById("imageInput");
    const files = input.files;

    if (files.length === 0) return alert("Select images");

    if (files.length > 500) return alert("Max 500 pages allowed");

    const doc = new jsPDF("p","mm","a4");

    Array.from(files).forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            if(index>0) doc.addPage();
            doc.addImage(e.target.result,"JPEG",0,0,210,297);

            if(index === files.length-1){
                const pdfData = doc.output("datauristring");
                if(folders.length === 0) {
                    folders.push({ name:"Default", files:[] });
                }
                folders[0].files.push(pdfData);
                saveData();
                renderFolders();
                alert("PDF Saved in Folder!");
            }
        };
        reader.readAsDataURL(file);
    });
}

function updateStorage() {
    let total = JSON.stringify(folders).length;
    let percent = Math.min((total / 5000000) * 100, 100);
    document.getElementById("storageFill").style.width = percent + "%";
    document.getElementById("storageText").innerText =
        "Storage Used: " + percent.toFixed(2) + "%";
}

renderFolders();
updateStorage();
