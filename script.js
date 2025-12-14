document.addEventListener('DOMContentLoaded', () => {
    const scanButton = document.getElementById('scanButton');
    const resultDiv = document.getElementById('result');
    const statusDiv = resultDiv.querySelector('.status');
    const dataContent = document.getElementById('dataContent');

    // 1. Cek Dukungan Web NFC
    if (!('NDEFReader' in window)) {
        statusDiv.textContent = 'Status: Web NFC TIDAK Didukung pada browser/perangkat ini.';
        statusDiv.classList.remove('info', 'success');
        statusDiv.classList.add('error');
        dataContent.textContent = 'Fungsionalitas ini hanya tersedia di Chrome pada Android (melalui koneksi HTTPS).';
        scanButton.disabled = true;
        return;
    }
    
    statusDiv.textContent = 'Status: Web NFC Didukung. Tekan tombol untuk mulai.';
    statusDiv.classList.remove('info', 'error');
    statusDiv.classList.add('success');
    scanButton.disabled = false;


    scanButton.addEventListener('click', async () => {
        dataContent.textContent = 'Menunggu kartu... Tempelkan kartu NFC Anda sekarang.';
        statusDiv.textContent = 'Status: Memindai...';
        statusDiv.classList.remove('success', 'error');
        statusDiv.classList.add('info');
        
        try {
            // Inisialisasi NDEFReader
            const ndef = new NDEFReader();
            // Perintah untuk mulai membaca, ini akan memunculkan prompt izin sistem
            await ndef.scan();

            // --- Handler Saat Pembacaan Berhasil (NDEF Ditemukan) ---
            ndef.onreading = event => {
                const message = event.message;
                const records = message.records;
                let data = '✅ Kartu NDEF Ditemukan dan Berhasil Dibaca!\n\n';

                records.forEach((record, index) => {
                    data += `--- Record ${index + 1} (${record.recordType})---\n`;
                    data += `Mime Type: ${record.mediaType || 'N/A'}\n`;
                    
                    try {
                        const decoder = new TextDecoder();
                        // Membaca payload (isi data) dari tag NFC
                        const payload = decoder.decode(record.data);
                        data += `Payload (Teks): ${payload}\n`;
                    } catch (e) {
                        data += 'Payload (Biner): Data ini bukan format teks sederhana.\n';
                    }
                });

                dataContent.textContent = data;
                statusDiv.textContent = 'Status: Pemindaian Berhasil!';
                statusDiv.classList.remove('info', 'error');
                statusDiv.classList.add('success');
            };

            // --- Handler Saat Pembacaan Gagal ---
            ndef.onreadingerror = error => {
                // Pesan khusus untuk kartu sensitif (ATM, e-Toll, KRL)
                dataContent.textContent = 
                    `🛑 PEMBACAAN GAGAL: Kartu Tidak Dapat Diakses.\n\n` +
                    `Pesan Error Sistem: ${error.message}\n\n` +
                    `Ini terjadi karena:\n` +
                    `1. Kartu tersebut adalah kartu keuangan (ATM, e-Toll, KRL), KTP, atau kartu lain yang datanya **terenkripsi** dan memerlukan kunci keamanan khusus.\n` +
                    `2. Web NFC API yang digunakan browser **tidak diizinkan** untuk membaca data sensitif ini demi alasan keamanan.\n` +
                    `3. Kartu tersebut bukan dalam format NDEF terbuka yang didukung oleh API.\n` +
                    `Silakan coba dengan tag NFC buatan Anda sendiri (NDEF).`;
                
                statusDiv.textContent = 'Status: Kartu Terenkripsi atau Gagal Dibaca!';
                statusDiv.classList.remove('info', 'success');
                statusDiv.classList.add('error');
            };

        } catch (error) {
            // Ini biasanya terjadi jika pengguna menolak izin NFC atau browser mengalami masalah mendadak.
            if (error.name === 'NotAllowedError') {
                 dataContent.textContent = `Error: Izin NFC Ditolak oleh Pengguna. Anda harus mengizinkan akses NFC.`;
            } else {
                 dataContent.textContent = `Error tak terduga saat memulai pemindaian: ${error.message}.`;
            }
           
            statusDiv.textContent = 'Status: Error Awal!';
            statusDiv.classList.remove('info', 'success');
            statusDiv.classList.add('error');
        }
    });
});