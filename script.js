document.addEventListener('DOMContentLoaded', () => {
    // Mengambil elemen-elemen dari Hero Layout baru
    const scanButton = document.getElementById('scanButton'); // Tombol di Header
    const statusDiv = document.getElementById('statusMessage'); // Status di Hero Kiri
    const dataContent = document.getElementById('dataContent'); // Data di Log Section
    
    // Fungsi pembantu untuk memperbarui status
    const updateStatus = (message, statusClass) => {
        // Reset kelas status lama dan tambahkan kelas status baru (info, success, error)
        statusDiv.className = 'status ' + statusClass;
        statusDiv.textContent = 'Status: ' + message;
    }

    // 1. Cek Dukungan Web NFC
    if (!('NDEFReader' in window)) {
        updateStatus('Web NFC TIDAK Didukung. Wajib Chrome Android/HTTPS.', 'error');
        dataContent.textContent = 'Fungsionalitas ini hanya tersedia di Chrome pada Android (melalui koneksi HTTPS).';
        scanButton.disabled = true; // MATI
        return;
    }
    
    // Jika lolos cek, tombol diaktifkan
    updateStatus('Web NFC Didukung. Tekan tombol MULAI SCAN di atas.', 'success');
    dataContent.textContent = 'Sistem siap. Siapkan Tag NFC Anda.';
    scanButton.disabled = false; // HIDUP

    // --- LOGIKA UTAMA SAAT TOMBOL DIKLIK ---
    scanButton.addEventListener('click', async () => {
        dataContent.textContent = 'Menunggu kartu... Tempelkan kartu NFC Anda sekarang.';
        updateStatus('Memindai...', 'info');
        
        try {
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
                        const payload = decoder.decode(record.data);
                        data += `Payload (Teks): ${payload}\n`;
                    } catch (e) {
                        data += 'Payload (Biner): Data ini bukan format teks sederhana.\n';
                    }
                });

                dataContent.textContent = data;
                updateStatus('Pemindaian Berhasil!', 'success');
            };

            // --- Handler Saat Pembacaan Gagal ---
            ndef.onreadingerror = error => {
                dataContent.textContent = 
                    `🛑 PEMBACAAN GAGAL: Kartu Terenkripsi/Tidak Dapat Diakses.\n\n` +
                    `Pesan Error Sistem: ${error.message || error.name}\n\n` +
                    `INI BIASANYA TERJADI JIKA:\n` +
                    `1. Anda memindai kartu komersial/enkripsi (KTP, Bank, e-Toll).\n` +
                    `2. Kartu tersebut bukan dalam format NDEF terbuka.`;
                
                updateStatus('Kartu Terenkripsi atau Gagal Dibaca!', 'error');
            };

        } catch (error) {
            // Error jika pengguna menolak izin, atau NFC mati
            let errorMessage = `Error tak terduga: ${error.message}.`;
            if (error.name === 'NotAllowedError') {
                 errorMessage = `Izin NFC Ditolak oleh Pengguna. Anda harus mengizinkan akses NFC.`;
            } 
            
            dataContent.textContent = errorMessage;
            updateStatus('Error Awal Saat Memulai Scan!', 'error');
        }
    });
});
