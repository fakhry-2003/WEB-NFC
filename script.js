document.addEventListener('DOMContentLoaded', () => {

    const scanButton = document.getElementById('scanButton');
    const statusDiv = document.getElementById('statusMessage');
    const dataContent = document.getElementById('dataContent');

    const writeModeBtn = document.getElementById('writeModeBtn');
    const writeSection = document.getElementById('writeSection');
    const writeButton = document.getElementById('writeButton');
    const writeInput = document.getElementById('writeInput');

    const updateStatus = (msg, cls) => {
        statusDiv.className = 'status ' + cls;
        statusDiv.textContent = 'Status: ' + msg;
    };

    // CEK WEB NFC
    if (!('NDEFReader' in window)) {
        updateStatus('Web NFC TIDAK Didukung', 'error');
        dataContent.textContent = 'Gunakan Chrome Android dengan HTTPS.';
        scanButton.disabled = true;
        return;
    }

    updateStatus('Web NFC Didukung', 'success');
    scanButton.disabled = false;
    dataContent.textContent = 'Sistem siap.';

    // MODE SCAN
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
                    output += 
`Record ${i + 1}
Type : ${r.recordType}
Data :
${text}

`;
                });

                dataContent.textContent = output;
                updateStatus('Scan Berhasil', 'success');
            };

            ndef.onreadingerror = () => {
                updateStatus('Gagal Membaca NFC', 'error');
            };

        } catch (err) {
            updateStatus('Error Scan', 'error');
            dataContent.textContent = err.message;
        }
    });

    // MODE WRITE
    writeModeBtn.addEventListener('click', () => {
        writeSection.style.display = 'block';
        updateStatus('Mode TULIS NFC Aktif', 'info');
        dataContent.textContent = 'Masukkan data lalu tempelkan kartu NFC.';
    });

    // WRITE NFC
    writeButton.addEventListener('click', async () => {
        const value = writeInput.value.trim();
        if (!value) {
            alert('Data tidak boleh kosong');
            return;
        }

        try {
            const ndef = new NDEFReader();
            await ndef.write({
                records: [{
                    recordType: 'text',
                    data: value
                }]
            });

            updateStatus('Penulisan Berhasil', 'success');
            dataContent.textContent =
`✅ NFC BERHASIL DITULIS

${value}
`;

        } catch (err) {
            updateStatus('Penulisan Gagal', 'error');
            dataContent.textContent = err.message;
        }
    });

});
