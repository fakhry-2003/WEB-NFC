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
    function setStatus(message, type = "info") {
        statusMessage.className = "status " + type;
        statusMessage.textContent = "Status: " + message;
    }

    function setPopupStatus(message, type = "info") {
        writeLog.className = "write-log " + type;
        writeLog.textContent = message;
    }

    /* ================= CLOSE POPUP ================= */
    function closePopup() {
        writePopup.classList.remove("active");
        popupBackdrop.classList.remove("active");
        scanButton.disabled = false;
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

    /* ================= PREVENT POPUP CLOSE ================= */
    writePopup.addEventListener("click", (e) => {
        e.stopPropagation();
    });

    /* ================= TYPE TOGGLE ================= */
    typeButtons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            typeButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            selectedType = btn.dataset.type;
        });
    });

    /* ================= OPEN WRITE POPUP ================= */
    writeModeBtn.addEventListener("click", () => {
        writePopup.classList.add("active");
        popupBackdrop.classList.add("active");

        scanButton.disabled = true;

        writeInput.value = "";
        writeInput.focus();

        selectedType = "text";
        typeButtons.forEach(b =>
            b.classList.toggle("active", b.dataset.type === "text")
        );

        setPopupStatus("Masukkan data, lalu tempelkan kartu NFC.", "info");
    });

    /* ================= BACKDROP CLOSE ================= */
    popupBackdrop.addEventListener("click", () => {
        closePopup();
    });

    /* ================= ESC / BACK ANDROID ================= */
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && writePopup.classList.contains("active")) {
            closePopup();
        }
    });

    /* ================= WRITE NFC FUNCTION ================= */
    async function writeNFCWithWaiting(records) {
        const ndef = new NDEFReader();

        // Aktifkan NFC engine (scan mode)
        await ndef.scan();

        setPopupStatus("📳 Tempelkan kartu NFC ke ponsel...", "info");

        // Tunggu sebentar biar user siap
        await new Promise(resolve => setTimeout(resolve, 600));

        // Tulis NFC
        await ndef.write({ records });
    }

    /* ================= WRITE NFC BUTTON ================= */
    writeButton.addEventListener("click", async (e) => {
        e.stopPropagation();

        const value = writeInput.value.trim();
        if (!value) {
            setPopupStatus("❌ Data tidak boleh kosong", "error");
            return;
        }

        if (selectedType === "url") {
            try {
                new URL(value);
            } catch {
                setPopupStatus("❌ URL tidak valid (http/https)", "error");
                return;
            }
        }

        try {
            await writeNFCWithWaiting([
                selectedType === "url"
                    ? { recordType: "url", data: value }
                    : { recordType: "mime", mediaType: "text/plain", data: value }
            ]);

            setPopupStatus("✅ Data berhasil ditulis ke NFC", "success");
            setStatus("Penulisan NFC Berhasil", "success");

            dataContent.textContent = "DATA TERSIMPAN:\n\n" + value;

        } catch (err) {
            setPopupStatus("❌ Gagal menulis NFC", "error");
            setStatus("Gagal Menulis NFC", "error");
        }
    });

    /* ================= SCAN NFC ================= */
    scanButton.addEventListener("click", async () => {

        closePopup();

        setStatus("📳 Menunggu Kartu NFC...", "info");
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
                        output += new TextDecoder().decode(record.data) + "\n\n";
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
