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
  const pokemonsPerPage = 20;

  // Cargar todos los Pokémon
  useEffect(() => {
    fetchAllPokemons();
    fetchPokemons();
  }, [currentPage]);

  // Función para cargar todos los Pokémon (Búsqueda)
  const fetchAllPokemons = async () => {
    try {
      const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=10000');
      const data = await response.json();
      setAllPokemons(data.results);
    } catch (error) {
      console.error('Error fetching all Pokémon:', error);
    }
  };

  // Función para buscar un Pokémon específico por nombre o ID
  const searchPokemon = async (searchTerm) => {
    if (!searchTerm.trim()) {
      setSearchMode(false);
      setFilteredPokemons(pokemons);
      return;
    }
    setSearchLoading(true);
    setSearchMode(true);

    try {
      // Búsqueda en la lista local
      const localResults = allPokemons.filter(pokemon => 
        pokemon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pokemon.url.includes(`/${searchTerm.toLowerCase()}/`)
      );

      if (localResults.length > 0) {
        // Obtener detalles de los Pokémon encontrados localmente
        const pokemonDetails = await Promise.all(
          localResults.slice(0, 20).map(async (pokemon) => {
            try {
              const response = await fetch(pokemon.url);
              return await response.json();
            } catch (error) {
              console.error('Error fetching Pokémon details:', error);
              return null;
            }
          })
        );

        const validResults = pokemonDetails.filter(pokemon => pokemon !== null);
        setFilteredPokemons(validResults);
      } else {
        // Buscar directamente de la API
        try {
          const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${searchTerm.toLowerCase()}`);
          if (response.ok) {
            const pokemonData = await response.json();
            setFilteredPokemons([pokemonData]);
          } else {
            setFilteredPokemons([]);
          }
        } catch (error) {
          console.error('Error searching Pokémon:', error);
          setFilteredPokemons([]);
        }
      }
    } catch (error) {
      console.error('Error in search:', error);
      setFilteredPokemons([]);
    } finally {
      setSearchLoading(false);
    }
  };

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
      setLoading(false);
    } catch (error) {
      console.error('Error fetching Pokémon:', error);
      setLoading(false);
    }
  };

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
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPokemon(null);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      setSearchMode(false);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
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
        <SearchBar onSearch={handleSearch} />
        
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
                <p>No se encontraron Pokémon que coincidan con tu búsqueda.</p>
                <p>Intenta con otro nombre o número de Pokémon.</p>
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
        <p>
            &copy; 2025. Laines Cupul Evelin Yasmin
            </p>
          <p>Todos Los Derechos Reservados</p>
      </footer>
    </div>
  );
}

export default App;