
const dropArea = document.getElementById('drop-area');
const fileList = document.getElementById('file-list');
const uploadProgress = document.getElementById('upload-progress');
const submitBtn = document.getElementById('submitBtn');
const clearBtn = document.getElementById('clearBtn');
const fileInput = document.getElementById('fileElem');
const resultArea = document.getElementById('result');
let selectedFiles = new Set();


['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight, false);
});

function highlight(e) {
    dropArea.querySelector('div').classList.remove('border-gray-300');
    dropArea.querySelector('div').classList.add('border-blue-500');
}

function unhighlight(e) {
    dropArea.querySelector('div').classList.add('border-gray-300');
    dropArea.querySelector('div').classList.remove('border-blue-500');
}

dropArea.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
    let dt = e.dataTransfer;
    let files = dt.files;
    fileInput.files = files;
    handleFiles(files);
}

function handleFiles(files) {
    ([...files]).forEach(file => {
        if (!Array.from(selectedFiles).some(f => f.name === file.name && f.size === file.size)) {
            selectedFiles.add(file);
        }
    });
    updateFileList();
}


// function handleFiles(files) {
//     fileList.innerHTML = '';
//     if (files.length > 0) {
//         submitBtn.disabled = false;
//         clearBtn.disabled = false;
//         ([...files]).forEach(file => {
//             const fileItem = document.createElement('div');
//             fileItem.className = 'file-item bg-gray-100 p-2 rounded text-sm text-gray-700';
//             fileItem.textContent = `${file.name} (${formatFileSize(file.size)})`;
//             fileList.appendChild(fileItem);
//         });
//     } else {
//         submitBtn.disabled = true;
//         clearBtn.disabled = true;
//     }
// }

function updateFileList() {
    fileList.innerHTML = '';
    selectedFiles.forEach(file => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item bg-gray-100 p-2 rounded text-sm text-gray-700 flex justify-between items-center';
        fileItem.innerHTML = `
            <span>${file.name} (${formatFileSize(file.size)})</span>
            <button class="remove-file text-red-500 hover:text-red-700 text-xl" data-name="${file.name}" data-size="${file.size}">
                &times;
            </button>
        `;
        fileList.appendChild(fileItem);
    });

    submitBtn.disabled = selectedFiles.size === 0;
    clearBtn.disabled = selectedFiles.size === 0;

    // Afegir event listeners per als botons d'eliminació
    document.querySelectorAll('.remove-file').forEach(button => {
        button.addEventListener('click', function() {
            const name = this.getAttribute('data-name');
            const size = parseInt(this.getAttribute('data-size'));
            removeFile(name, size);
        });
    });
}

function removeFile(name, size) {
    selectedFiles.forEach(file => {
        if (file.name === name && file.size === size) {
            selectedFiles.delete(file);
        }
    });
    updateFileList();
}

function formatFileSize(bytes) {
    if(bytes < 1024) return bytes + ' bytes';
    else if(bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
    else if(bytes < 1073741824) return (bytes / 1048576).toFixed(2) + ' MB';
    else return (bytes / 1073741824).toFixed(2) + ' GB';
}

fileInput.addEventListener('change', function(e) {
    handleFiles(this.files);
});

clearBtn.addEventListener('click', function(e) {
    fileInput.value = '';
    fileList.innerHTML = '';
    submitBtn.disabled = true;
    clearBtn.disabled = true;
    uploadProgress.textContent = '';
    resultArea.innerHTML = '';
    resultArea.classList.add( "hidden" );
});

document.getElementById('uploadForm').addEventListener('submit', uploadFiles);

function closeResult() {
    uploadProgress.textContent = ''
    resultArea.classList.add( "hidden" );
    resultArea.innerHTML = '';
}

function uploadFiles(e) {
    e.preventDefault();

    let files = fileInput.files;
    if (files.length === 0) {
        alert('Si us plau, selecciona almenys un fitxer per pujar.');
        return;
    }
    submitBtn.disabled = true
    clearBtn.disabled = true;
    let formData = new FormData();

    // for(let i = 0; i < files.length; i++) {
    //     // Utilitzem el nom del fitxer codificat en Base64 per evitar problemes de codificació
    //     let encodedFilename = btoa(unescape(encodeURIComponent(files[i].name)));
    //     formData.append('filesEnviar', files[i], encodedFilename);
    // }
                
    selectedFiles.forEach(file => {
        let encodedFilename = btoa(unescape(encodeURIComponent(file.name)));
        formData.append('filesEnviar', file, encodedFilename);
    });

    submitBtn.textContent = 'Pujant...';

    fetch('/upload-drag', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(result => {
        resultArea.innerHTML = `
            <h3 class="text-xl font-semibold mb-4 text-green-600">${result.message}</h3>
            <ul class="list-disc list-inside space-y-2">
                ${result.files.map(file => `
                    <li class="text-gray-700">${decodeFileName(file.originalName)} (${formatFileSize(file.size)})</li>
                `).join('')}
            </ul>
            <button class="bg-red-500 text-white mt-4 py-2 px-4 rounded hover:bg-red-600 transition duration-300" onclick="closeResult()">
                Tancar
            </button>
        `;
        resultArea.classList.remove( "hidden" );
        uploadProgress.textContent = 'Pujada completada!';
        uploadProgress.className = 'mt-4 text-center text-green-600 font-semibold';
        fileInput.value = '';
        fileList.innerHTML = '';
    })
    .catch(error => {
        resultArea.innerHTML = '<p class="text-red-600 font-semibold">Error en pujar els fitxers</p>';
        resultArea.classList.remove( "hidden" );
        uploadProgress.textContent = 'Error en la pujada';
        uploadProgress.className = 'mt-4 text-center text-red-600 font-semibold';
        console.error('Error:', error);
    })
    .finally(() => {
        submitBtn.disabled = true;
        clearBtn.disabled = true;
        submitBtn.textContent = 'Pujar Fitxers';
        fileInput.value = '';
        fileList.innerHTML = '';
        selectedFiles = new Set();
    });

}

function decodeFileName(encodedName) {
    try {
        return decodeURIComponent(escape(atob(encodedName)));
    } catch (e) {
        console.error('Error decoding filename:', e);
        return encodedName;
    }
}
