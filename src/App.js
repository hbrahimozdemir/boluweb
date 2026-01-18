import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Target, Users, Lightbulb, Heart, Bell, Menu, X, Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';
import './App.css';
import logo from './logo.png';

const KampuskoopWebsite = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Helper to parse Turkish date string with time to Date object
  const parseDate = (dateStr, timeStr) => {
    const months = {
      'Ocak': 0, 'Şubat': 1, 'Mart': 2, 'Nisan': 3, 'Mayıs': 4, 'Haziran': 5,
      'Temmuz': 6, 'Ağustos': 7, 'Eylül': 8, 'Ekim': 9, 'Kasım': 10, 'Aralık': 11
    };

    // Parse date: "19 Ocak 2026"
    const parts = dateStr.split(' ');
    if (parts.length !== 3) return new Date();

    // Parse time: "13:30"
    const timeParts = timeStr ? timeStr.split(':') : ['00', '00'];

    const day = parseInt(parts[0]);
    const month = months[parts[1]];
    const year = parseInt(parts[2]);
    const hours = parseInt(timeParts[0]);
    const minutes = parseInt(timeParts[1]);

    return new Date(year, month, day, hours, minutes);
  };

  // Helper to determine status based on date AND time
  const getEventStatus = (dateStr, timeStr) => {
    const eventDate = parseDate(dateStr, timeStr);
    const now = new Date();

    // If event is in the past (date + time)
    if (eventDate < now) return 'past';

    // If same day but future time
    if (eventDate.getDate() === now.getDate() &&
      eventDate.getMonth() === now.getMonth() &&
      eventDate.getFullYear() === now.getFullYear()) {
      return 'active'; // Today, upcoming time
    }

    return 'upcoming';
  };

  const rawEvents = [
    {
      id: 1,
      title: "Deri Ürün Tasarım ve Üretim Workshopu",
      date: "25 Temmuz 2026",
      time: "13:30",
      location: "Atölye",
      description: "Deri atık parçalardan uygulamalı deri obje üretimi. Basit el aletleri, lazer makinaları, inovatif ürünler.",
      status: "upcoming",
      color: "orange"
    },
    {
      id: 2,
      title: "E-ticaret ve Mikro İhracat",
      date: "24 Aralık 2026",
      time: "14:00",
      location: "Trendyol Yöneticisi",
      description: "E-ticaret ve E-ihracata bakış. Trendyol uygulamaları.",
      status: "active",
      color: "green"
    },
    {
      id: 3,
      title: "Girişimcilik-2: Pazara Giriş",
      date: "23 Aralık 2025",
      time: "14:00",
      location: "Konferans Salonu",
      description: "Go-to market strategy. Müşteri odaklı pazara giriş stratejisi. Müşteri nasıl bulunur?",
      status: "past",
      color: "gray"
    },
    {
      id: 4,
      title: "Temel İşletmecilik",
      date: "18 Aralık 2025",
      time: "13:30",
      location: "Onur Özevin",
      description: "Yeni bir girişim kurma süreçleri. İşletmecilik 101. Kampüskoop hakkında bilgilendirme.",
      status: "upcoming",
      color: "orange"
    },
    {
      id: 5,
      title: "Girişimcilik-1: İş Modeli Kanvası",
      date: "17 Aralık 2025",
      time: "14:00",
      location: "Soydan Cengiz",
      description: "İş Modeli Kanvası nedir, nasıl yapılır? Kendi iş modeli kanvasını Yarat.",
      status: "active",
      color: "green"
    },
    {
      id: 6,
      title: "E-ticaret Stratejileri",
      date: "11 Aralık 2025",
      time: "13:30",
      location: "Mehmet Fazlı Türker",
      description: "Deri ürünleri girişimimiz. E-ticaret nasıl yapılır?",
      status: "past",
      color: "gray"
    },
    {
      id: 7,
      title: "Sürdürülebilirlik İlkeleri",
      date: "10 Aralık 2025",
      time: "13:30",
      location: "Doç. Dr. Gamze Doğdu",
      description: "Sürdürülebilirlik kavramına genel bakış, Sıfır Atık, Döngüsel Ekonomi. Karbon Ayak izimi nasıl azaltırım?",
      status: "upcoming",
      color: "orange"
    },
    {
      id: 8,
      title: "Muhasebe Uygulamaları Eğitimi",
      date: "04 Aralık 2025",
      time: "13:30",
      location: "Bolu SMMM Eğitmenleri",
      description: "Bilgisayarlı muhasebe uygulamaları, LUCA programı eğitimi, kendi işinin muhasebesini nasıl tutarsın?",
      status: "active",
      color: "green"
    },
    {
      id: 9,
      title: "Muhasebe ve Kariyer Söyleşisi",
      date: "03 Aralık 2025",
      time: "13:30",
      location: "İlkay Bağatır (Bolu SMMM Başkanı)",
      description: "Muhasebe mesleğinin dünü, bugünü ve geleceği, mesleki kariyer fırsatları, yeni iş kurma prosedürleri konusunda söyleşi.",
      status: "past",
      color: "gray"
    }
  ];

  // Process events with dynamic status based on Date AND Time
  const processedEvents = rawEvents.map(event => {
    const status = getEventStatus(event.date, event.time);
    const dateObj = parseDate(event.date, event.time);
    return { ...event, status, dateObj };
  });

  // Sort events: Upcoming/Active first (sorted by date), then Past events
  const events = processedEvents.sort((a, b) => {
    // Prioritize active/upcoming over past
    const isAPast = a.status === 'past';
    const isBPast = b.status === 'past';

    if (isAPast && !isBPast) return 1;
    if (!isAPast && isBPast) return -1;

    // Within same category, sort by date (closest first)
    return a.dateObj - b.dateObj;
  });

  const [selectedEvent, setSelectedEvent] = useState(null);

  const announcements = [
    {
      id: 1,
      title: "TÜBİTAK Hibesi Onaylandı",
      date: "20 Aralık 2025",
      description: "Projemizin TÜBİTAK fonu için onaylandığını duyurmaktan mutluluk duyuyoruz, bu da sürdürülebilir deri inovasyon girişimlerimizi genişletmemizi sağlayacak.",
      icon: Lightbulb,
      color: "mint"
    },
    {
      id: 2,
      title: "Yeni Üye Başvuruları Açıldı",
      date: "15 Aralık 2025",
      description: "Kampuskoop, kooperatifimize katılmak isteyen öğrencilerden başvuru kabul etmeye başladı. Sürdürülebilir inovasyon ekibimizin bir parçası olmak için 31 Ocak'a kadar başvurun.",
      icon: Users,
      color: "yellow"
    },
    {
      id: 3,
      title: "İnovasyon Yarışması Kazananları",
      date: "10 Aralık 2025",
      description: "Üniversite Sürdürülebilirlik İnovasyon Yarışması'nda sıfır atık deri cüzdan tasarımıyla birincilik kazanan üyelerimizi tebrik ederiz!",
      icon: Target,
      color: "mint"
    },
    {
      id: 4,
      title: "Kış Çalıştay Serisi",
      date: "5 Aralık 2025",
      description: "İleri deri işçiliği, döngüsel ekonomi prensipleri ve sürdürülebilir iş uygulamalarını kapsayan kapsamlı kış çalıştay serimize katılın.",
      icon: Calendar,
      color: "gray"
    }
  ];

  const missionCards = [
    {
      title: "Misyonumuz",
      icon: Target,
      color: "bg-yellow-100",
      iconColor: "text-yellow-700",
      description: "Deri endüstrisi atıklarını değerli, yenilikçi ürünlere dönüştürerek, döngüsel sürdürülebilirliği ve döngüsel ekonomi uygulamalarını teşvik etmek."
    },
    {
      title: "Öğrenci Liderliğinde Girişim",
      icon: Users,
      color: "bg-teal-100",
      iconColor: "text-teal-700",
      description: "Sürdürülebilirliğe katkı sunan sıfır atık ve döngüsel ekonomi ilkeleriyle öğrenciler tarafından yürütülen bir girişim."
    },
    {
      title: "İnovasyon Odaklılık",
      icon: Lightbulb,
      color: "bg-gray-100",
      iconColor: "text-gray-700",
      description: "Malzeme kullanımını en üst düzeye çıkarmak ve yüksek kaliteli sürdürülebilir ürünler için son teknoloji teknikler ve tasarımlar geliştirmek."
    },
    {
      title: "Toplumsal Etki",
      icon: Heart,
      color: "bg-pink-100",
      iconColor: "text-pink-700",
      description: "Sürdürülebilir uygulamalar hakkında farkındalık oluştururken, ekonomik fırsatlar yaratmak ve çevresel ayak izini azaltmak."
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return 'bg-yellow-500';
      case 'active': return 'bg-green-500';
      case 'past': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getAnnouncementBg = (color) => {
    switch (color) {
      case 'mint': return 'bg-teal-50 border-teal-200';
      case 'yellow': return 'bg-yellow-50 border-yellow-200';
      case 'gray': return 'bg-gray-50 border-gray-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <img src={logo} alt="Kampuskoop Logo" className="w-12 h-12 object-contain" />
              <span className="text-xl font-bold text-yellow-700">Kampuskoop</span>
            </div>

            <nav className="hidden md:flex space-x-8">
              <a href="#about" className="text-gray-700 hover:text-yellow-700 transition">Hakkımızda</a>
              <a href="#events" className="text-gray-700 hover:text-yellow-700 transition">Etkinlikler</a>
              <a href="#announcements" className="text-gray-700 hover:text-yellow-700 transition">Duyurular</a>
            </nav>

            <button className="hidden md:block bg-gradient-to-r from-yellow-600 to-green-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition">
              Bize Ulaşın
            </button>

            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 py-3 space-y-3">
              <a href="#about" className="block text-gray-700 hover:text-yellow-700">Hakkımızda</a>
              <a href="#events" className="block text-gray-700 hover:text-yellow-700">Etkinlikler</a>
              <a href="#announcements" className="block text-gray-700 hover:text-yellow-700">Duyurular</a>
              <button className="w-full bg-gradient-to-r from-yellow-600 to-green-600 text-white px-6 py-2 rounded-lg">
                Bize Ulaşın
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section id="about" className="bg-gradient-to-br from-yellow-50 to-green-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <img src={logo} alt="BAİBÜ Kampüs Kooperatifi" className="w-48 h-48 object-contain" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-yellow-700">Kampuskoop</span>{' '}
              <span className="text-green-700">Hakkında</span>
            </h1>
            <p className="text-lg text-gray-700 max-w-4xl mx-auto leading-relaxed">
              Sıfır atık prensipleri ve döngüsel ekonomi metodolojileri aracılığıyla sürdürülebilir deri
              inovasyonuna öncülük eden, TÜBİTAK destekli bir projedir. Kampuskoop TÜBİTAK-3005 Başarılı
              Genç Girişimciliğin Arttırılması için Öğrenci Kooperatifleri Modeli Projesinin bir çıktısı olarak hayata
              geçmiştir.
            </p>
          </div>

          {/* Mission Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {missionCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <div key={index} className={`${card.color} rounded-xl p-6 shadow-sm hover:shadow-md transition`}>
                  <div className={`${card.iconColor} mb-4`}>
                    <Icon size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-3">{card.title}</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">{card.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Zero Waste Section */}
      <section className="py-16 bg-yellow-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Sıfır Atık ile Döngüsel Ekonomi</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Yenilikçi yaklaşımımız, her deri parçasının kullanılmasını sağlayarak, atık olacak
                materyalleri güzel, fonksiyonel ürünlere dönüştürüyor. Dikkatli tasarım ve işçilikle
                neredeyse mükemmel malzeme verimliliği sağlıyoruz.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Döngüsel ekonomi prensiplerimizi uygulayarak, sadece atıkları azaltmakla kalmıyor, aynı
                zamanda deri ürünlerinin sürdürülebilir ve sorumlu bir şekilde nasıl yaratılabileceğini
                yeniden tasarlıyoruz.
              </p>
            </div>
            <div className="rounded-xl overflow-hidden shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1590736969955-71cc94901144?w=800&h=600&fit=crop"
                alt="Leather crafting"
                className="w-full h-80 object-cover"
              />
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
              Projemiz hakkında daha fazla bilgi edinmek ve kendinizi geliştirmek için eğitim, seminer ve
              atölyelerimize katılın. Etkinlikler başarılı genç girişimciliği arttırmak için gerekli olan girişimcilik,
              işletmecilik, e-ticaret eğitimlerinin yanı sıra sürdürülebilirlik hakkında farkındalık yaratmayı
              amaçlıyor.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div key={event.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
                <div className="relative h-48 bg-gradient-to-br from-gray-900 to-gray-700">
                  <img
                    src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop"
                    alt={event.title}
                    className="w-full h-full object-cover opacity-60"
                  />
                  <div className="absolute top-4 right-4">
                    <span className={`${getStatusColor(event.status)} text-white text-xs px-4 py-1.5 rounded-full font-semibold shadow-sm`}>
                      {event.status === 'upcoming' ? 'Yaklaşan Etkinlik' : event.status === 'active' ? 'Bugün' : 'Geçmiş Etkinlik'}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">{event.title}</h3>

                  <div className="space-y-2 mb-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar size={16} className="mr-2 text-yellow-600" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock size={16} className="mr-2 text-yellow-600" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin size={16} className="mr-2 text-yellow-600" />
                      <span>{event.location}</span>
                    </div>
                  </div>

                  <p className="text-gray-700 text-sm mb-4">{event.description}</p>

                  <button
                    onClick={() => setSelectedEvent(event)}
                    className={`w-full py-2 rounded-lg transition flex items-center justify-center font-medium ${event.status === 'past'
                      ? 'bg-gray-400 text-gray-100 cursor-not-allowed'
                      : 'bg-gradient-to-r from-yellow-500 to-green-500 text-white hover:shadow-md'
                      }`}
                    disabled={event.status === 'past'}
                  >
                    {event.status === 'past' ? 'Etkinlik Geçti' : 'Detaylar'}
                    <span className="ml-2">→</span>
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
              <Bell size={18} className="mr-2" />
              <span className="font-semibold">En Son Güncellemeler</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-yellow-700 mb-4">Duyurular</h2>
            <p className="text-gray-700">
              Kampuskoop'tan en son haberler, başarılar ve fırsatlardan haberdar olun.
            </p>
          </div>

          <div className="space-y-6 max-w-4xl mx-auto">
            {announcements.map((announcement) => {
              const Icon = announcement.icon;
              return (
                <div
                  key={announcement.id}
                  className={`${getAnnouncementBg(announcement.color)} rounded-xl p-6 border-2 shadow-sm hover:shadow-md transition`}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-4">
                      <div className={`w-12 h-12 rounded-full ${announcement.color === 'mint' ? 'bg-teal-200' : announcement.color === 'yellow' ? 'bg-yellow-200' : 'bg-gray-200'} flex items-center justify-center`}>
                        <Icon size={24} className={announcement.color === 'mint' ? 'text-teal-700' : announcement.color === 'yellow' ? 'text-yellow-700' : 'text-gray-700'} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold text-gray-800">{announcement.title}</h3>
                        <span className="text-sm text-gray-600">{announcement.date}</span>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{announcement.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-10 text-center">
            <div className="inline-block bg-yellow-100 border-2 border-yellow-300 rounded-xl px-8 py-4">
              <p className="text-gray-800 font-medium">
                Güncel kalmak ister misiniz? Gerçek zamanlı duyurular ve perde arkası içerikler için bizi sosyal medyadan takip edin!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <img src={logo} alt="Kampuskoop Logo" className="w-12 h-12 object-contain" />
                <span className="text-xl font-bold">Kampuskoop</span>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Deri atıklarını sıfır atık prensipleri ve döngüsel ekonomi yoluyla sürdürülebilir inovasyona dönüştürüyoruz.
              </p>
              <button className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 transition">
                TÜBİTAK Destekli
              </button>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4 text-yellow-400">Hızlı Bağlantılar</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#about" className="hover:text-white transition">Hakkımızda</a></li>
                <li><a href="#events" className="hover:text-white transition">Etkinlikler</a></li>
                <li><a href="#announcements" className="hover:text-white transition">Duyurular</a></li>
                <li><a href="#" className="hover:text-white transition">Ürünlerimiz</a></li>
                <li><a href="#" className="hover:text-white transition">Bize Katılın</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4 text-yellow-400">İletişim</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="flex items-start">
                  <span className="mr-2">📧</span>
                  <span>info@kampuskoop.edu.tr</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">📞</span>
                  <span>+90 (312) 555-0123</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">📍</span>
                  <span>Üniversite Kampusu, İnovasyon Merkezi</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4 text-yellow-400">Bizi Takip Edin</h3>
              <p className="text-gray-400 text-sm mb-4">
                Güncellemeler ve sürdürülebilir inovasyon hikayeleri için bağlantıda kalın.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-yellow-600 transition">
                  <Facebook size={20} />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-yellow-600 transition">
                  <Instagram size={20} />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-yellow-600 transition">
                  <Twitter size={20} />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-yellow-600 transition">
                  <Linkedin size={20} />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <p>© 2025 Kampuskoop. Tüm hakları saklıdır. Sürdürülebilir bir öğrenci girişimi.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition">Gizlilik Politikası</a>
              <a href="#" className="hover:text-white transition">Hizmet Şartları</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden animate-scale-in">
            {/* Modal Header with Image */}
            <div className="relative h-48 bg-gray-900">
              <img
                src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop"
                alt={selectedEvent.title}
                className="w-full h-full object-cover opacity-70"
              />
              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition"
              >
                <X size={24} />
              </button>
              <div className="absolute bottom-4 left-6">
                <span className={`${getStatusColor(selectedEvent.status)} text-white text-xs px-3 py-1 rounded-full font-semibold shadow-sm`}>
                  {selectedEvent.status === 'upcoming' ? 'Yaklaşan' : selectedEvent.status === 'active' ? 'Bugün' : 'Geçmiş'}
                </span>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedEvent.title}</h2>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6 border-b border-gray-100 pb-6">
                <div className="flex items-center">
                  <Calendar size={18} className="mr-2 text-green-600" />
                  <span className="font-medium">{selectedEvent.date}</span>
                </div>
                <div className="flex items-center">
                  <Clock size={18} className="mr-2 text-green-600" />
                  <span className="font-medium">{selectedEvent.time}</span>
                </div>
                <div className="flex items-center">
                  <MapPin size={18} className="mr-2 text-green-600" />
                  <span className="font-medium">{selectedEvent.location}</span>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Etkinlik Hakkında</h3>
                <p className="text-gray-600 leading-relaxed">
                  {selectedEvent.description}
                </p>

                <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 mt-4">
                  <h4 className="font-medium text-yellow-800 mb-1">Katılım Bilgisi</h4>
                  <p className="text-sm text-yellow-700">
                    Bu etkinlik halka açıktır ve katılım ücretsizdir. Lütfen etkinlik saatinden 15 dakika önce alanda hazır bulununuz.
                  </p>
                </div>
              </div>

              <div className="mt-8 flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="px-6 py-2.5 text-gray-600 hover:text-gray-900 font-medium transition"
                >
                  Kapat
                </button>
                {selectedEvent.status !== 'past' && (
                  <button className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium shadow-md transition transform hover:scale-105">
                    Kayıt Ol
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div >
  );
};

export default KampuskoopWebsite;
