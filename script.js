document.addEventListener('DOMContentLoaded', () => {

    const scanButton = document.getElementById('scanButton');
    const statusDiv = document.getElementById('statusMessage');
    const dataContent = document.getElementById('dataContent');

    const writeModeBtn = document.getElementById('writeModeBtn');
    const writeSection = document.getElementById('writeSection');
    const writeButton = document.getElementById('writeButton');
    const writeInput = document.getElementById('writeInput');
    const recordType = document.getElementById('recordType');

    const updateStatus = (msg, cls) => {
        statusDiv.className = 'status ' + cls;
        statusDiv.textContent = 'Status: ' + msg;
    };

    // Cek Web NFC
    if (!('NDEFReader' in window)) {
        updateStatus('Web NFC TIDAK Didukung', 'error');
        dataContent.textContent =
            'Gunakan Chrome Android + HTTPS.';
        scanButton.disabled = true;
        return;
    }

    updateStatus('Web NFC Didukung', 'success');
    scanButton.disabled = false;
    dataContent.textContent = 'Sistem siap.';

    // SCAN NFC
    scanButton.addEventListener('click', async () => {
        updateStatus('Memindai...', 'info');
        dataContent.textContent = 'Tempelkan kartu NFC...';

        try {
            const ndef = new NDEFReader();
            await ndef.scan();

            ndef.onreading = event => {
                let output = '✅ NFC TERBACA\n\n';

                event.message.records.forEach((r, i) => {
                    const text = new TextDecoder().decode(r.data);
                    output += `Record ${i + 1}\nType: ${r.recordType}\nData: ${text}\n\n`;
                });

                dataContent.textContent = output;
                updateStatus('Scan Berhasil', 'success');
            };

            ndef.onreadingerror = () => {
                updateStatus('Gagal Membaca', 'error');
            };

        } catch (err) {
            updateStatus('Error Scan', 'error');
            dataContent.textContent = err.message;
        }
    });

    // WRITE MODE
    writeModeBtn.addEventListener('click', () => {
        writeSection.style.display = 'block';
        updateStatus('Mode TULIS Aktif', 'info');
    });

    // WRITE NFC
    writeButton.addEventListener('click', async () => {
        if (!writeInput.value.trim()) {
            alert('Data kosong!');
            return;
        }

        try {
            const ndef = new NDEFReader();

            await ndef.write({
                records: [{
                    recordType: recordType.value,
                    data: writeInput.value
                }]
            });

            updateStatus('Penulisan Berhasil', 'success');
            dataContent.textContent =
                `✅ NFC BERHASIL DITULIS\n\n${writeInput.value}`;

        } catch (err) {
            updateStatus('Penulisan Gagal', 'error');
            dataContent.textContent = err.message;
        }
    });

});
