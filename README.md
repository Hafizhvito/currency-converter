# 💱 Kalkulator Konversi Mata Uang

Aplikasi web modern untuk konversi mata uang dengan nilai tukar real-time, dibangun menggunakan HTML5, CSS3, dan JavaScript ES6+.


## Demo Live

🔗 **[Lihat Demo]([https://username-anda.github.io/currency-converter](https://relaxed-paletas-11d110.netlify.app/))**

##  Fitur Utama

###  **Konversi Mata Uang**
- **Real-time Exchange Rates**: Nilai tukar terkini dari ExchangeRate-API
- **16+ Mata Uang**: USD, EUR, GBP, JPY, IDR, CNY, KRW, SGD, MYR, THB, AUD, CAD, CHF, INR, HKD, NZD
- **Konversi Otomatis**: Update real-time saat mengetik (debounced 500ms)
- **Swap Currencies**: Tombol untuk menukar mata uang dengan animasi

###  **Riwayat Konversi**
- **Penyimpanan Lokal**: Hingga 50 konversi terakhir
- **Click to Use**: Klik item riwayat untuk menggunakannya kembali
- **Detailed Info**: Timestamp dan nilai tukar setiap konversi
- **Clear History**: Hapus semua riwayat dengan konfirmasi

###  **User Experience**
- **Responsive Design**: Optimal di desktop, tablet, dan mobile
- **Modern UI**: Glassmorphism design dengan gradient backgrounds
- **Smooth Animations**: Transisi dan hover effects yang halus
- **Loading States**: Indikator loading dengan spinner animasi
- **Error Handling**: Pesan error yang user-friendly

###  **Performa & Reliabilitas**
- **Auto-refresh**: Nilai tukar diperbarui otomatis setiap 5 menit
- **Offline Detection**: Notifikasi status koneksi
- **Timeout Protection**: Timeout 10 detik untuk API calls
- **Retry Logic**: Automatic retry untuk failed requests
- **Memory Efficient**: Optimized untuk performance

### ⌨ **Keyboard Shortcuts**
- `Ctrl/Cmd + S`: Swap currencies
- `Ctrl/Cmd + R`: Refresh exchange rates
- `Escape`: Clear inputs dan focus ke amount input

## 🛠 Teknologi

### **Frontend**
- **HTML5**: Semantic markup dengan accessibility support
- **CSS3**: Modern features (Flexbox, Grid, Custom Properties, Animations)
- **JavaScript ES6+**: Modern syntax dengan async/await, modules

### **API & External Services**
- **[ExchangeRate-API](https://api.exchangerate-api.com)**: Real-time exchange rates
- **Fetch API**: Modern HTTP client
- **Intl API**: Internationalization untuk formatting

### **Development Tools**
- **Git**: Version control
- **GitHub Pages**: Deployment platform
- **VS Code**: Recommended editor dengan extensions

## 📁 Struktur Proyek

```
Currency conversion calculator/
├── index.html          # Main HTML file
├── styles.css          # All CSS styles
├── script.js           # JavaScript functionality

```

## 📋 Cara Penggunaan

### **Basic Usage**
1. **Input Amount**: Masukkan jumlah uang yang ingin dikonversi
2. **Select Currencies**: Pilih mata uang asal dan tujuan
3. **View Result**: Hasil konversi muncul otomatis
4. **Swap**: Gunakan tombol ⇅ untuk menukar mata uang
5. **History**: Lihat dan gunakan kembali konversi sebelumnya

### **Advanced Features**
- **Keyboard Navigation**: Gunakan Tab untuk navigasi
- **Responsive**: Otomatis menyesuaikan layar perangkat
- **Offline Mode**: Menggunakan data terakhir saat offline
- **Auto-refresh**: Nilai tukar diperbarui otomatis

## 🔧 Konfigurasi

### **API Configuration**
```javascript
// Dalam script.js, ubah konfigurasi API jika diperlukan
const API_CONFIG = {
    baseURL: 'https://api.exchangerate-api.com/v4/latest/',
    timeout: 10000, // 10 seconds
    retryAttempts: 3
};
```

### **Supported Currencies**
```javascript
// Tambahkan mata uang baru di CURRENCY_INFO object
const CURRENCY_INFO = {
    'NEW': { name: 'New Currency', symbol: 'N$', flag: '🏳️' }
};
```

### **Styling Customization**
```css
/* Ubah warna utama di styles.css */
:root {
    --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    --accent-color: #667eea;
    --border-radius: 10px;
}
```

## 🧪 Testing

### **Manual Testing**
- [ ] Konversi berbagai mata uang
- [ ] Test responsive design di berbagai ukuran layar
- [ ] Validasi input (angka negatif, teks, dll)
- [ ] Test offline/online behavior
- [ ] Keyboard shortcuts functionality

### **Browser Compatibility**
- ✅ Chrome 70+
- ✅ Firefox 65+
- ✅ Safari 12+
- ✅ Edge 79+
- ⚠️ IE 11 (limited support)

## 🔍 Debugging

### **Console Commands**
```javascript
// Dalam browser console
getCurrencyConverterStats(); // Lihat statistik aplikasi
window.conversionHistoryData; // Lihat data riwayat
```


### **Development Guidelines**
- Gunakan semantic commit messages
- Follow existing code style dan comments
- Test di multiple browsers sebelum submit
- Update documentation jika perlu

### **Issues & Bug Reports**
- Gunakan GitHub Issues untuk melaporkan bug
- Sertakan browser version dan steps to reproduce
- Attach screenshots jika memungkinkan

## 📈 Roadmap

### **Version 1.1 (Planned)**
- [ ] Cryptocurrency support (BTC, ETH, dll)
- [ ] Historical exchange rate charts
- [ ] Export history to CSV/PDF
- [ ] Multiple language support

### **Version 1.2 (Future)**
- [ ] PWA (Progressive Web App) support
- [ ] Push notifications untuk rate alerts
- [ ] Dark/Light theme toggle
- [ ] Advanced filtering dan search

### **Version 2.0 (Long-term)**
- [ ] User accounts dan cloud sync
- [ ] API rate limiting dashboard
- [ ] Currency trend analysis
- [ ] Mobile app version

##  Performance

- **First Load**: ~2-3 seconds (including API call)
- **Subsequent Conversions**: ~500ms (cached rates)
- **Bundle Size**: ~15KB (HTML + CSS + JS combined)
- **API Calls**: ~1-2 per session (dengan caching)

##  Security & Privacy

- **No Personal Data**: Tidak mengumpulkan data pribadi
- **Local Storage**: Riwayat disimpan lokal di browser
- **HTTPS**: Semua API calls menggunakan HTTPS
- **No Tracking**: Tidak ada analytics atau tracking


## 👨‍💻 Author

**Hafizh Vito Pratomo**
- Email: hafizhvito2@gmail.com

##  Acknowledgments

- **ExchangeRate-API** untuk menyediakan API gratis
- **GitHub Pages** untuk hosting gratis
- **MDN Web Docs** untuk dokumentasi referensi
- **Stack Overflow** community untuk problem solving

##  Support

Jika Anda mengalami masalah atau memiliki pertanyaan:

1. **Check Documentation**: Baca README ini dengan lengkap
2. **Search Issues**: Cek GitHub Issues untuk masalah serupa
3. **Create Issue**: Buat issue baru dengan template yang sesuai
4. **Email**: Kontak langsung ke your.email@example.com

---

⭐ **Jika project ini membantu Anda, jangan lupa berikan star di GitHub!**

🔄 **Last Updated**: 8/3/2025
📝 **Documentation Version**: 1.0
