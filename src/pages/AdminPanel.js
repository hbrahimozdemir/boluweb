
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, X, Check } from 'lucide-react';

const AdminPanel = (props) => {
    // Tüm içerik verisi
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const [activeTab, setActiveTab] = useState('hero');

    // Geri alma (History) verileri
    const [backups, setBackups] = useState([]);

    // Dosya referansları
    const [heroFile, setHeroFile] = useState(null);
    const [aboutFile, setAboutFile] = useState(null);
    // Logolar için
    const [logoFiles, setLogoFiles] = useState([]);

    const [deleteConfirm, setDeleteConfirm] = useState(null); // { section, itemIndex, imgIndex }

    // Auto-scroll refs
    const eventsEndRef = useRef(null);
    const announcementsEndRef = useRef(null);
    const [autoScrollSection, setAutoScrollSection] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        fetchContent();
    }, []);

    const fetchContent = () => {
        fetch('/content.json')
            .then(res => res.json())
            .then(data => {
                setContent(data);
            })
            .catch(err => console.error("Veri yuklenemedi:", err));
    };

    const [debugText, setDebugText] = useState('');

    const fetchBackups = () => {
        setDebugText('Loading...');
        // Proxy veya localhost yerine relative path kullan
        fetch('/api.php?action=list_backups&t=' + Date.now())
            .then(res => {
                if (!res.ok) throw new Error('Network response was not ok');
                return res.text().then(text => {
                    try {
                        const json = JSON.parse(text);
                        return json;
                    } catch (e) {
                        const errorMsg = "JSON PARSE ERROR:\n" + text.slice(0, 500);
                        setDebugText(errorMsg);
                        throw new Error('Invalid JSON: ' + errorMsg); // Pass msg here
                    }
                });
            })
            .then(data => {
                if (data.success) {
                    setBackups(data.backups);
                    setDebugText("Success: Found " + (data.backups ? data.backups.length : 0));
                } else {
                    console.error("Backup list error:", data.message);
                    setDebugText("API Error: " + data.message);
                }
            })
            .catch(err => {
                console.error("Backup fetch error:", err);
                // Only overwrite if it's NOT the invalid JSON error we just threw and handled
                if (err.message && !err.message.includes('Invalid JSON')) {
                    setDebugText("Fetch Error: " + err.message);
                }
            });
    };

    // Tab değiştiğinde backup listesini yenile
    useEffect(() => {
        if (activeTab === 'history') {
            fetchBackups();
        }
    }, [activeTab]);

    // Handle auto-scroll logic
    useEffect(() => {
        if (autoScrollSection === 'events' && eventsEndRef.current) {
            eventsEndRef.current.scrollIntoView({ behavior: 'smooth' });
            setAutoScrollSection(null);
        } else if (autoScrollSection === 'announcements' && announcementsEndRef.current) {
            announcementsEndRef.current.scrollIntoView({ behavior: 'smooth' });
            setAutoScrollSection(null);
        }
    }, [content, autoScrollSection]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        const formData = new FormData();
        // Tüm içeriği JSON string olarak gönder
        formData.append('data', JSON.stringify(content));

        // Görselleri ekle
        if (heroFile) formData.append('hero_image', heroFile);
        if (aboutFile) formData.append('about_image', aboutFile);

        // Etkinlikler ve Duyurular için dinamik dosya yükleme
        // Formdeki tüm file inputları tara ve FormData'ya ekle
        const fileInputs = document.querySelectorAll('input[type="file"]');
        fileInputs.forEach(input => {
            if (input.name && input.name.includes('[]') && input.files.length > 0) {
                for (let i = 0; i < input.files.length; i++) {
                    formData.append(input.name, input.files[i]);
                }
            }
        });

        try {
            const response = await fetch('/api.php', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();

            if (result.success) {
                setMessage('Başarıyla güncellendi!');
                setContent(result.data);
                setHeroFile(null);
                setAboutFile(null);
                setLogoFiles([]);

                // Clear all file inputs and reset "X dosya seçildi" texts
                fileInputs.forEach(input => {
                    input.value = '';
                });

                const fileCountSpans = document.querySelectorAll('span[id^="file-count-"]');
                fileCountSpans.forEach(span => {
                    span.textContent = 'Dosya seçilmedi';
                });

                // Eğer History sekmesi açıksa listeyi güncelle (veya arka planda)
                fetchBackups();
            } else {
                setMessage('Hata: ' + result.message);
            }
        } catch (error) {
            console.error(error);
            setMessage('Hata: Sunucu ile iletişim kurulamadı.');
        }
        setLoading(false);
    };

    const handleSingleUpdate = async (section, index) => {
        setLoading(true);
        setMessage('');

        // Prepare the specific array item
        const updatedArray = [...content[section]];
        const currentItem = updatedArray[index];

        const tempContent = { ...content };
        tempContent[section] = updatedArray;

        const formData = new FormData();
        formData.append('data', JSON.stringify(tempContent));

        // Find file inputs ONLY for this specific item
        const fileInputName = section === 'events' ? `event_images_${index}[]` : `announcement_images_${index}[]`;
        const fileInput = document.querySelector(`input[name="${fileInputName}"]`);

        if (fileInput && fileInput.files.length > 0) {
            for (let i = 0; i < fileInput.files.length; i++) {
                formData.append(fileInput.name, fileInput.files[i]);
            }
        }

        try {
            const response = await fetch('/api.php', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();

            if (result.success) {
                setMessage(`${section === 'events' ? 'Etkinlik' : 'Duyuru'} başarıyla kaydedildi!`);
                setContent(result.data);

                // Clear the specific file input and reset text
                if (fileInput) fileInput.value = '';
                const spanId = section === 'events' ? `file-count-event-${index}` : `file-count-ann-${index}`;
                const span = document.getElementById(spanId);
                if (span) span.textContent = 'Dosya seçilmedi';

                fetchBackups();
            } else {
                setMessage('Hata: ' + result.message);
            }
        } catch (error) {
            console.error(error);
            setMessage('Hata: Sunucu ile iletişim kurulamadı.');
        }
        setLoading(false);
    };

    const handleRestore = async (version) => {
        if (!window.confirm('Bu versiyona geri dönmek istediğinize emin misiniz? Mevcut değişiklikler kaybolabilir (ama yedeği alınır).')) return;

        try {
            const encodedVersion = encodeURIComponent(version);
            const response = await fetch(`/api.php?action=restore&version=${encodedVersion}`);
            const result = await response.json();
            if (result.success) {
                setMessage('Sistem geri yüklendi!');
                fetchContent(); // Yenile
                setActiveTab('hero'); // Ana sekmeye dön
            } else {
                setMessage('Geri yükleme hatası: ' + result.message);
            }
        } catch (error) {
            setMessage('Geri yükleme bağlantı hatası.');
        }
    };

    const handleDeleteBackup = async (filename) => {
        if (!window.confirm('Bu yedeği kalıcı olarak silmek istediğinize emin misiniz?')) return;

        try {
            // Proxy veya localhost yerine relative path kullan
            const response = await fetch(`/api.php?action=delete_backup&file=${encodeURIComponent(filename)}`);
            const result = await response.json();

            if (result.success) {
                // Listeden kaldir
                setBackups(prev => prev.filter(b => b.file !== filename));
                setMessage('Yedek silindi.');
            } else {
                setMessage('Hata: ' + result.message);
            }
        } catch (error) {
            console.error("Delete error:", error);
            setMessage('Silme işlemi sırasında hata oluştu.');
        }
    };

    const handleLogout = () => {
        if (props.onLogout) props.onLogout();
        navigate('/login');
    };

    const handleInputChange = (section, field, value) => {
        setContent(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    // Array update helper (events, announcements)
    const handleArrayChange = (section, index, field, value) => {
        const newArray = [...content[section]];
        newArray[index] = { ...newArray[index], [field]: value };
        setContent(prev => ({
            ...prev,
            [section]: newArray
        }));
    };

    const handleAddItem = (section) => {
        const newItem = section === 'events'
            ? { id: Date.now(), title: '', date: '', time: '', location: '', description: '', status: 'upcoming', registerLink: '' }
            : section === 'infoCards'
                ? { id: Date.now(), title: '', description: '', icon: 'Lightbulb', color: 'gray' }
                : { id: Date.now(), title: '', date: '', description: '', registerLink: '', color: 'yellow' };

        setContent(prev => ({
            ...prev,
            [section]: [...prev[section], newItem]
        }));

        // Trigger scroll
        setAutoScrollSection(section);
    };

    const handleRemoveItem = (section, index) => {
        if (!window.confirm('Bu öğeyi silmek istediğinize emin misiniz?')) return;

        const newArray = [...content[section]];
        newArray.splice(index, 1);
        setContent(prev => ({
            ...prev,
            [section]: newArray
        }));
    };

    const handleSwapImageDrag = (section, itemIndex, fromIndex, toIndex) => {
        const item = content[section][itemIndex];
        if (!item || !item.images || item.images.length < 2) return;

        const newImages = [...item.images];
        const temp = newImages[fromIndex];
        newImages.splice(fromIndex, 1);
        newImages.splice(toIndex, 0, temp);
        handleArrayChange(section, itemIndex, 'images', newImages);
    };

    const handleDragStart = (e, section, itemIndex, imgIndex) => {
        e.dataTransfer.setData("application/json", JSON.stringify({ section, itemIndex, imgIndex }));
    };

    const handleDrop = (e, dropSection, dropItemIndex, dropImgIndex) => {
        e.preventDefault();
        try {
            const data = JSON.parse(e.dataTransfer.getData("application/json"));
            if (data.section === dropSection && data.itemIndex === dropItemIndex && data.imgIndex !== dropImgIndex) {
                handleSwapImageDrag(dropSection, dropItemIndex, data.imgIndex, dropImgIndex);
            }
        } catch (err) { }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDateInput = (section, index, value) => {
        // Strict DD.MM.YYYY masking logic to prevent e.g. 2999999
        let clean = value.replace(/[^\d]/g, '');
        let formatted = '';

        if (clean.length > 0) {
            let day = clean.substring(0, 2);
            if (day.length === 2 && parseInt(day) > 31) day = '31';
            if (day.length === 2 && parseInt(day) === 0) day = '01';
            formatted += day;
        }
        if (clean.length > 2) {
            let month = clean.substring(2, 4);
            if (month.length === 2 && parseInt(month) > 12) month = '12';
            if (month.length === 2 && parseInt(month) === 0) month = '01';
            formatted += '.' + month;
        }
        if (clean.length > 4) {
            let year = clean.substring(4, 8);
            formatted += '.' + year;
        }

        handleArrayChange(section, index, 'date', formatted);
    };

    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return new Intl.DateTimeFormat('tr-TR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                weekday: 'long',
                hour: '2-digit',
                minute: '2-digit'
            }).format(date);
        } catch (e) {
            return dateString;
        }
    };

    if (!content) return <div className="p-8 text-center">Yükleniyor...</div>;

    return (
        <div className="min-h-screen bg-gray-100 p-4 md:p-8">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
                {/* Header */}
                <div className="bg-gray-800 text-white p-6 flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Yönetim Paneli</h1>
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={handleUpdate}
                            disabled={loading}
                            className={`bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded shadow transition duration-200 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                        </button>
                        <button onClick={handleLogout} className="text-red-400 hover:text-red-300 font-medium text-sm">Çıkış Yap</button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b overflow-x-auto">
                    {['hero', 'infoCards', 'about', 'events', 'announcements', 'footer', 'history'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-4 font-medium text-sm focus:outline-none capitalize whitespace-nowrap ${activeTab === tab ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            {tab === 'hero' ? 'Ana Ekran' :
                                tab === 'infoCards' ? 'Bilgi Kartları' :
                                    tab === 'about' ? 'Hakkımızda' :
                                        tab === 'events' ? 'Etkinlikler' :
                                            tab === 'announcements' ? 'Duyurular' :
                                                tab === 'footer' ? 'Alt Bilgi' : 'Geçmiş/Geri Al'}
                        </button>
                    ))}
                </div>

                <div className="p-6">
                    {message && (
                        <div className={`p-4 mb-6 rounded ${message.includes('Hata') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                            {message}
                        </div>
                    )}

                    {activeTab === 'history' ? (
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold mb-4">Değişiklik Geçmişi</h3>
                            <p className="text-sm text-gray-500 mb-4">Eski bir tarihe dönmek için "Geri Yükle" butonuna tıklayın.</p>

                            {backups.length === 0 && <p>Henüz yedek yok.</p>}
                            <ul className="space-y-2">
                                {backups.map((backup, idx) => (
                                    <li key={idx} className="flex justify-between items-center p-3 border rounded hover:bg-gray-50 group transition-all">
                                        <div>
                                            <span className="font-medium block text-gray-800">{formatDate(backup.date)}</span>
                                            <span className="text-[10px] text-gray-400 font-mono opacity-50 group-hover:opacity-100 transition-opacity">
                                                {backup.file}
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleRestore(backup.file)}
                                                className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                                            >
                                                Geri Yükle
                                            </button>
                                            <button
                                                onClick={() => handleDeleteBackup(backup.file)}
                                                className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                                title="Yedeği Sil"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <form onSubmit={handleUpdate} className="space-y-6">
                            {/* HERO TAB */}
                            {activeTab === 'hero' && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-gray-700 border-b pb-2">Ana Ekran Düzenle</h3>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Başlık</label>
                                        <input
                                            type="text"
                                            className="w-full border rounded p-2"
                                            value={content.hero.title}
                                            onChange={(e) => handleInputChange('hero', 'title', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Açıklama</label>
                                        <textarea
                                            className="w-full border rounded p-2" rows="4"
                                            value={content.hero.description}
                                            onChange={(e) => handleInputChange('hero', 'description', e.target.value)}
                                        ></textarea>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Arkaplan Görseli</label>
                                        <div className="flex items-center gap-4">
                                            <label className="cursor-pointer bg-blue-50 text-blue-700 font-semibold py-2 px-4 rounded-full hover:bg-blue-100 transition-colors text-sm">
                                                Dosya Seç
                                                <input
                                                    type="file"
                                                    onChange={(e) => setHeroFile(e.target.files[0])}
                                                    className="hidden"
                                                />
                                            </label>
                                            <span className="text-sm text-gray-500 truncate max-w-xs">{heroFile ? heroFile.name : 'Dosya seçilmedi'}</span>
                                        </div>
                                        {content.hero.imageUrl && (
                                            <div className="mt-4 relative inline-block group h-32 w-auto">
                                                <img src={content.hero.imageUrl} alt="Preview" className="h-32 w-auto object-cover rounded-lg shadow-md" />

                                                {deleteConfirm && deleteConfirm.section === 'hero' ? (
                                                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-lg animate-fade-in text-white p-2">
                                                        <span className="text-xs font-semibold mb-2">Silmek istiyor musun?</span>
                                                        <div className="flex gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    handleInputChange('hero', 'imageUrl', '');
                                                                    setDeleteConfirm(null);
                                                                }}
                                                                className="bg-red-500 hover:bg-red-600 p-1.5 rounded-full text-white transition-colors"
                                                                title="Evet, Sil"
                                                            >
                                                                <Check size={14} />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setDeleteConfirm(null)}
                                                                className="bg-gray-500 hover:bg-gray-600 p-1.5 rounded-full text-white transition-colors"
                                                                title="Vazgeç"
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => setDeleteConfirm({ section: 'hero' })}
                                                        className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition-colors opacity-90 hover:opacity-100"
                                                        title="Görseli Sil"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Logos / Partners Section */}
                                    <div className="mt-8 pt-6 border-t">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="text-md font-bold text-gray-700">Partner / Sponsor Logoları</h4>
                                        </div>
                                        <div className="flex items-center gap-4 mb-4">
                                            <label className="cursor-pointer bg-blue-50 text-blue-700 font-semibold py-2 px-4 rounded-full hover:bg-blue-100 transition-colors text-sm">
                                                Logo Seç
                                                <input
                                                    type="file"
                                                    multiple
                                                    name="logo_images[]"
                                                    onChange={(e) => {
                                                        const count = e.target.files.length;
                                                        const span = document.getElementById('file-count-logos');
                                                        if (span) span.textContent = count > 0 ? `${count} logo seçildi` : 'Dosya seçilmedi';
                                                    }}
                                                    className="hidden"
                                                />
                                            </label>
                                            <span id="file-count-logos" className="text-sm text-gray-500">Dosya seçilmedi</span>
                                        </div>
                                        <div className="flex gap-4 mt-4 overflow-x-auto pb-4">
                                            {content.logos && content.logos.map((logoUrl, i) => (
                                                <div key={i} className="relative flex-shrink-0 w-24 h-24 group bg-gray-50 border rounded-lg p-2">
                                                    <img src={logoUrl} alt={`Logo ${i}`} className="w-full h-full object-contain drop-shadow-sm" />

                                                    {deleteConfirm && deleteConfirm.section === 'logos' && deleteConfirm.imgIndex === i ? (
                                                        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-lg animate-fade-in text-white p-1">
                                                            <span className="text-[10px] font-semibold mb-1">Sil?</span>
                                                            <div className="flex gap-1">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const newLogos = [...content.logos];
                                                                        newLogos.splice(i, 1);
                                                                        setContent(prev => ({ ...prev, logos: newLogos }));
                                                                        setDeleteConfirm(null);
                                                                    }}
                                                                    className="bg-red-500 hover:bg-red-600 p-1 rounded-full text-white transition-colors"
                                                                    title="Evet"
                                                                >
                                                                    <Check size={12} />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setDeleteConfirm(null)}
                                                                    className="bg-gray-500 hover:bg-gray-600 p-1 rounded-full text-white transition-colors"
                                                                    title="Hayır"
                                                                >
                                                                    <X size={12} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() => setDeleteConfirm({ section: 'logos', imgIndex: i })}
                                                            className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full shadow-md hover:bg-red-700 transition-all opacity-0 group-hover:opacity-100"
                                                            title="Logoyu Sil"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">Yeni dosya seçerseniz mevcut logoların üzerine eklenir. Beyaz veya transparan arkaplanlı logolar tavsiye edilir.</p>
                                    </div>
                                </div>
                            )}

                            {/* INFO CARDS TAB */}
                            {activeTab === 'infoCards' && (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center border-b pb-2 mb-4">
                                        <h3 className="text-lg font-bold text-gray-700">Bilgi Kartlarını Düzenle</h3>
                                        <button
                                            type="button"
                                            onClick={() => handleAddItem('infoCards')}
                                            className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded text-sm font-medium transition"
                                        >
                                            + Yeni Kart Ekle
                                        </button>
                                    </div>
                                    <p className="text-sm text-gray-500 -mt-2 mb-4">Ana sayfadaki yan yana dizili renkli kartları (Misyonumuz vs.) buradan yönetebilirsiniz.</p>

                                    {content.infoCards && content.infoCards.map((card, index) => (
                                        <div key={index} className="border p-4 rounded bg-gray-50 space-y-3 relative">
                                            <div className="flex justify-between items-center mb-2">
                                                <h4 className="font-bold text-sm text-gray-500">Kart #{index + 1}</h4>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveItem('infoCards', index)}
                                                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                                                >
                                                    Sil
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-sm font-medium text-gray-600 block mb-1">Başlık</label>
                                                    <input type="text" className="border rounded p-2 w-full"
                                                        value={card.title} onChange={(e) => handleArrayChange('infoCards', index, 'title', e.target.value)} />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-600 block mb-1">İkon</label>
                                                        <select className="border rounded p-2 w-full" value={card.icon} onChange={(e) => handleArrayChange('infoCards', index, 'icon', e.target.value)}>
                                                            <option value="Target">Hedef (Target)</option>
                                                            <option value="Users">Kullanıcılar (Users)</option>
                                                            <option value="Lightbulb">Ampul (Lightbulb)</option>
                                                            <option value="Heart">Kalp (Heart)</option>
                                                            <option value="Star">Yıldız (Star)</option>
                                                            <option value="Shield">Kalkan (Shield)</option>
                                                            <option value="Leaf">Yaprak (Leaf)</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-600 block mb-1">Renk</label>
                                                        <select className="border rounded p-2 w-full" value={card.color} onChange={(e) => handleArrayChange('infoCards', index, 'color', e.target.value)}>
                                                            <option value="yellow">Sarı (Yellow)</option>
                                                            <option value="green">Yeşil (Green)</option>
                                                            <option value="gray">Gri/Beyaz (Gray)</option>
                                                            <option value="pink">Pembe (Pink)</option>
                                                            <option value="blue">Mavi (Blue)</option>
                                                            <option value="purple">Mor (Purple)</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-600 block mb-1">Kısa Açıklama</label>
                                                <textarea className="border rounded p-2 w-full" rows="2"
                                                    value={card.description} onChange={(e) => handleArrayChange('infoCards', index, 'description', e.target.value)} ></textarea>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* ABOUT TAB */}
                            {activeTab === 'about' && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-gray-700 border-b pb-2">Hakkımızda Düzenle</h3>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Başlık</label>
                                        <input type="text" className="w-full border rounded p-2"
                                            value={content.about.title}
                                            onChange={(e) => handleInputChange('about', 'title', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Paragraf 1</label>
                                        <textarea className="w-full border rounded p-2" rows="3"
                                            value={content.about.text1}
                                            onChange={(e) => handleInputChange('about', 'text1', e.target.value)}
                                        ></textarea>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Paragraf 2</label>
                                        <textarea className="w-full border rounded p-2" rows="3"
                                            value={content.about.text2}
                                            onChange={(e) => handleInputChange('about', 'text2', e.target.value)}
                                        ></textarea>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Hakkımızda Görseli</label>
                                        <div className="flex items-center gap-4">
                                            <label className="cursor-pointer bg-blue-50 text-blue-700 font-semibold py-2 px-4 rounded-full hover:bg-blue-100 transition-colors text-sm">
                                                Dosya Seç
                                                <input
                                                    type="file"
                                                    onChange={(e) => setAboutFile(e.target.files[0])}
                                                    className="hidden"
                                                />
                                            </label>
                                            <span className="text-sm text-gray-500 truncate max-w-xs">{aboutFile ? aboutFile.name : 'Dosya seçilmedi'}</span>
                                        </div>
                                        {content.about.imageUrl && (
                                            <div className="mt-4 relative inline-block group h-32 w-auto">
                                                <img src={content.about.imageUrl} alt="Preview" className="h-32 w-auto object-cover rounded-lg shadow-md" />

                                                {deleteConfirm && deleteConfirm.section === 'about' ? (
                                                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-lg animate-fade-in text-white p-2">
                                                        <span className="text-xs font-semibold mb-2">Silmek istiyor musun?</span>
                                                        <div className="flex gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    handleInputChange('about', 'imageUrl', '');
                                                                    setDeleteConfirm(null);
                                                                }}
                                                                className="bg-red-500 hover:bg-red-600 p-1.5 rounded-full text-white transition-colors"
                                                                title="Evet, Sil"
                                                            >
                                                                <Check size={14} />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setDeleteConfirm(null)}
                                                                className="bg-gray-500 hover:bg-gray-600 p-1.5 rounded-full text-white transition-colors"
                                                                title="Vazgeç"
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => setDeleteConfirm({ section: 'about' })}
                                                        className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition-colors opacity-90 hover:opacity-100"
                                                        title="Görseli Sil"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* EVENTS TAB */}
                            {activeTab === 'events' && (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center border-b pb-2 mb-4">
                                        <h3 className="text-lg font-bold text-gray-700">Etkinlikleri Düzenle</h3>
                                        <button
                                            type="button"
                                            onClick={() => handleAddItem('events')}
                                            className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded text-sm font-medium transition"
                                        >
                                            + Yeni Etkinlik Ekle
                                        </button>
                                    </div>
                                    {content.events.map((event, index) => (
                                        <div key={index} className="border p-4 rounded bg-gray-50 space-y-3 relative">
                                            <div className="flex justify-between items-center mb-2">
                                                <h4 className="font-bold text-sm text-gray-500">Etkinlik #{index + 1}</h4>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveItem('events', index)}
                                                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                                                >
                                                    Sil
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <input type="text" placeholder="Başlık" className="border rounded p-2 w-full"
                                                    value={event.title} onChange={(e) => handleArrayChange('events', index, 'title', e.target.value)} />
                                                <input type="text" placeholder="GG.AA.YYYY (Tarih)" className="border rounded p-2 w-full"
                                                    value={event.date} onChange={(e) => handleDateInput('events', index, e.target.value)} maxLength="10" />
                                            </div>
                                            <div>
                                                <input type="text" placeholder="Kayıt/Başvuru Linki (Örn: https://forms.google.com/...)" className="border rounded p-2 w-full text-sm mb-3"
                                                    value={event.registerLink || ''} onChange={(e) => handleArrayChange('events', index, 'registerLink', e.target.value)} />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <input type="text" placeholder="Saat" className="border rounded p-2 w-full"
                                                    value={event.time} onChange={(e) => handleArrayChange('events', index, 'time', e.target.value)} />
                                                <input type="text" placeholder="Konum" className="border rounded p-2 w-full"
                                                    value={event.location} onChange={(e) => handleArrayChange('events', index, 'location', e.target.value)} />
                                            </div>
                                            <textarea placeholder="Açıklama" className="border rounded p-2 w-full" rows="2"
                                                value={event.description} onChange={(e) => handleArrayChange('events', index, 'description', e.target.value)} ></textarea>

                                            <div className="mt-2">
                                                <label className="text-sm font-medium text-gray-600 block mb-1">Durum</label>
                                                <select
                                                    className="border rounded p-2 w-full"
                                                    value={event.status}
                                                    onChange={(e) => handleArrayChange('events', index, 'status', e.target.value)}
                                                >
                                                    <option value="upcoming">Yaklaşan</option>
                                                    <option value="past">Geçmiş</option>
                                                    <option value="active">Aktif/Bugün</option>
                                                </select>
                                            </div>
                                            <div className="mt-2">
                                                <label className="text-sm font-medium text-gray-600 block mb-1">Etkinlik Görselleri</label>
                                                <div className="flex items-center gap-4">
                                                    <label className="cursor-pointer bg-blue-50 text-blue-700 font-semibold py-2 px-4 rounded-full hover:bg-blue-100 transition-colors text-sm">
                                                        Dosya Seç
                                                        <input
                                                            type="file"
                                                            multiple
                                                            name={`event_images_${index}[]`}
                                                            onChange={(e) => {
                                                                const count = e.target.files.length;
                                                                const span = document.getElementById(`file-count-event-${index}`);
                                                                if (span) span.textContent = count > 0 ? `${count} dosya seçildi` : 'Dosya seçilmedi';
                                                            }}
                                                            className="hidden"
                                                        />
                                                    </label>
                                                    <span id={`file-count-event-${index}`} className="text-sm text-gray-500">Dosya seçilmedi</span>
                                                </div>
                                                <div className="flex gap-4 mt-4 overflow-x-auto pb-2">
                                                    {event.images && event.images.map((img, i) => (
                                                        <div
                                                            key={i}
                                                            className="relative flex-shrink-0 w-24 h-24 group cursor-grab active:cursor-grabbing"
                                                            draggable
                                                            onDragStart={(e) => handleDragStart(e, 'events', index, i)}
                                                            onDrop={(e) => handleDrop(e, 'events', index, i)}
                                                            onDragOver={handleDragOver}
                                                        >
                                                            <img src={img} alt={`Event ${index} Img ${i}`} className="w-full h-full object-cover rounded-lg border shadow-sm pointer-events-none" />

                                                            {deleteConfirm && deleteConfirm.section === 'events' && deleteConfirm.itemIndex === index && deleteConfirm.imgIndex === i ? (
                                                                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-lg animate-fade-in text-white p-1">
                                                                    <span className="text-[10px] font-semibold mb-1">Sil?</span>
                                                                    <div className="flex gap-1">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                const newImages = [...event.images];
                                                                                newImages.splice(i, 1);
                                                                                handleArrayChange('events', index, 'images', newImages);
                                                                                setDeleteConfirm(null);
                                                                            }}
                                                                            className="bg-red-500 hover:bg-red-600 p-1 rounded-full text-white transition-colors pointer-events-auto"
                                                                            title="Evet"
                                                                        >
                                                                            <Check size={12} />
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => setDeleteConfirm(null)}
                                                                            className="bg-gray-500 hover:bg-gray-600 p-1 rounded-full text-white transition-colors pointer-events-auto"
                                                                            title="Hayır"
                                                                        >
                                                                            <X size={12} />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setDeleteConfirm({ section: 'events', itemIndex: index, imgIndex: i })}
                                                                    className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full shadow-md hover:bg-red-700 transition-all opacity-80 hover:opacity-100 pointer-events-auto"
                                                                    title="Görseli Sil"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            )}
                                                            {/* Drop Hint Overlay */}
                                                            <div className="absolute inset-0 bg-blue-500/20 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity flex items-end justify-center pb-2">
                                                                <span className="text-[10px] font-bold text-white bg-black/50 px-2 py-0.5 rounded shadow-sm">Sürükle</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <p className="text-xs text-gray-400 mt-1">Yeni dosya seçerseniz mevcutların üzerine eklenir.</p>
                                            </div>

                                            <div className="pt-3 border-t mt-4 flex justify-end">
                                                <button
                                                    type="button"
                                                    onClick={() => handleSingleUpdate('events', index)}
                                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-semibold transition shadow-sm"
                                                >
                                                    Bu Etkinliği Kaydet
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={eventsEndRef} />
                                </div>
                            )}

                            {/* ANNOUNCEMENTS TAB */}
                            {activeTab === 'announcements' && (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center border-b pb-2 mb-4">
                                        <h3 className="text-lg font-bold text-gray-700">Duyuruları Düzenle</h3>
                                        <button
                                            type="button"
                                            onClick={() => handleAddItem('announcements')}
                                            className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded text-sm font-medium transition"
                                        >
                                            + Yeni Duyuru Ekle
                                        </button>
                                    </div>
                                    {content.announcements.map((ann, index) => (
                                        <div key={index} className="border p-4 rounded bg-gray-50 space-y-3 relative">
                                            <div className="flex justify-between items-center mb-2">
                                                <h4 className="font-bold text-sm text-gray-500">Duyuru #{index + 1}</h4>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveItem('announcements', index)}
                                                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                                                >
                                                    Sil
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <input type="text" placeholder="Başlık" className="border rounded p-2 w-full"
                                                    value={ann.title} onChange={(e) => handleArrayChange('announcements', index, 'title', e.target.value)} />
                                                <input type="text" placeholder="GG.AA.YYYY (Tarih)" className="border rounded p-2 w-full"
                                                    value={ann.date} onChange={(e) => handleDateInput('announcements', index, e.target.value)} maxLength="10" />
                                            </div>
                                            <div>
                                                <input type="text" placeholder="Kayıt/Başvuru Linki (Örn: https://forms.google.com/...)" className="border rounded p-2 w-full text-sm"
                                                    value={ann.registerLink || ''} onChange={(e) => handleArrayChange('announcements', index, 'registerLink', e.target.value)} />
                                            </div>
                                            <textarea placeholder="Açıklama" className="border rounded p-2 w-full" rows="2"
                                                value={ann.description} onChange={(e) => handleArrayChange('announcements', index, 'description', e.target.value)} ></textarea>

                                            <div className="mt-2">
                                                <label className="text-sm font-medium text-gray-600 block mb-1">Duyuru Görselleri</label>
                                                <div className="flex items-center gap-4">
                                                    <label className="cursor-pointer bg-blue-50 text-blue-700 font-semibold py-2 px-4 rounded-full hover:bg-blue-100 transition-colors text-sm">
                                                        Dosya Seç
                                                        <input
                                                            type="file"
                                                            multiple
                                                            name={`announcement_images_${index}[]`}
                                                            onChange={(e) => {
                                                                const count = e.target.files.length;
                                                                const span = document.getElementById(`file-count-ann-${index}`);
                                                                if (span) span.textContent = count > 0 ? `${count} dosya seçildi` : 'Dosya seçilmedi';
                                                            }}
                                                            className="hidden"
                                                        />
                                                    </label>
                                                    <span id={`file-count-ann-${index}`} className="text-sm text-gray-500">Dosya seçilmedi</span>
                                                </div>
                                                <div className="flex gap-4 mt-4 overflow-x-auto pb-2">
                                                    {ann.images && ann.images.map((img, i) => (
                                                        <div
                                                            key={i}
                                                            className="relative flex-shrink-0 w-24 h-24 group cursor-grab active:cursor-grabbing"
                                                            draggable
                                                            onDragStart={(e) => handleDragStart(e, 'announcements', index, i)}
                                                            onDrop={(e) => handleDrop(e, 'announcements', index, i)}
                                                            onDragOver={handleDragOver}
                                                        >
                                                            <img src={img} alt={`Ann ${index} Img ${i}`} className="w-full h-full object-cover rounded-lg border shadow-sm pointer-events-none" />

                                                            {deleteConfirm && deleteConfirm.section === 'announcements' && deleteConfirm.itemIndex === index && deleteConfirm.imgIndex === i ? (
                                                                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-lg animate-fade-in text-white p-1">
                                                                    <span className="text-[10px] font-semibold mb-1">Sil?</span>
                                                                    <div className="flex gap-1">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                const newImages = [...ann.images];
                                                                                newImages.splice(i, 1);
                                                                                handleArrayChange('announcements', index, 'images', newImages);
                                                                                setDeleteConfirm(null);
                                                                            }}
                                                                            className="bg-red-500 hover:bg-red-600 p-1 rounded-full text-white transition-colors pointer-events-auto"
                                                                            title="Evet"
                                                                        >
                                                                            <Check size={12} />
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => setDeleteConfirm(null)}
                                                                            className="bg-gray-500 hover:bg-gray-600 p-1 rounded-full text-white transition-colors pointer-events-auto"
                                                                            title="Hayır"
                                                                        >
                                                                            <X size={12} />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setDeleteConfirm({ section: 'announcements', itemIndex: index, imgIndex: i })}
                                                                    className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full shadow-md hover:bg-red-700 transition-all opacity-80 hover:opacity-100 pointer-events-auto"
                                                                    title="Görseli Sil"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            )}
                                                            {/* Drop Hint Overlay */}
                                                            <div className="absolute inset-0 bg-blue-500/20 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity flex items-end justify-center pb-2">
                                                                <span className="text-[10px] font-bold text-white bg-black/50 px-2 py-0.5 rounded shadow-sm">Sürükle</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <p className="text-xs text-gray-400 mt-1">Yeni dosya seçerseniz mevcutların üzerine eklenir.</p>
                                            </div>

                                            <div className="pt-3 border-t mt-4 flex justify-end">
                                                <button
                                                    type="button"
                                                    onClick={() => handleSingleUpdate('announcements', index)}
                                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-semibold transition shadow-sm"
                                                >
                                                    Bu Duyuruyu Kaydet
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={announcementsEndRef} />
                                </div>
                            )}

                            {/* FOOTER TAB */}
                            {activeTab === 'footer' && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-gray-700 border-b pb-2">Alt Bilgi Düzenle</h3>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">E-posta</label>
                                        <input type="text" className="w-full border rounded p-2"
                                            value={content.footer.email}
                                            onChange={(e) => handleInputChange('footer', 'email', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Telefon</label>
                                        <input type="text" className="w-full border rounded p-2"
                                            value={content.footer.phone}
                                            onChange={(e) => handleInputChange('footer', 'phone', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Adres</label>
                                        <textarea className="w-full border rounded p-2" rows="2"
                                            value={content.footer.address}
                                            onChange={(e) => handleInputChange('footer', 'address', e.target.value)}
                                        ></textarea>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Telif Hakkı Yazısı</label>
                                        <input type="text" className="w-full border rounded p-2"
                                            value={content.footer.copyright}
                                            onChange={(e) => handleInputChange('footer', 'copyright', e.target.value)}
                                        />
                                    </div>

                                    <div className="pt-6 mt-6 border-t">
                                        <h4 className="text-md font-bold text-gray-700 mb-4">Sosyal Medya Linkleri</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1">Instagram URL</label>
                                                <input type="text" placeholder="https://instagram.com/..." className="w-full border rounded p-2"
                                                    value={content.footer.instagram || ''}
                                                    onChange={(e) => handleInputChange('footer', 'instagram', e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1">Twitter (X) URL</label>
                                                <input type="text" placeholder="https://twitter.com/..." className="w-full border rounded p-2"
                                                    value={content.footer.twitter || ''}
                                                    onChange={(e) => handleInputChange('footer', 'twitter', e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1">LinkedIn URL</label>
                                                <input type="text" placeholder="https://linkedin.com/in/..." className="w-full border rounded p-2"
                                                    value={content.footer.linkedin || ''}
                                                    onChange={(e) => handleInputChange('footer', 'linkedin', e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1">Facebook URL</label>
                                                <input type="text" placeholder="https://facebook.com/..." className="w-full border rounded p-2"
                                                    value={content.footer.facebook || ''}
                                                    onChange={(e) => handleInputChange('footer', 'facebook', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end pt-4 border-t mt-6">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded shadow-lg transition duration-200 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {loading ? 'Kaydediliyor...' : 'Tüm Değişiklikleri Kaydet'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div >
    );
};

export default AdminPanel;
