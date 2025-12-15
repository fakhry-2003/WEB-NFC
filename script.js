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

    /* ================= STATUS ================= */
    function setStatus(msg, type) {
        statusMessage.className = "status " + type;
        statusMessage.textContent = "Status: " + msg;
    }

    /* ================= NFC SUPPORT ================= */
    if (!("NDEFReader" in window)) {
        setStatus("Web NFC tidak didukung", "error");
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

    /* ================= OPEN POPUP ================= */
    function openPopup() {
        writePopup.classList.add("active");
        popupBackdrop.classList.add("active");

        scanButton.disabled = true; // 🔴 disable scan
        writeInput.focus();         // 🧠 auto focus

        writeInput.value = "";
        writeLog.innerHTML =
            '📳 Tempelkan kartu NFC saat menulis <span class="nfc-scan">menunggu</span>';

        history.pushState({ popup: true }, "");
    }

    /* ================= CLOSE POPUP ================= */
    function closePopup() {
        writePopup.classList.remove("active");
        popupBackdrop.classList.remove("active");

        scanButton.disabled = false; // 🔓 enable scan
    }

    writeModeBtn.addEventListener("click", openPopup);
    popupBackdrop.addEventListener("click", closePopup);

    /* ================= ESC / BACK ================= */
    document.addEventListener("keydown", e => {
        if (e.key === "Escape") closePopup();
    });

    window.addEventListener("popstate", () => {
        closePopup();
    });

    /* ================= WRITE NFC ================= */
    writeButton.addEventListener("click", async () => {

        const value = writeInput.value.trim();
        if (!value) {
            writeLog.textContent = "❌ Data tidak boleh kosong.";
            return;
        }

        writeLog.innerHTML =
            '📳 Tempelkan kartu NFC <span class="nfc-scan">menunggu</span>';

        try {
            const ndef = new NDEFReader();

            const record =
                selectedType === "url"
                    ? { recordType: "url", data: value }
                    : { recordType: "mime", mediaType: "text/plain", data: value };

            await ndef.write({ records: [record] });

            writeLog.textContent = "✅ NFC berhasil ditulis!";
            setStatus("Penulisan NFC Berhasil", "success");

            dataContent.textContent = "DATA TERSIMPAN:\n\n" + value;

        } catch {
            writeLog.textContent = "❌ Gagal menulis NFC.";
            setStatus("Gagal Menulis NFC", "error");
        }
    });

    /* ================= SCAN NFC ================= */
    scanButton.addEventListener("click", async () => {

        setStatus("Menunggu Kartu NFC...", "info");
        dataContent.innerHTML =
            '📳 Scan NFC <span class="nfc-scan">menunggu</span>';

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
