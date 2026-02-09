
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, X, Check } from 'lucide-react';

const AdminPanel = (props) => {
    // Tüm içerik verisi
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // Aktif sekme: 'hero', 'about', 'events', 'announcements', 'footer', 'history'
    const [activeTab, setActiveTab] = useState('hero');

    // Geri alma (History) verileri
    const [backups, setBackups] = useState([]);

    // Dosya referansları
    const [heroFile, setHeroFile] = useState(null);
    const [aboutFile, setAboutFile] = useState(null);

    const [deleteConfirm, setDeleteConfirm] = useState(null); // { section, itemIndex, imgIndex }
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

    const fetchBackups = () => {
        fetch('/api.php?action=list_backups')
            .then(res => {
                if (!res.ok) throw new Error('Network response was not ok');
                return res.json();
            })
            .then(data => {
                if (data.success) {
                    setBackups(data.backups);
                } else {
                    console.error("Backup list error:", data.message);
                }
            })
            .catch(err => {
                console.error("Backup fetch error:", err);
                // Kullaniciya hata gostermek isterseniz state'e ekleyebilirsiniz
            });
    };

    // Tab değiştiğinde backup listesini yenile
    useEffect(() => {
        if (activeTab === 'history') {
            fetchBackups();
        }
    }, [activeTab]);

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
            ? { id: Date.now(), title: '', date: '', time: '', location: '', description: '', status: 'upcoming' }
            : { id: Date.now(), title: '', date: '', description: '', color: 'yellow' };

        setContent(prev => ({
            ...prev,
            [section]: [...prev[section], newItem]
        }));
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

    if (!content) return <div className="p-8 text-center">Yükleniyor...</div>;

    return (
        <div className="min-h-screen bg-gray-100 p-4 md:p-8">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
                {/* Header */}
                <div className="bg-gray-800 text-white p-6 flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Yönetim Paneli</h1>
                    <button onClick={handleLogout} className="text-red-400 hover:text-red-300 font-medium text-sm">Çıkış Yap</button>
                </div>

                {/* Tabs */}
                <div className="flex border-b overflow-x-auto">
                    {['hero', 'about', 'events', 'announcements', 'footer', 'history'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-4 font-medium text-sm focus:outline-none capitalize whitespace-nowrap ${activeTab === tab ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            {tab === 'hero' ? 'Ana Ekran' :
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
                                    <li key={idx} className="flex justify-between items-center p-3 border rounded hover:bg-gray-50">
                                        <div>
                                            <span className="font-medium block">{backup.date}</span>
                                            <span className="text-xs text-gray-400">{backup.file}</span>
                                        </div>
                                        <button
                                            onClick={() => handleRestore(backup.file)}
                                            className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                                        >
                                            Geri Yükle
                                        </button>
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
                                        <input type="file" onChange={(e) => setHeroFile(e.target.files[0])} className="block w-full text-sm text-gray-500" />
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
                                        <input type="file" onChange={(e) => setAboutFile(e.target.files[0])} className="block w-full text-sm text-gray-500" />
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
                                    <h3 className="text-lg font-bold text-gray-700 border-b pb-2">Etkinlikleri Düzenle</h3>
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
                                                <input type="text" placeholder="Tarih" className="border rounded p-2 w-full"
                                                    value={event.date} onChange={(e) => handleArrayChange('events', index, 'date', e.target.value)} />
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
                                                <input
                                                    type="file"
                                                    multiple
                                                    name={`event_images_${index}[]`} // Form submit icin gerekli olmayabilir ama referans
                                                    onChange={(e) => {
                                                        const files = Array.from(e.target.files);
                                                        // e.target.setAttribute('data-files-selected', files.length);
                                                    }}
                                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                                />
                                                <div className="flex gap-4 mt-4 overflow-x-auto pb-2">
                                                    {event.images && event.images.map((img, i) => (
                                                        <div key={i} className="relative flex-shrink-0 w-24 h-24 group">
                                                            <img src={img} alt={`Event ${index} Img ${i}`} className="w-full h-full object-cover rounded-lg border shadow-sm" />

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
                                                                    onClick={() => setDeleteConfirm({ section: 'events', itemIndex: index, imgIndex: i })}
                                                                    className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full shadow-md hover:bg-red-700 transition-all opacity-80 hover:opacity-100"
                                                                    title="Görseli Sil"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                                <p className="text-xs text-gray-400 mt-1">Yeni dosya seçerseniz mevcutların üzerine eklenir.</p>
                                            </div>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => handleAddItem('events')}
                                        className="w-full py-2 border-2 border-dashed border-gray-300 text-gray-500 hover:border-blue-500 hover:text-blue-500 rounded font-medium transition"
                                    >
                                        + Yeni Etkinlik Ekle
                                    </button>
                                </div>
                            )}

                            {/* ANNOUNCEMENTS TAB */}
                            {activeTab === 'announcements' && (
                                <div className="space-y-6">
                                    <h3 className="text-lg font-bold text-gray-700 border-b pb-2">Duyuruları Düzenle</h3>
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
                                                <input type="text" placeholder="Tarih" className="border rounded p-2 w-full"
                                                    value={ann.date} onChange={(e) => handleArrayChange('announcements', index, 'date', e.target.value)} />
                                            </div>
                                            <textarea placeholder="Açıklama" className="border rounded p-2 w-full" rows="2"
                                                value={ann.description} onChange={(e) => handleArrayChange('announcements', index, 'description', e.target.value)} ></textarea>

                                            <div className="mt-2">
                                                <label className="text-sm font-medium text-gray-600 block mb-1">Duyuru Görselleri</label>
                                                <input
                                                    type="file"
                                                    multiple
                                                    name={`announcement_images_${index}[]`}
                                                    onChange={(e) => {
                                                        const files = Array.from(e.target.files);
                                                        // e.target.setAttribute('data-files-selected', files.length);
                                                    }}
                                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                                />
                                                <div className="flex gap-4 mt-4 overflow-x-auto pb-2">
                                                    {ann.images && ann.images.map((img, i) => (
                                                        <div key={i} className="relative flex-shrink-0 w-24 h-24 group">
                                                            <img src={img} alt={`Ann ${index} Img ${i}`} className="w-full h-full object-cover rounded-lg border shadow-sm" />

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
                                                                    onClick={() => setDeleteConfirm({ section: 'announcements', itemIndex: index, imgIndex: i })}
                                                                    className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full shadow-md hover:bg-red-700 transition-all opacity-80 hover:opacity-100"
                                                                    title="Görseli Sil"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                                <p className="text-xs text-gray-400 mt-1">Yeni dosya seçerseniz mevcutların üzerine eklenir.</p>
                                            </div>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => handleAddItem('announcements')}
                                        className="w-full py-2 border-2 border-dashed border-gray-300 text-gray-500 hover:border-blue-500 hover:text-blue-500 rounded font-medium transition"
                                    >
                                        + Yeni Duyuru Ekle
                                    </button>
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
