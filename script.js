document.addEventListener("DOMContentLoaded", () => {

    /* ================= ELEMENT ================= */
    const scanButton     = document.getElementById("scanButton");
    const writeModeBtn   = document.getElementById("writeModeBtn");
    const writeButton    = document.getElementById("writeButton");

    const writePopup     = document.getElementById("writePopup");
    const popupBackdrop  = document.getElementById("popupBackdrop");

    const writeInput     = document.getElementById("writeInput");
    const writeLog       = document.getElementById("writeLog");

    const statusMessage  = document.getElementById("statusMessage");
    const dataContent    = document.getElementById("dataContent");

    const typeButtons    = document.querySelectorAll(".type-btn");

    let selectedType = "text";

    /* ================= STATUS ================= */
    function setStatus(message, type) {
        statusMessage.className = "status " + type;
        statusMessage.textContent = "Status: " + message;
    }

    /* ================= NFC SUPPORT CHECK ================= */
    if (!("NDEFReader" in window)) {
        setStatus("Web NFC tidak didukung (Chrome Android + HTTPS)", "error");
        dataContent.textContent =
            "Perangkat atau browser Anda tidak mendukung Web NFC.";
        scanButton.disabled = true;
        writeModeBtn.disabled = true;
        return;
    }

    setStatus("Web NFC Didukung", "success");

    /* ================= TYPE TOGGLE ================= */
    typeButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            typeButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            selectedType = btn.dataset.type;
        });
    });

    /* ================= OPEN WRITE POPUP ================= */
    writeModeBtn.addEventListener("click", () => {
        writePopup.classList.add("active");
        popupBackdrop.classList.add("active");

        writeInput.value = "";
        selectedType = "text";

        typeButtons.forEach(b =>
            b.classList.toggle("active", b.dataset.type === "text")
        );

        writeLog.textContent =
            "Pilih jenis data, lalu isi konten NFC.";
    });

    /* ================= CLOSE POPUP ================= */
    popupBackdrop.addEventListener("click", () => {
        writePopup.classList.remove("active");
        popupBackdrop.classList.remove("active");
    });

    /* ================= WRITE NFC ================= */
    writeButton.addEventListener("click", async () => {

        const value = writeInput.value.trim();
        if (!value) {
            writeLog.textContent = "❌ Data tidak boleh kosong.";
            return;
        }

        if (selectedType === "url") {
            try {
                new URL(value);
            } catch {
                writeLog.textContent = "❌ URL tidak valid (harus http/https).";
                return;
            }
        }

        writeLog.textContent = "📳 Tempelkan kartu NFC ke ponsel...";

        try {
            const ndef = new NDEFReader();

            const record =
                selectedType === "url"
                    ? { recordType: "url", data: value }
                    : {
                        recordType: "mime",
                        mediaType: "text/plain",
                        data: value
                    };

            await ndef.write({ records: [record] });

            writeLog.textContent = "✅ Data berhasil ditulis ke NFC.";
            setStatus("Penulisan NFC Berhasil", "success");

            dataContent.textContent =
                "DATA TERSIMPAN:\n\n" + value;

        } catch (err) {
            writeLog.textContent = "❌ Gagal menulis NFC.";
            setStatus("Gagal Menulis NFC", "error");
        }
    });

    /* ================= SCAN NFC ================= */
    scanButton.addEventListener("click", async () => {

        /* tutup popup jika terbuka */
        writePopup.classList.remove("active");
        popupBackdrop.classList.remove("active");

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
                        output +=
                            new TextDecoder().decode(record.data) + "\n\n";
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
