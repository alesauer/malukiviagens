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
  Heart,
  Pencil,
  Trash2,
  Eye,
  X,
  Phone,
  Globe,
  ShoppingBag,
  Sparkles,
  DollarSign
} from 'lucide-react';
import { api } from '../services/api';
import { Destination, Attraction } from '../types';

export const Explore: React.FC = () => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [selectedCity, setSelectedCity] = useState('Gramado');
  const [weatherData, setWeatherData] = useState<any>(null);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // New Attraction Modal state
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('ponto_turistico');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [priceRange, setPriceRange] = useState('$$');
  const [desc, setDesc] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);

  // Edit Attraction Modal state
  const [editingAttr, setEditingAttr] = useState<Attraction | null>(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('ponto_turistico');
  const [editAddress, setEditAddress] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editWebsite, setEditWebsite] = useState('');
  const [editPriceRange, setEditPriceRange] = useState('$$');
  const [editDesc, setEditDesc] = useState('');
  const [editIsFavorite, setEditIsFavorite] = useState(false);

  // View details modal
  const [viewingAttr, setViewingAttr] = useState<Attraction | null>(null);

  // Review modal
  const [reviewingAttr, setReviewingAttr] = useState<Attraction | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState('');

  // Delete confirmation
  const [deletingAttr, setDeletingAttr] = useState<Attraction | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      setIsSubmitting(true);
      const newAttr = await api.createAttraction({
        name,
        category,
        address: address || undefined,
        phone: phone || undefined,
        website: website || undefined,
        price_range: priceRange,
        description: desc || undefined,
        is_favorite: isFavorite
      });
      setAttractions([newAttr, ...attractions]);
      setShowModal(false);
      resetForm();
    } catch (err: any) {
      alert(err.message || 'Erro ao criar atração.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (attr: Attraction) => {
    setEditingAttr(attr);
    setEditName(attr.name);
    setEditCategory(attr.category);
    setEditAddress(attr.address || '');
    setEditPhone(attr.phone || '');
    setEditWebsite(attr.website || '');
    setEditPriceRange(attr.price_range || '$$');
    setEditDesc(attr.description || '');
    setEditIsFavorite(attr.is_favorite);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAttr || !editName) return;

    try {
      setIsSubmitting(true);
      const updated = await api.updateAttraction(editingAttr.id, {
        name: editName,
        category: editCategory,
        address: editAddress || undefined,
        phone: editPhone || undefined,
        website: editWebsite || undefined,
        price_range: editPriceRange,
        description: editDesc || undefined,
        is_favorite: editIsFavorite
      });

      setAttractions(attractions.map(a => a.id === updated.id ? updated : a));
      setEditingAttr(null);
    } catch (err: any) {
      alert(err.message || 'Erro ao atualizar atração.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingAttr) return;
    try {
      setIsSubmitting(true);
      await api.deleteAttraction(deletingAttr.id);
      setAttractions(attractions.filter(a => a.id !== deletingAttr.id));
      if (viewingAttr?.id === deletingAttr.id) setViewingAttr(null);
      setDeletingAttr(null);
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir atração.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingAttr) return;

    try {
      setIsSubmitting(true);
      await api.addReview(reviewingAttr.id, reviewRating, reviewComment.trim() || undefined);
      setReviewingAttr(null);
      setReviewComment('');
      setReviewRating(5);
      loadCatalog();
    } catch (err: any) {
      alert(err.message || 'Erro ao registrar avaliação.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setName('');
    setCategory('ponto_turistico');
    setAddress('');
    setPhone('');
    setWebsite('');
    setPriceRange('$$');
    setDesc('');
    setIsFavorite(false);
  };

  const filteredAttractions = attractions.filter(attr => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchName = attr.name.toLowerCase().includes(term);
      const matchAddr = attr.address && attr.address.toLowerCase().includes(term);
      if (!matchName && !matchAddr) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Explorar Destinos, Atrações & Gastronomia
          </h1>
          <p className="text-sm text-slate-500">
            Catálogo permanente de passeios, restaurantes, museus, parques e lojas da família
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Atração / Restaurante</span>
        </button>
      </div>

      {/* Weather Forecast Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-sky-600 rounded-3xl p-6 text-white shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
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
                <p className="text-[10px] text-sky-100 truncate">{day.condition}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex-1 min-w-[220px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome ou endereço..."
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex overflow-x-auto gap-1.5 no-scrollbar">
          {[
            { id: '', label: 'Todas as Atrações' },
            { id: 'ponto_turistico', label: 'Pontos Turísticos' },
            { id: 'restaurante', label: 'Restaurantes' },
            { id: 'museu', label: 'Museus & Cultura' },
            { id: 'parque', label: 'Parques & Natureza' },
            { id: 'compras', label: 'Lojas & Compras' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setCategoryFilter(item.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                categoryFilter === item.id
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Attractions Grid */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 text-sm">Carregando catálogo...</div>
      ) : filteredAttractions.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-400">
          <Landmark className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <p className="font-semibold text-sm">Nenhum estabelecimento ou atração cadastrada</p>
          <p className="text-xs mt-1">Cadastre seus lugares favoritos, restaurantes e lojas para reutilizar nas viagens da família.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAttractions.map(attr => (
            <div
              key={attr.id}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-xs hover:border-brand-500/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
                    {attr.category}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {attr.price_range && (
                      <span className="text-xs font-mono font-bold text-slate-400">{attr.price_range}</span>
                    )}
                    {attr.is_favorite && (
                      <Heart className="w-4 h-4 text-rose-500 fill-current" />
                    )}
                  </div>
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
                      ({attr.reviews.length} {attr.reviews.length === 1 ? 'avaliação' : 'avaliações'})
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => setReviewingAttr(attr)}
                  className="text-xs font-bold text-brand-600 hover:underline"
                >
                  Avaliar
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setViewingAttr(attr)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                    title="Ver detalhes"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleStartEdit(attr)}
                    className="p-1 rounded-lg text-slate-400 hover:text-brand-600 transition-colors"
                    title="Editar atração"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingAttr(attr)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                    title="Excluir atração"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Cadastrar Atração / Restaurante */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              Cadastrar Atração, Restaurante ou Loja
            </h2>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nome do Estabelecimento / Ponto Turístico *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ex: Museu do Louvre / Restaurante Le Jardin"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs outline-none focus:ring-2 focus:ring-brand-500"
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
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="ponto_turistico">Ponto Turístico</option>
                    <option value="restaurante">Restaurante / Gastronomia</option>
                    <option value="museu">Museu / Cultural</option>
                    <option value="parque">Parque / Natureza</option>
                    <option value="compras">Loja / Compras</option>
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
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs outline-none focus:ring-2 focus:ring-brand-500"
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
                  placeholder="Rua, número, cidade ou link do mapa"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Telefone / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+55 11 99999-9999"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Website / Link
                  </label>
                  <input
                    type="url"
                    value={website}
                    onChange={e => setWebsite(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Descrição e Dicas Familiares
                </label>
                <textarea
                  rows={2}
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  placeholder="Ex: Melhor ir de manhã, prato recomendado é o risoto..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300 pt-1">
                <input
                  type="checkbox"
                  checked={isFavorite}
                  onChange={e => setIsFavorite(e.target.checked)}
                  className="rounded text-brand-600 focus:ring-brand-500"
                />
                <span>Favorito da família</span>
              </label>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Salvando...' : 'Salvar Atração'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Editar Atração */}
      {editingAttr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditingAttr(null)}
              className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              Editar Atração / Restaurante
            </h2>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nome do Estabelecimento *
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Categoria
                  </label>
                  <select
                    value={editCategory}
                    onChange={e => setEditCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="ponto_turistico">Ponto Turístico</option>
                    <option value="restaurante">Restaurante / Gastronomia</option>
                    <option value="museu">Museu / Cultural</option>
                    <option value="parque">Parque / Natureza</option>
                    <option value="compras">Loja / Compras</option>
                    <option value="outros">Outros</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Faixa de Preço
                  </label>
                  <select
                    value={editPriceRange}
                    onChange={e => setEditPriceRange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs outline-none focus:ring-2 focus:ring-brand-500"
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
                  Endereço
                </label>
                <input
                  type="text"
                  value={editAddress}
                  onChange={e => setEditAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Telefone
                  </label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={e => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Website
                  </label>
                  <input
                    type="url"
                    value={editWebsite}
                    onChange={e => setEditWebsite(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Descrição
                </label>
                <textarea
                  rows={2}
                  value={editDesc}
                  onChange={e => setEditDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300 pt-1">
                <input
                  type="checkbox"
                  checked={editIsFavorite}
                  onChange={e => setEditIsFavorite(e.target.checked)}
                  className="rounded text-brand-600 focus:ring-brand-500"
                />
                <span>Favorito da família</span>
              </label>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingAttr(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Detalhes da Atração */}
      {viewingAttr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setViewingAttr(null)}
              className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
              {viewingAttr.category}
            </span>

            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-2">
              {viewingAttr.name}
            </h2>

            {viewingAttr.address && (
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{viewingAttr.address}</span>
              </p>
            )}

            {viewingAttr.description && (
              <p className="mt-3 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                {viewingAttr.description}
              </p>
            )}

            {/* Avaliações */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                Avaliações da Família
              </h4>
              {viewingAttr.reviews && viewingAttr.reviews.length > 0 ? (
                <div className="space-y-2">
                  {viewingAttr.reviews.map(r => (
                    <div key={r.id} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 text-xs border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between text-amber-500 mb-1">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current" />
                          <span className="font-bold text-slate-800 dark:text-slate-200">{r.rating}/5</span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {new Date(r.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      {r.comment && <p className="text-slate-600 dark:text-slate-300">{r.comment}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">Nenhum comentário registrado ainda.</p>
              )}
            </div>

            <div className="mt-6 flex justify-between items-center">
              {viewingAttr.address ? (
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(viewingAttr.name + ' ' + viewingAttr.address)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-500"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Ver no Google Maps</span>
                </a>
              ) : <div />}

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const a = viewingAttr;
                    setViewingAttr(null);
                    setReviewingAttr(a);
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 transition-colors"
                >
                  Avaliar
                </button>
                <button
                  onClick={() => setViewingAttr(null)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Registrar Avaliação */}
      {reviewingAttr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl relative">
            <button
              onClick={() => setReviewingAttr(null)}
              className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Avaliar Experiência
            </h2>
            <p className="text-xs text-slate-500 mb-4">{reviewingAttr.name}</p>

            <form onSubmit={handleSaveReview} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Nota (1 a 5 Estrelas)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className={`p-1.5 rounded-lg transition-transform hover:scale-110 ${
                        reviewRating >= star ? 'text-amber-500' : 'text-slate-300 dark:text-slate-700'
                      }`}
                    >
                      <Star className="w-6 h-6 fill-current" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Comentário / Dica da Família
                </label>
                <textarea
                  rows={3}
                  value={reviewComment}
                  onChange={e => setReviewComment(e.target.value)}
                  placeholder="Conte o que achou, prato imperdível ou melhor horário..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setReviewingAttr(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Salvando...' : 'Salvar Avaliação'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Confirmar Exclusão de Atração */}
      {deletingAttr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Excluir Atração
            </h3>
            <p className="text-xs text-slate-500 mt-2">
              Deseja remover <span className="font-bold text-slate-800 dark:text-slate-200">"{deletingAttr.name}"</span> do catálogo da família? Esta ação não pode ser desfeita.
            </p>

            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => setDeletingAttr(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Excluindo...' : 'Sim, Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
