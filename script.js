document.addEventListener("DOMContentLoaded", () => {

    const scanButton     = document.getElementById("scanButton");
    const writeModeBtn   = document.getElementById("writeModeBtn");
    const writeSection   = document.getElementById("writeSection");
    const writeButton    = document.getElementById("writeButton");

    const writeInput     = document.getElementById("writeInput");
    const statusMessage  = document.getElementById("statusMessage");
    const dataContent    = document.getElementById("dataContent");

    const typeButtons    = document.querySelectorAll(".type-btn");

    let selectedType = "text";

    
    function setStatus(message, type) {
        statusMessage.className = "status " + type;
        statusMessage.textContent = "Status: " + message;
    }

  
    if (!("NDEFReader" in window)) {
        setStatus("Web NFC tidak didukung (Chrome Android + HTTPS)", "error");
        dataContent.textContent =
            "Perangkat atau browser Anda tidak mendukung Web NFC.";
        scanButton.disabled = true;
        return;
    }

    setStatus("Web NFC Didukung", "success");

    
    typeButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            typeButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            selectedType = btn.dataset.type;
        });
    });

   
    writeModeBtn.addEventListener("click", () => {
        writeSection.style.display = "block";   
        writeInput.value = "";                  
        selectedType = "text";

        typeButtons.forEach(b => {
            b.classList.toggle("active", b.dataset.type === "text");
        });

        setStatus("Mode Tulis NFC Aktif", "info");
        dataContent.textContent =
            "Masukkan data (multi baris diperbolehkan), lalu tempelkan kartu NFC.";
    });

    
    writeButton.addEventListener("click", async () => {

        const value = writeInput.value.trim();

        if (!value) {
            alert("Data tidak boleh kosong!");
            return;
        }

        
        if (selectedType === "url") {
            try {
                new URL(value);
            } catch {
                alert("URL tidak valid!\nGunakan https:// atau http://");
                return;
            }
        }

        try {
            const ndef = new NDEFReader();
            await ndef.write({
                records: [
                    {
                        recordType: selectedType,
                        data: value
                    }
                ]
            });

            setStatus("Penulisan NFC Berhasil", "success");
            dataContent.textContent =
                "DATA TERSIMPAN:\n\n" + value;

        } catch (err) {
            setStatus("Gagal Menulis NFC", "error");
            dataContent.textContent = err.message;
        }
    });

   
    scanButton.addEventListener("click", async () => {

        writeSection.style.display = "none";
        setStatus("Menunggu Kartu NFC...", "info");
        dataContent.textContent = "Tempelkan kartu NFC ke ponsel.";

        try {
            const ndef = new NDEFReader();
            await ndef.scan();

            ndef.onreading = event => {
                let output = "DATA NFC:\n\n";

                event.message.records.forEach((record, index) => {
                    output += `Record ${index + 1}\n`;
                    output += `Type : ${record.recordType}\n`;
                    output += `Data :\n`;

                    try {
                        const text = new TextDecoder().decode(record.data);
                        output += text + "\n\n";
                    } catch {
                        output += "[Binary Data]\n\n";
                    }
                });

                dataContent.textContent = output;
                setStatus("Scan Berhasil", "success");
            };

            ndef.onreadingerror = () => {
                setStatus("Gagal Membaca NFC", "error");
                dataContent.textContent =
                    "Kartu tidak bisa dibaca atau terenkripsi.";
            };

        } catch (err) {
            setStatus("Scan Dibatalkan / NFC Mati", "error");
            dataContent.textContent = err.message;
        }
    });

});
