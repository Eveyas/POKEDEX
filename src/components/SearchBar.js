import React, { useState, useEffect, useRef } from 'react';
import '../styles/SearchBar.css';

const SearchBar = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);

  // Lista de sugerencias
  const popularPokemon = [
    'pikachu', 'charizard', 'bulbasaur', 'squirtle', 'charmander',
    'eevee', 'mewtwo', 'lucario', 'gengar', 'dragonite',
    'snorlax', 'gyarados', 'arcanine', 'umbreon', 'tyranitar'
  ];

  useEffect(() => {
    if (searchTerm.length > 1) {
      const filtered = popularPokemon.filter(pokemon =>
        pokemon.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchTerm]);

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
    setShowSuggestions(false);
    inputRef.current.blur();
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion);
    onSearch(suggestion);
    setShowSuggestions(false);
  };

  const clearSearch = () => {
    setSearchTerm('');
    onSearch('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleBlur = () => {
    // Delay para las sugerencias
    setTimeout(() => setShowSuggestions(false), 200);
  };

  return (
    <div className="search-bar-container">
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-wrapper">
          <input
            ref={inputRef}
            type="text"
            placeholder="Buscar por nombre o número..."
            value={searchTerm}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={() => searchTerm.length > 1 && setShowSuggestions(true)}
            className="search-input"
          />
          {searchTerm && (
            <button type="button" className="clear-button" onClick={clearSearch}> ×
            </button>
          )}
          <button type="submit" className="search-button"> 🔍
          </button>
        </div>
        
        {showSuggestions && suggestions.length > 0 && (
          <div className="suggestions-dropdown">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="suggestion-item"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </form>
    </div>
  );
};

export default SearchBar;