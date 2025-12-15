document.addEventListener("DOMContentLoaded", () => {

    // ================================
    // ELEMENT
    // ================================
    const scanButton = document.getElementById("scanButton");
    const writeModeBtn = document.getElementById("writeModeBtn");
    const writeSection = document.getElementById("writeSection");
    const writeButton = document.getElementById("writeButton");

    const recordTypeSelect = document.getElementById("recordType");
    const writeInput = document.getElementById("writeInput");

    const statusMessage = document.getElementById("statusMessage");
    const dataContent = document.getElementById("dataContent");

    // ================================
    // HELPER STATUS
    // ================================
    function setStatus(text, type) {
        statusMessage.className = "status " + type;
        statusMessage.textContent = "Status: " + text;
    }

    // ================================
    // CHECK WEB NFC SUPPORT
    // ================================
    if (!("NDEFReader" in window)) {
        setStatus("Web NFC tidak didukung di browser ini", "error");
        dataContent.textContent = "Gunakan Chrome Android dengan HTTPS.";
        return;
    }

    // ================================
    // MODE TULIS NFC
    // ================================
    writeModeBtn.addEventListener("click", () => {
        writeSection.style.display = "block";
        writeInput.value = "";
        recordTypeSelect.value = "text";

        setStatus("Mode Tulis Aktif", "info");
        dataContent.textContent = "Masukkan data lalu tempelkan kartu NFC.";
    });

    writeButton.addEventListener("click", async () => {
        const dataValue = writeInput.value.trim();
        const recordType = recordTypeSelect.value;

        if (!dataValue) {
            alert("Data masih kosong!");
            return;
        }

        try {
            const ndef = new NDEFReader();

            // TULIS SESUAI JENIS
            if (recordType === "url") {
                await ndef.write({
                    records: [{
                        recordType: "url",
                        data: dataValue
                    }]
                });
            } else {
                await ndef.write({
                    records: [{
                        recordType: "text",
                        data: dataValue
                    }]
                });
            }

            setStatus("Penulisan Berhasil", "success");
            dataContent.textContent = `Data :\n${dataValue}`;

        } catch (error) {
            setStatus("Gagal Menulis NFC", "error");
            dataContent.textContent = error.message;
        }
    });

    // ================================
    // MODE SCAN NFC
    // ================================
    scanButton.addEventListener("click", async () => {
        setStatus("Memindai NFC...", "info");
        dataContent.textContent = "Tempelkan kartu NFC ke perangkat...";

        try {
            const ndef = new NDEFReader();
            await ndef.scan();

            ndef.onreading = (event) => {
                let resultText = "Data :\n";

                event.message.records.forEach((record) => {
                    if (record.recordType === "text" || record.recordType === "url") {
                        const decoder = new TextDecoder();
                        resultText += decoder.decode(record.data);
                    }
                });

                dataContent.textContent = resultText;
                setStatus("Scan Berhasil", "success");
            };

            ndef.onerror = () => {
                setStatus("Terjadi kesalahan saat membaca NFC", "error");
            };

        } catch (error) {
            setStatus("Scan Gagal", "error");
            dataContent.textContent = error.message;
        }
    });

});
