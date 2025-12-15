document.addEventListener("DOMContentLoaded", () => {

    const scanButton    = document.getElementById("scanButton");
    const writeModeBtn  = document.getElementById("writeModeBtn");
    const writeButton   = document.getElementById("writeButton");

    const writePopup    = document.getElementById("writePopup");
    const popupBackdrop = document.getElementById("popupBackdrop");

    const writeInput    = document.getElementById("writeInput");
    const writeLog      = document.getElementById("writeLog");

    const statusMessage = document.getElementById("statusMessage");
    const dataContent   = document.getElementById("dataContent");

    const typeButtons   = document.querySelectorAll(".type-btn");

    let selectedType = "text";
    let popupOpen = false;

    /* ================= STATUS UTAMA ================= */
    function setStatus(msg, type) {
        statusMessage.className = "status " + type;
        statusMessage.textContent = "Status: " + msg;
    }

    /* ================= STATUS POPUP ================= */
    function setPopupStatus(msg, type = "info") {
        writeLog.className = "mini-log " + type;
        writeLog.innerHTML = msg;
    }

    /* ================= NFC SUPPORT ================= */
    if (!("NDEFReader" in window)) {
        setStatus("Web NFC tidak didukung", "error");
        scanButton.disabled = true;
        writeModeBtn.disabled = true;
        return;
    }

    setStatus("Web NFC Didukung", "success");

    /* ================= TYPE ================= */
    typeButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            typeButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            selectedType = btn.dataset.type;
        });
    });

    /* ================= OPEN POPUP ================= */
    function openPopup() {
        popupOpen = true;
        writePopup.classList.add("active");
        popupBackdrop.classList.add("active");

        scanButton.disabled = true;
        writeInput.value = "";
        writeInput.focus();

        selectedType = "text";
        typeButtons.forEach(b =>
            b.classList.toggle("active", b.dataset.type === "text")
        );

        setPopupStatus(
            '📋 Isi data NFC lalu tempelkan kartu<br>📳 <span class="nfc-scan">Menunggu aksi</span>'
        );
    }

    /* ================= CLOSE POPUP ================= */
    function closePopup() {
        popupOpen = false;
        writePopup.classList.remove("active");
        popupBackdrop.classList.remove("active");
        scanButton.disabled = false;
    }

    writeModeBtn.addEventListener("click", openPopup);
    popupBackdrop.addEventListener("click", closePopup);

    /* ================= ESC KEY ================= */
    document.addEventListener("keydown", e => {
        if (e.key === "Escape" && popupOpen) {
            closePopup();
        }
    });

    /* ================= WRITE NFC ================= */
    writeButton.addEventListener("click", async () => {

        const value = writeInput.value.trim();
        if (!value) {
            setPopupStatus("❌ Data tidak boleh kosong", "error");
            return;
        }

        setPopupStatus(
            '📳 Tempelkan kartu NFC... <span class="nfc-scan">Menunggu</span>'
        );

        try {
            const ndef = new NDEFReader();
            const record =
                selectedType === "url"
                    ? { recordType: "url", data: value }
                    : { recordType: "mime", mediaType: "text/plain", data: value };

            await ndef.write({ records: [record] });

            setPopupStatus("✅ Data berhasil ditulis ke NFC", "success");
            setStatus("Penulisan NFC Berhasil", "success");

            dataContent.textContent =
                "DATA TERSIMPAN:\n\n" + value;

        } catch {
            setPopupStatus("❌ Gagal menulis NFC", "error");
            setStatus("Gagal Menulis NFC", "error");
        }
    });

    /* ================= SCAN NFC ================= */
    scanButton.addEventListener("click", async () => {

        setStatus("Menunggu Kartu NFC...", "info");
        dataContent.innerHTML =
            '📳 Scan NFC <span class="nfc-scan">Menunggu</span>';

        try {
            const ndef = new NDEFReader();
            await ndef.scan();

            ndef.onreading = event => {
                let output = "DATA NFC:\n\n";
                event.message.records.forEach((r, i) => {
                    output += `Record ${i+1}\n`;
                    output += new TextDecoder().decode(r.data) + "\n\n";
                });
                dataContent.textContent = output;
                setStatus("Scan Berhasil", "success");
            };

        } catch {
            setStatus("Scan Dibatalkan", "error");
        }
    });

});
