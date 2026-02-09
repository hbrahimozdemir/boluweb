
import React, { useState, useEffect } from 'react';
import {
    Calendar, Clock, MapPin, ChevronLeft, ChevronRight,
    Megaphone, Mail, Phone, Map, Instagram, Twitter, Linkedin, Facebook,
    ArrowRight, X, Menu, Target, Users, Lightbulb, Heart
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
    const [content, setContent] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState({});
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        fetch('/content.json')
            .then(res => res.json())
            .then(data => {
                setContent(data);
            })
            .catch(err => console.error("Veri yuklenemedi:", err));
    }, []);

    if (!content) return <div className="flex h-screen items-center justify-center">Yukleniyor...</div>;

    const { hero, about, events: rawEvents, announcements: rawAnnouncements, footer } = content;

    // Helper to parse Turkish date string to Date object
    const parseDate = (dateStr) => {
        if (!dateStr) return new Date(0);

        const months = {
            'Ocak': 0, 'Şubat': 1, 'Mart': 2, 'Nisan': 3, 'Mayıs': 4, 'Haziran': 5,
            'Temmuz': 6, 'Ağustos': 7, 'Eylül': 8, 'Ekim': 9, 'Kasım': 10, 'Aralık': 11
        };

        try {
            const parts = dateStr.split(' ');
            if (parts.length < 3) return new Date(dateStr); // Try standard parse if not formatted

            const day = parseInt(parts[0]);
            const month = months[parts[1]] !== undefined ? months[parts[1]] : 0;
            const year = parseInt(parts[2]);

            return new Date(year, month, day);
        } catch (e) {
            return new Date(0);
        }
    };

    // Sort events and announcements by date (Newest first)
    const events = rawEvents ? [...rawEvents].sort((a, b) => parseDate(b.date) - parseDate(a.date)) : [];
    const announcements = rawAnnouncements ? [...rawAnnouncements].sort((a, b) => parseDate(b.date) - parseDate(a.date)) : [];

    return (
        <div className="font-sans text-gray-900 bg-gray-50">
            {/* Header */}
            <header className="fixed w-full top-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        {/* Logo */}
                        <div className="flex-shrink-0 flex items-center gap-3">
                            <img className="h-12 w-auto" src="/logo.png" alt="BAİBÜ Kampüs Kooperatifi" />
                            <span className="font-bold text-xl text-yellow-700 hidden md:block">BAİBÜ Kampüs Kooperatifi</span>
                        </div>

                        {/* Desktop Menu */}
                        <div className="hidden md:flex items-center space-x-8">
                            <a href="#about" className="text-gray-600 hover:text-yellow-600 font-medium transition">Hakkımızda</a>
                            <a href="#events" className="text-gray-600 hover:text-yellow-600 font-medium transition">Etkinlikler</a>
                            <a href="#announcements" className="text-gray-600 hover:text-yellow-600 font-medium transition">Duyurular</a>
                            <button
                                onClick={() => document.getElementById('footer').scrollIntoView({ behavior: 'smooth' })}
                                className="bg-green-600 text-white px-6 py-2 rounded-full font-medium hover:bg-green-700 transition shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                            >
                                Bize Ulaşın
                            </button>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden flex items-center">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="text-gray-600 hover:text-yellow-600 focus:outline-none"
                            >
                                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden bg-white border-t border-gray-100 shadow-lg absolute w-full">
                        <div className="px-4 pt-2 pb-4 space-y-1">
                            <a href="#about" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-yellow-600 hover:bg-yellow-50">Hakkımızda</a>
                            <a href="#events" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-yellow-600 hover:bg-yellow-50">Etkinlikler</a>
                            <a href="#announcements" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-yellow-600 hover:bg-yellow-50">Duyurular</a>
                            <button
                                onClick={() => {
                                    document.getElementById('footer').scrollIntoView({ behavior: 'smooth' });
                                    setIsMenuOpen(false);
                                }}
                                className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-green-600 hover:bg-green-50"
                            >
                                İletişim
                            </button>
                        </div>
                    </div>
                )}
            </header>

            {/* Hero Section */}
            <div className="relative pt-32 pb-32 flex content-center items-center justify-center min-h-[75vh] bg-[#fdfbf7]">
                <div className="container relative mx-auto px-4 z-10">
                    <div className="items-center flex flex-wrap">
                        <div className="w-full lg:w-8/12 px-4 ml-auto mr-auto text-center">
                            {/* Logos Row - Main logo centered with partner logos on sides */}
                            <div className="flex items-center justify-center gap-4 md:gap-8 mb-8 flex-wrap">
                                <div className="flex items-center justify-center w-24 h-24 md:w-32 md:h-32 bg-white rounded-full p-2 shadow-lg transform hover:scale-105 transition-transform duration-300 border border-gray-100">
                                    <img src="/tubitak.png" alt="TÜBİTAK Logo" className="max-w-full max-h-full object-contain" />
                                </div>
                                <div className="flex items-center justify-center w-32 h-32 md:w-40 md:h-40 bg-white rounded-full p-2 shadow-xl z-10 transform hover:scale-110 transition-transform duration-300 border border-gray-100">
                                    <img src="/logo.png" alt="BAİBÜ Kampüs Kooperatifi" className="max-w-full max-h-full object-contain" />
                                </div>
                                <div className="flex items-center justify-center w-24 h-24 md:w-32 md:h-32 bg-white rounded-full p-2 shadow-lg transform hover:scale-105 transition-transform duration-300 border border-gray-100">
                                    <img src="/baibu-logo.png" alt="BAİBÜ Logo" className="max-w-full max-h-full object-contain" />
                                </div>
                            </div>
                            <h1 className="text-yellow-700 font-bold text-5xl mb-6 drop-shadow-sm">
                                {hero.title && hero.title.split('Hakkında')[0]} <span className="text-emerald-600">Hakkında</span>
                            </h1>
                            <p className="mt-4 text-lg text-gray-600 leading-relaxed whitespace-pre-line max-w-2xl mx-auto">
                                {hero.description}
                            </p>
                        </div>
                    </div>
                </div>
            </div>


            {/* Info Cards Section */}
            <div className="relative -mt-24 pb-16 z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Misyonumuz - Yellow */}
                        <div className="bg-yellow-100/90 backdrop-blur rounded-xl p-6 shadow-xl border border-yellow-200 hover:transform hover:-translate-y-1 transition duration-300">
                            <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center text-white mb-4 shadow-lg">
                                <Target size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Misyonumuz</h3>
                            <p className="text-gray-700 text-sm leading-relaxed">
                                Deri endüstrisi atıklarını değerli, yenilikçi ürünlere dönüştürerek, döngüsel sürdürülebilirliği ve döngüsel ekonomi uygulamalarını teşvik etmek.
                            </p>
                        </div>

                        {/* Öğrenci Liderliğinde Girişim - Green/Cyan */}
                        <div className="bg-emerald-100/90 backdrop-blur rounded-xl p-6 shadow-xl border border-emerald-200 hover:transform hover:-translate-y-1 transition duration-300">
                            <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white mb-4 shadow-lg">
                                <Users size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Öğrenci Liderliğinde Girişim</h3>
                            <p className="text-gray-700 text-sm leading-relaxed">
                                Sürdürülebilirliğe katkı sunan sıfır atık ve döngüsel ekonomi ilkeleriyle öğrenciler tarafından yürütülen bir girişim.
                            </p>
                        </div>

                        {/* İnovasyon Odaklılık - White/Gray */}
                        <div className="bg-white/90 backdrop-blur rounded-xl p-6 shadow-xl border border-gray-200 hover:transform hover:-translate-y-1 transition duration-300">
                            <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-white mb-4 shadow-lg">
                                <Lightbulb size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">İnovasyon Odaklılık</h3>
                            <p className="text-gray-700 text-sm leading-relaxed">
                                Malzeme kullanımını en üst düzeye çıkarmak ve yüksek kaliteli sürdürülebilir ürünler için son teknoloji teknikler ve tasarımlar geliştirmek.
                            </p>
                        </div>

                        {/* Toplumsal Etki - Pink */}
                        <div className="bg-pink-100/90 backdrop-blur rounded-xl p-6 shadow-xl border border-pink-200 hover:transform hover:-translate-y-1 transition duration-300">
                            <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center text-white mb-4 shadow-lg">
                                <Heart size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Toplumsal Etki</h3>
                            <p className="text-gray-700 text-sm leading-relaxed">
                                Sürdürülebilir uygulamalar hakkında farkındalık oluştururken, ekonomik fırsatlar yaratmak ve çevresel ayak izini azaltmak.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* About Section */}
            <section id="about" className="py-16 bg-yellow-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800 mb-6">{about.title}</h2>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                {about.text1}
                            </p>
                            <p className="text-gray-700 leading-relaxed">
                                {about.text2}
                            </p>
                        </div>
                        <div className="rounded-xl overflow-hidden shadow-lg">
                            <img src={about.imageUrl || "/leather.jpg"} alt="About" className="w-full h-80 object-cover" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Events Section */}
            <section id="events" className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-yellow-700 mb-4">Etkinlikler</h2>
                        <p className="text-gray-700 max-w-3xl mx-auto">
                            Projemiz hakkında daha fazla bilgi edinmek ve kendinizi geliştirmek için eğitim, seminer ve atölyelerimize katılın.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {events && events.map(e => (
                            <div key={e.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
                                <div className="relative h-48 bg-gray-800 group">
                                    {e.images && e.images.length > 0 ? (
                                        <>
                                            <img
                                                src={e.images[currentImageIndex[e.id] || 0]}
                                                alt={e.title}
                                                className="w-full h-full object-cover opacity-90 transition group-hover:opacity-100"
                                                onError={(evt) => {
                                                    evt.target.src = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop";
                                                }}
                                            />
                                            {e.images.length > 1 && (
                                                <>
                                                    <button
                                                        onClick={(ev) => {
                                                            ev.stopPropagation();
                                                            const currentIndex = currentImageIndex[e.id] || 0;
                                                            const newIndex = currentIndex === 0 ? e.images.length - 1 : currentIndex - 1;
                                                            setCurrentImageIndex(prev => ({ ...prev, [e.id]: newIndex }));
                                                        }}
                                                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition"
                                                    >
                                                        <ChevronLeft size={20} />
                                                    </button>
                                                    <button
                                                        onClick={(ev) => {
                                                            ev.stopPropagation();
                                                            const currentIndex = currentImageIndex[e.id] || 0;
                                                            const newIndex = (currentIndex + 1) % e.images.length;
                                                            setCurrentImageIndex(prev => ({ ...prev, [e.id]: newIndex }));
                                                        }}
                                                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition"
                                                    >
                                                        <ChevronRight size={20} />
                                                    </button>
                                                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                                                        {e.images.map((_, index) => (
                                                            <div
                                                                key={index}
                                                                className={`w-2 h-2 rounded-full ${index === (currentImageIndex[e.id] || 0) ? 'bg-white' : 'bg-white/50'}`}
                                                            />
                                                        ))}
                                                    </div>
                                                </>
                                            )}
                                        </>
                                    ) : (
                                        <img src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop" alt={e.title} className="w-full h-full object-cover opacity-70" />
                                    )}

                                    <div className="absolute top-4 right-4">
                                        <span className={`text-white text-xs px-4 py-1.5 rounded-full font-semibold shadow-sm ${e.status === 'upcoming' ? 'bg-green-600' : 'bg-gray-600'}`}>
                                            {e.status === 'upcoming' ? 'Yaklaşan' : e.status === 'active' ? 'Bugün' : 'Geçmiş'}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4 line-clamp-1">{e.title}</h3>
                                    <div className="space-y-2 mb-4 text-sm text-gray-600">
                                        <div className="flex items-center"><Calendar size={16} className="mr-2 text-yellow-600" /><span>{e.date}</span></div>
                                        <div className="flex items-center"><Clock size={16} className="mr-2 text-yellow-600" /><span>{e.time}</span></div>
                                        <div className="flex items-center"><MapPin size={16} className="mr-2 text-yellow-600" /><span>{e.location}</span></div>
                                    </div>
                                    <button onClick={() => setSelectedEvent(e)} className="w-full py-2 rounded-lg transition flex items-center justify-center font-medium bg-gradient-to-r from-yellow-500 to-green-500 text-white hover:shadow-md">
                                        Detaylar <ArrowRight size={16} className="ml-2" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Announcements Section */}
            <section id="announcements" className="py-16 bg-gradient-to-br from-yellow-50 to-green-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full mb-4">
                            <Megaphone size={18} className="mr-2" />
                            <span className="font-semibold">En Son Güncellemeler</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-yellow-700 mb-4">Duyurular</h2>
                    </div>

                    <div className="space-y-6 max-w-4xl mx-auto">
                        {announcements && announcements.map(e => (
                            <div
                                key={e.id}
                                onClick={() => setSelectedAnnouncement(e)}
                                className="bg-white rounded-xl p-6 border-2 shadow-sm hover:shadow-md transition border-yellow-100 cursor-pointer transform hover:-translate-y-1"
                            >
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 mr-4">
                                        <div className="w-12 h-12 rounded-full bg-yellow-200 flex items-center justify-center">
                                            <Megaphone size={24} className="text-yellow-700" />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-xl font-bold text-gray-800">{e.title}</h3>
                                            <span className="text-sm text-gray-600">{e.date}</span>
                                        </div>
                                        <p className="text-gray-700 leading-relaxed line-clamp-3">{e.description}</p>

                                        {e.images && e.images.length > 0 && (
                                            <div className="grid grid-cols-2 gap-4 mt-4 pointer-events-none">
                                                {e.images.slice(0, 2).map((image, index) => (
                                                    <div key={index} className="relative h-32 rounded-lg overflow-hidden shadow-sm">
                                                        <img
                                                            src={image}
                                                            alt={`${e.title} - ${index + 1}`}
                                                            className="w-full h-full object-cover"
                                                            onError={(evt) => {
                                                                evt.target.style.display = 'none';
                                                            }}
                                                        />
                                                    </div>
                                                ))}
                                                {e.images.length > 2 && (
                                                    <div className="text-xs text-gray-500 mt-1">+{e.images.length - 2} daha fazla görsel</div>
                                                )}
                                            </div>
                                        )}

                                        <div className="flex items-center text-sm font-medium text-yellow-700 mt-2">
                                            <span>Detayları Görüntüle</span>
                                            <span className="ml-1">→</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-10 text-center">
                        <div className="inline-block bg-yellow-100 border-2 border-yellow-300 rounded-xl px-8 py-4">
                            <p className="text-gray-800 font-medium">Güncel kalmak ister misiniz? Bizi sosyal medyadan takip edin!</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer id="footer" className="bg-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center space-x-3 mb-4">
                                <img src="/logo.png" alt="Logo" className="w-12 h-12 object-contain bg-white rounded-full" />
                                <span className="text-xl font-bold">BAİBÜ Kampüs Kooperatifi</span>
                            </div>
                            <p className="text-gray-400 text-sm mb-4">
                                Deri atıklarını sıfır atık prensipleri ve döngüsel ekonomi yoluyla sürdürülebilir inovasyona dönüştürüyoruz.
                            </p>
                            <button className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 transition"> TÜBİTAK Destekli </button>
                        </div>

                        <div>
                            <h3 className="font-bold text-lg mb-4 text-yellow-400">İletişim</h3>
                            <ul className="space-y-2 text-gray-400 text-sm">
                                <li className="flex items-start"><Mail className="mr-2" size={16} /><span>{footer.email}</span></li>
                                <li className="flex items-start"><Phone className="mr-2" size={16} /><span>{footer.phone}</span></li>
                                <li className="flex items-start"><MapPin className="mr-2" size={16} /><span>{footer.address}</span></li>
                            </ul>
                        </div>

                        <div id="contact-social">
                            <h3 className="font-bold text-lg mb-4 text-yellow-400">Bizi Takip Edin</h3>
                            <div className="flex space-x-4">
                                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-yellow-600 transition"><Instagram size={20} /></a>
                                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-yellow-600 transition"><Twitter size={20} /></a>
                                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-yellow-600 transition"><Linkedin size={20} /></a>
                                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-yellow-600 transition"><Facebook size={20} /></a>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
                        <p>{footer.copyright}</p>
                        <div className="mt-4 md:mt-0">
                            <Link to="/login" className="hover:text-white transition">Yönetici Girişi</Link>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Event Modal */}
            {
                selectedEvent && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden max-h-[90vh] overflow-y-auto">
                            <div className="relative h-64 bg-gray-900 group">
                                {selectedEvent.images && selectedEvent.images.length > 0 ? (
                                    <>
                                        <img
                                            src={selectedEvent.images[0]}
                                            alt={selectedEvent.title}
                                            className="w-full h-full object-contain bg-black"
                                            onError={(evt) => {
                                                evt.target.src = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop";
                                            }}
                                        />
                                        {selectedEvent.images.length > 1 && (
                                            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                                                {selectedEvent.images.map((img, idx) => (
                                                    <div key={idx} className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-white' : 'bg-white/50'}`}></div>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <img src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop" alt={selectedEvent.title} className="w-full h-full object-cover opacity-70" />
                                )}
                                <button onClick={() => setSelectedEvent(null)} className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition"><X size={24} /></button>
                            </div>
                            <div className="p-8">
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedEvent.title}</h2>
                                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6 border-b border-gray-100 pb-6">
                                    <div className="flex items-center"><Calendar size={18} className="mr-2 text-green-600" /><span className="font-medium">{selectedEvent.date}</span></div>
                                    <div className="flex items-center"><Clock size={18} className="mr-2 text-green-600" /><span className="font-medium">{selectedEvent.time}</span></div>
                                    <div className="flex items-center"><MapPin size={18} className="mr-2 text-green-600" /><span className="font-medium">{selectedEvent.location}</span></div>
                                </div>

                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Etkinlik Hakkında</h3>
                                <p className="text-gray-600 mb-6 leading-relaxed">{selectedEvent.description}</p>

                                {selectedEvent.images && selectedEvent.images.length > 0 && (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-4">
                                        {selectedEvent.images.map((img, idx) => (
                                            <img key={idx} src={img} alt={`Gallery ${idx}`} className="h-24 w-full object-cover rounded cursor-pointer hover:opacity-80" onClick={() => window.open(img, '_blank')} />
                                        ))}
                                    </div>
                                )}

                                <div className="mt-8 flex justify-end">
                                    <button onClick={() => setSelectedEvent(null)} className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition">Kapat</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Announcement Detail Modal */}
            {
                selectedAnnouncement && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
                            <div className={`p-6 bg-yellow-50 border-b flex justify-between items-start sticky top-0 bg-opacity-95 backdrop-blur-sm z-10 rounded-t-2xl`}>
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full bg-white/60 shadow-sm`}>
                                        <Megaphone size={24} className="text-yellow-700" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">{selectedAnnouncement.title}</h2>
                                        <p className="text-sm text-gray-600">{selectedAnnouncement.date}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedAnnouncement(null)}
                                    className="p-2 rounded-full transition hover:bg-gray-200 text-gray-700"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-8">
                                <div className="prose max-w-none">
                                    <p className="text-gray-700 leading-relaxed mb-6 whitespace-pre-line">
                                        {selectedAnnouncement.description}
                                    </p>

                                    {selectedAnnouncement.images && selectedAnnouncement.images.length > 0 && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                            {selectedAnnouncement.images.map((image, index) => (
                                                <div key={index} className="rounded-xl overflow-hidden shadow-md">
                                                    <img
                                                        src={image}
                                                        alt={`${selectedAnnouncement.title} - ${index + 1}`}
                                                        className="w-full h-auto object-cover hover:scale-105 transition duration-500"
                                                        onError={(evt) => { evt.target.style.display = 'none'; }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {selectedAnnouncement.link && (
                                        <div className="flex justify-center mt-8">
                                            <a
                                                href={selectedAnnouncement.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-yellow-600 to-green-600 text-white font-semibold rounded-xl hover:shadow-lg transition transform hover:-translate-y-0.5"
                                            >
                                                <ArrowRight size={20} className="mr-2" />
                                                Başvuru Formunu Görüntüle
                                            </a>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-8 pt-6 border-t flex justify-end">
                                    <button
                                        onClick={() => setSelectedAnnouncement(null)}
                                        className="px-6 py-2 text-gray-600 hover:text-gray-900 font-medium transition"
                                    >
                                        Kapat
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                )}
        </div >
    );
};

export default Home;
