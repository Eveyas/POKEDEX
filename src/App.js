import React, { useState, useEffect } from 'react';
import './App.css';
import PokemonCard from './components/PokemonCard';
import PokemonModal from './components/PokemonModal';
import SearchBar from './components/SearchBar';

function App() {
  const [pokemons, setPokemons] = useState([]);
  const [filteredPokemons, setFilteredPokemons] = useState([]);
  const [allPokemons, setAllPokemons] = useState([]);
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchMode, setSearchMode] = useState(false);

  const [notificationPermission, setNotificationPermission] = useState('default');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const pokemonsPerPage = 20;

  // Efecto para carga inicial
  useEffect(() => {
    const initializeApp = async () => {
      await checkNotificationPermission();
      await fetchAllPokemons();
      await fetchPokemons();
    };
    initializeApp();
  }, []);

  // Efecto para cambios de página
  useEffect(() => {
    if (currentPage > 1) {
      fetchPokemons();
    }
  }, [currentPage]);

  // Verificar permisos y preferencias
  const checkNotificationPermission = async () => {
    if (!('Notification' in window)) return;

    const savedPreference = localStorage.getItem('pokedex-notifications-enabled');
    const permission = Notification.permission;
    
    setNotificationPermission(permission);
    
    if (savedPreference !== null) {
      setNotificationsEnabled(JSON.parse(savedPreference));
    } else if (permission === 'granted') {
      setNotificationsEnabled(true);
      localStorage.setItem('pokedex-notifications-enabled', 'true');
    }
  };

  // Función para permisos
  const handleNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('Este navegador no soporta notificaciones push');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      return permission === 'granted';
    } catch (error) {
      console.error('Error al solicitar permiso:', error);
      return false;
    }
  };

  // Estado de notificaciones
  const toggleNotifications = async () => {
    if (notificationsEnabled) {
      // Desactivar notificaciones
      setNotificationsEnabled(false);
      localStorage.setItem('pokedex-notifications-enabled', 'false');
      showNotification(
        'Notificaciones desactivadas', 
        'Ya no recibirás alertas del Pokémon consultado 🦖'
      );
    } else {
      // Activar notificaciones
      if (notificationPermission === 'granted') {
        setNotificationsEnabled(true);
        localStorage.setItem('pokedex-notifications-enabled', 'true');
        showNotification(
          '¡Notificaciones activadas!', 
          'Ahora recibirás notificaciones de los Pokémon consultados 🦕'
        );
      } else if (notificationPermission === 'default') {
        const granted = await handleNotificationPermission();
        if (granted) {
          setNotificationsEnabled(true);
          localStorage.setItem('pokedex-notifications-enabled', 'true');
        }
      } else {
        alert('⚠️ Las notificaciones están bloqueadas. Debes permitirlas en la configuración de tu navegador');
      }
    }
  };

  // Mostrar notificación
  const showNotification = (title, message, pokemonData = null) => {
    // Verificar condiciones
    if (!notificationsEnabled || notificationPermission !== 'granted') return;

    const notificationOptions = {
      body: message,
      icon: pokemonData?.sprites?.other?.['official-artwork']?.front_default || 
            pokemonData?.sprites?.front_default || '/logo192.png',
      badge: '/logo192.png'
    };

    // Usar Service Worker
    if (navigator.serviceWorker?.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SHOW_POKEMON_NOTIFICATION',
        title,
        message,
        pokemon: pokemonData
      });
    } else {
      // Fallback directo
      new Notification(title, notificationOptions);
    }
  };

  // Cargar todos los Pokémon para búsqueda
  const fetchAllPokemons = async () => {
    try {
      const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=10000');
      const data = await response.json();
      setAllPokemons(data.results);
    } catch (error) {
      console.error('Error fetching all Pokémon:', error);
    }
  };

  // Cargar Pokémon por página
  const fetchPokemons = async () => {
    try {
      setLoading(true);
      const offset = (currentPage - 1) * pokemonsPerPage;
      const response = await fetch(
        `https://pokeapi.co/api/v2/pokemon?limit=${pokemonsPerPage}&offset=${offset}`
      );
      const data = await response.json();
      
      const pokemonDetails = await Promise.all(
        data.results.map(async (pokemon) => {
          const pokemonResponse = await fetch(pokemon.url);
          return await pokemonResponse.json();
        })
      );
      
      setPokemons(pokemonDetails);
      setFilteredPokemons(pokemonDetails);
      setTotalPages(Math.ceil(data.count / pokemonsPerPage));
    } catch (error) {
      console.error('Error fetching Pokémon:', error);
    } finally {
      setLoading(false);
    }
  };

  // Buscar Pokémon
  const searchPokemon = async (searchTerm) => {
    if (!searchTerm.trim()) {
      setSearchMode(false);
      setFilteredPokemons(pokemons);
      return;
    }

    setSearchLoading(true);
    setSearchMode(true);

    try {
      const localResults = allPokemons.filter(pokemon => 
        pokemon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pokemon.url.includes(`/${searchTerm.toLowerCase()}/`)
      );

      if (localResults.length > 0) {
        const pokemonDetails = await Promise.all(
          localResults.slice(0, 20).map(async (pokemon) => {
            try {
              const response = await fetch(pokemon.url);
              return await response.json();
            } catch {
              return null;
            }
          })
        );

        const validResults = pokemonDetails.filter(pokemon => pokemon !== null);
        setFilteredPokemons(validResults);
        
        if (validResults.length > 0) {
          showNotification(
            '¡Búsqueda exitosa!', 
            `Encontrados ${validResults.length} Pokémon`,
            validResults[0]
          );
        }
      } else {
        await searchPokemonDirectly(searchTerm);
      }
    } catch (error) {
      console.error('Error in search:', error);
      setFilteredPokemons([]);
      showNotification('Error en búsqueda', 'Intenta con otro nombre o número');
    } finally {
      setSearchLoading(false);
    }
  };

  // Búsqueda en la API
  const searchPokemonDirectly = async (searchTerm) => {
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${searchTerm.toLowerCase()}`);
      if (response.ok) {
        const pokemonData = await response.json();
        setFilteredPokemons([pokemonData]);
        showNotification(
          '¡Pokémon encontrado!', 
          `Has encontrado a ${pokemonData.name}`,
          pokemonData
        );
      } else {
        setFilteredPokemons([]);
        showNotification('Búsqueda sin resultados', 'No se encontró el Pokémon buscado');
      }
    } catch (error) {
      setFilteredPokemons([]);
      showNotification('Error en búsqueda', 'Intenta con otro nombre o número');
    }
  };

  // Manejo de eventos
  const handleSearch = (searchTerm) => {
    if (searchTerm === '') {
      setSearchMode(false);
      setFilteredPokemons(pokemons);
    } else {
      searchPokemon(searchTerm);
    }
  };

  const handlePokemonClick = (pokemon) => {
    setSelectedPokemon(pokemon);
    setIsModalOpen(true);
    showNotification(
      `¡${pokemon.name} consultado!`, 
      `Consultaste la ficha de ${pokemon.name}`,
      pokemon
    );
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPokemon(null);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
      setSearchMode(false);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      setSearchMode(false);
      window.scrollTo(0, 0);
    }
  };

  const clearSearch = () => {
    setSearchMode(false);
    setFilteredPokemons(pokemons);
  };

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">
            <span className="pokeball-icon">◓</span>
            Mundo Pokémon 🐉
          </h1>
        </div>
      </header>

      <main className="main-content">
        <div className="search-container">
          <SearchBar onSearch={handleSearch} />
          
          <div className="notification-controls">
            <button 
              onClick={toggleNotifications}
              className={`notification-toggle ${notificationsEnabled ? 'active' : ''}`}
              title={notificationsEnabled ? 'Desactivar notificaciones' : 'Activar notificaciones'}
            >
              <span className="notification-icon">
                {notificationsEnabled ? '🔔' : '🔕'}
              </span>
              <span className="notification-text">
                {notificationsEnabled ? 'Notificaciones activadas' : 'Notificaciones desactivadas'}
              </span>
            </button>

            {notificationPermission === 'denied' && (
              <div className="notification-warning">
                ⚠️ Notificaciones bloqueadas en el navegador
              </div>
            )}
          </div>
        </div>
        
        {searchMode && (
          <div className="search-info">
            <span>Resultados</span>
            <button onClick={clearSearch} className="clear-search-btn">
              Volver al Inicio
            </button>
          </div>
        )}

        {loading || searchLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>{searchLoading ? 'Buscando Pokémon...' : 'Cargando Pokémon...'}</p>
          </div>
        ) : (
          <>
            <div className="pokemon-grid">
              {filteredPokemons.map(pokemon => (
                <PokemonCard
                  key={pokemon.id}
                  pokemon={pokemon}
                  onClick={() => handlePokemonClick(pokemon)}
                />
              ))}
            </div>
            
            {filteredPokemons.length === 0 && !loading && (
              <div className="no-results">
                <p>No se encontraron coicidencias</p>
                <p>Intenta con otro nombre o número de Pokémon 🐢</p>
              </div>
            )}

            {!searchMode && (
              <div className="pagination">
                <button 
                  onClick={handlePrevPage} 
                  disabled={currentPage === 1}
                  className="pagination-btn"
                >
                  Anterior
                </button>
                <span className="page-info">
                  Página {currentPage} de {totalPages}
                </span>
                <button 
                  onClick={handleNextPage} 
                  disabled={currentPage === totalPages}
                  className="pagination-btn"
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {isModalOpen && (
        <PokemonModal
          pokemon={selectedPokemon}
          onClose={closeModal}
        />
      )}

      <footer className="app-footer">
        <p>&copy; 2025. Laines Cupul Evelin Yasmin</p>
        <p>Todos Los Derechos Reservados</p>
      </footer>
    </div>
  );
}

export default App;
