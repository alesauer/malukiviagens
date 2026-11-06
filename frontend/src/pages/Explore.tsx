import React, { useEffect, useState } from 'react';
import {
  MapPin,
  Star,
  Search,
  Plus,
  CloudSun,
  Navigation,
  Utensils,
  Landmark,
  ExternalLink,
  Heart
} from 'lucide-react';
import { api } from '../services/api';
import { Destination, Attraction } from '../types';

export const Explore: React.FC = () => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [selectedCity, setSelectedCity] = useState('Gramado');
  const [weatherData, setWeatherData] = useState<any>(null);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // New Attraction Modal state
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('ponto_turistico');
  const [address, setAddress] = useState('');
  const [priceRange, setPriceRange] = useState('$$');
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    loadCatalog();
  }, [categoryFilter]);

  useEffect(() => {
    if (selectedCity) {
      loadWeather(selectedCity);
    }
  }, [selectedCity]);

  const loadCatalog = async () => {
    try {
      setLoading(true);
      const [destList, attrList] = await Promise.all([
        api.getCatalogDestinations().catch(() => []),
        api.getAttractions(undefined, categoryFilter || undefined).catch(() => [])
      ]);
      setDestinations(destList);
      setAttractions(attrList);
    } finally {
      setLoading(false);
    }
  };

  const loadWeather = async (city: string) => {
    try {
      const data = await api.getWeather(city);
      setWeatherData(data);
    } catch (e) {
      console.warn(e);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    try {
      const newAttr = await api.createAttraction({
        name,
        category,
        address,
        price_range: priceRange,
        is_favorite: isFavorite
      });
      setAttractions([newAttr, ...attractions]);
      setShowModal(false);
      setName('');
      setAddress('');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleReview = async (attrId: number) => {
    const ratingStr = prompt('Avaliação familiar (1 a 5 estrelas):', '5');
    if (!ratingStr) return;
    const rating = parseInt(ratingStr, 10);
    const comment = prompt('Comentário da experiência:') || '';

    try {
      await api.addReview(attrId, rating, comment);
      loadCatalog();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Explorar Destinos e Atrações
          </h1>
          <p className="text-sm text-slate-500">
            Catálogo permanente da família, avaliações, restaurantes e previsão meteorológica
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-brand-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Atração / Restaurante</span>
        </button>
      </div>

      {/* Weather Forecast Banner (RF25) */}
      <div className="bg-gradient-to-r from-blue-600 to-sky-600 rounded-3xl p-6 text-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold px-2.5 py-1 rounded-full bg-white/20 mb-2">
            <CloudSun className="w-4 h-4" />
            <span>Previsão Meteorológica</span>
          </div>
          <h2 className="text-xl font-bold">Condições Climáticas em {selectedCity}</h2>
          <p className="text-xs text-sky-100 mt-0.5">Previsão em tempo real para planejamento das atividades</p>
        </div>

        {weatherData && weatherData.forecast && (
          <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
            {weatherData.forecast.slice(0, 3).map((day: any, i: number) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm p-3 rounded-2xl border border-white/20 text-center min-w-[100px]">
                <p className="text-[10px] uppercase font-bold text-sky-200">
                  {new Date(day.date + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'short' })}
                </p>
                <p className="text-lg font-extrabold mt-0.5">{day.temp_max.toFixed(0)}°</p>
                <p className="text-[10px] text-sky-100 line-clamp-1">{day.condition}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Category filter tabs */}
      <div className="flex overflow-x-auto gap-2 pb-1 no-scrollbar">
        {[
          { id: '', label: 'Todas as Atrações' },
          { id: 'ponto_turistico', label: 'Pontos Turísticos' },
          { id: 'restaurante', label: 'Restaurantes' },
          { id: 'museu', label: 'Museus & Cultura' },
          { id: 'parque', label: 'Parques & Natureza' },
          { id: 'compras', label: 'Compras' },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setCategoryFilter(item.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              categoryFilter === item.id
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Attractions Grid */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 text-sm">Carregando catálogo...</div>
      ) : attractions.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-400">
          <Landmark className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <p className="font-semibold text-sm">Nenhum estabelecimento ou atração cadastrada</p>
          <p className="text-xs mt-1">Cadastre seus lugares favoritos para reutilizar nas próximas viagens da família.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {attractions.map(attr => (
            <div
              key={attr.id}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
                    {attr.category}
                  </span>
                  {attr.is_favorite && (
                    <Heart className="w-4 h-4 text-rose-500 fill-current" />
                  )}
                </div>

                <h3 className="font-bold text-base text-slate-900 dark:text-white mt-2">
                  {attr.name}
                </h3>
                {attr.address && (
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="line-clamp-1">{attr.address}</span>
                  </p>
                )}

                {/* Rating display */}
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex items-center text-amber-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-xs font-bold ml-1 text-slate-800 dark:text-slate-200">
                      {attr.average_rating ? attr.average_rating.toFixed(1) : 'Sem notas'}
                    </span>
                  </div>
                  {attr.reviews && attr.reviews.length > 0 && (
                    <span className="text-[11px] text-slate-400">
                      ({attr.reviews.length} {attr.reviews.length === 1 ? 'avaliação' : 'avaliações'} familiar)
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => handleReview(attr.id)}
                  className="text-xs font-bold text-brand-600 hover:underline"
                >
                  Avaliar atração
                </button>

                {attr.address && (
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(attr.name + ' ' + attr.address)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  >
                    <span>Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Cadastrar Atração */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              Nova Atração / Restaurante
            </h2>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nome do Local
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ex: Parque Snowland / Restaurante Fondue"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Categoria
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  >
                    <option value="ponto_turistico">Ponto Turístico</option>
                    <option value="restaurante">Restaurante</option>
                    <option value="museu">Museu</option>
                    <option value="parque">Parque</option>
                    <option value="show">Show / Evento</option>
                    <option value="compras">Compras</option>
                    <option value="outros">Outros</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Faixa de Preço
                  </label>
                  <select
                    value={priceRange}
                    onChange={e => setPriceRange(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  >
                    <option value="$">$ Econômico</option>
                    <option value="$$">$$ Médio</option>
                    <option value="$$$">$$$ Alto</option>
                    <option value="$$$$">$$$$ Luxo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Endereço / Localização
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Ex: Av. Borges de Medeiros, Gramado - RS"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={isFavorite}
                  onChange={e => setIsFavorite(e.target.checked)}
                  className="rounded text-brand-600 focus:ring-brand-500"
                />
                <span>Marcar como favorito da família</span>
              </label>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 transition-colors"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
