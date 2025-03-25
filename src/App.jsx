import { useEffect, useState } from 'react';

function App() {
  const [photo, setPhoto] = useState([]);
  const [name1, setName1] = useState('');
  const [name2, setName2] = useState('');
  const [pokemon1, setPokemon1] = useState(null);
  const [pokemon2, setPokemon2] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [battleLog, setBattleLog] = useState([]);
  const [searchSuggestions1, setSearchSuggestions1] = useState([]);
  const [searchSuggestions2, setSearchSuggestions2] = useState([]);


  // Fetch Pokémon list on load
  useEffect(() => {
    fetch('https://pokeapi.co/api/v2/pokemon?limit=500')
      .then((res) => res.json())
      .then((data) => {
        const pokemonList = data.results.map((pokemon, index) => ({
          id: index + 1,
          name: pokemon.name,
          url: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${index + 1}.png`,
        }));
        setPhoto(pokemonList);
      });
  }, []);

  // Cycle through Pokémon images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 12) % photo.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [photo]);

  // Fetch Pokémon details
  const fetchPokemonDetails = () => {
    setLoading(true);
    Promise.all([
      fetch(`https://pokeapi.co/api/v2/pokemon/${name1.toLowerCase()}`).then((res) => res.json()),
      fetch(`https://pokeapi.co/api/v2/pokemon/${name2.toLowerCase()}`).then((res) => res.json()),
    ])
      .then(([data1, data2]) => {
        setPokemon1(data1);
        setPokemon2(data2);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  // Type comparison logic
  const compareTypes = (types1, types2) => {
    const effectiveTypes = {
      fire: ['grass', 'bug', 'ice', 'steel'],
      water: ['fire', 'ground', 'rock'],
      grass: ['water', 'rock', 'ground'],
      // Add more types as needed...
    };
    let advantage = '';
    types1.forEach((type1) => {
      types2.forEach((type2) => {
        if (effectiveTypes[type1]?.includes(type2)) {
          advantage += `${type1.toUpperCase()} has an advantage over ${type2.toUpperCase()}!\n`;
        }
      });
    });
    return advantage || 'No type advantage.';
  };

  // Simulate battle between two Pokémon
  const simulateBattle = () => {
    let p1 = { ...pokemon1, hp: 100 };
    let p2 = { ...pokemon2, hp: 100 };
    let log = [];
    let turn = 1;

    while (p1.hp > 0 && p2.hp > 0) {
      log.push(`Turn ${turn}:`);
      const damage1 = Math.max(0, p1.stats[1].base_stat - p2.stats[2].base_stat);
      p2.hp = Math.max(0, p2.hp - damage1);
      log.push(`${p1.name} dealt ${damage1} damage to ${p2.name} (${p2.hp} HP left)`);

      if (p2.hp <= 0) break;

      const damage2 = Math.max(0, p2.stats[1].base_stat - p1.stats[2].base_stat);
      p1.hp = Math.max(0, p1.hp - damage2);
      log.push(`${p2.name} dealt ${damage2} damage to ${p1.name} (${p1.hp} HP left)`);

      if (p1.hp <= 0) break;

      turn++;
    }
    setBattleLog(log);
  };

  // Add Pokémon to favorites

  // Handle search suggestions
  const handleInputChange = (e, setName, setSuggestions) => {
    const query = e.target.value.toLowerCase();
    setName(query);
    if (query.length > 0) {
      const suggestions = photo.filter((p) => p.name.startsWith(query)).map((p) => p.name);
      setSuggestions(suggestions);
    } else {
      setSuggestions([]);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (name, setName, setSuggestions) => {
    setName(name);
    setSuggestions([]);
  };

  // Generate stat bar
  const generateStatBar = (stat1, stat2) => (
    <div className="flex justify-between items-center space-x-4">
      <div className="flex flex-col items-center">
        <span>{stat1}</span>
        <div className="bg-gray-300 rounded-full w-24 h-2">
          <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${stat1 / 2}%` }} />
        </div>
      </div>
      <div className="flex flex-col items-center">
        <span>{stat2}</span>
        <div className="bg-gray-300 rounded-full w-24 h-2">
          <div className="bg-red-600 h-2 rounded-full" style={{ width: `${stat2 / 2}%` }} />
        </div>
      </div>
    </div>
  );

  // Front page Pokémon list
  const currentPokemonView = photo.slice(currentIndex, currentIndex + 12).map((pokemon) => (
    <div key={pokemon.id} className="p-4 border border-gray-300 rounded hover:scale-105 transition-transform">
      <img src={pokemon.url} alt={pokemon.name} width={100} />
      <h3 className="text-lg font-bold">{pokemon.name}</h3>
      {/* <button onClick={() => addFavoritePokemon(pokemon)} className="text-xs text-blue-500">Add to Favorites</button> */}
    </div>
  ));

  return (
    <div className="flex flex-col items-center space-y-4 p-4 bg-gradient-to-r from-green-400 to-blue-500 min-h-screen">
      <h1 className='text-4xl font-bold text-white p-6'>Pokémon Comparison</h1>

      {/* Input Fields */}
      <div className="flex space-x-4 relative">
        <div>
          <input
            type="text"
            placeholder="Enter first Pokémon name"
            className="border border-gray-400 rounded p-2"
            value={name1}
            onChange={(e) => handleInputChange(e, setName1, setSearchSuggestions1)}
          />
          {searchSuggestions1.length > 0 && (
            <ul className="absolute bg-white rounded shadow-md p-2 w-full z-10">
              {searchSuggestions1.map((suggestion, idx) => (
                <li
                  key={idx}
                  onClick={() => handleSuggestionClick(suggestion, setName1, setSearchSuggestions1)}
                  className="cursor-pointer hover:bg-gray-200 p-1"
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <input
            type="text"
            placeholder="Enter second Pokémon name"
            className="border border-gray-400 rounded p-2"
            value={name2}
            onChange={(e) => handleInputChange(e, setName2, setSearchSuggestions2)}
          />
          {searchSuggestions2.length > 0 && (
            <ul className="absolute bg-white rounded shadow-md p-2 w-full z-10">
              {searchSuggestions2.map((suggestion, idx) => (
                <li
                  key={idx}
                  onClick={() => handleSuggestionClick(suggestion, setName2, setSearchSuggestions2)}
                  className="cursor-pointer hover:bg-gray-200 p-1"
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Compare Button */}
      <button
        onClick={fetchPokemonDetails}
        className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded"
      >
        {loading ? 'Comparing...' : 'Compare Pokémon'}
      </button>

      {/* Pokémon Stats Comparison */}
      {pokemon1 && pokemon2 && (
        <div className="flex justify-center mt-8">
        <div className="flex flex-col md:flex-row space-x-4 bg-gray-400 rounded-lg p-4 shadow-2xl w-full max-w-4xl mx-auto">
          <div className="flex flex-col items-center space-y-2 w-80">
            <img src={pokemon1.sprites.front_default} alt={pokemon1.name} width={100} />
            <h3 className="text-2xl font-bold">{pokemon1.name}</h3>
            <p><strong>Weight:</strong> {pokemon1.weight}</p>
            <p><strong>Height:</strong> {pokemon1.height}</p>
            <p><strong>Abilities:</strong> {pokemon1.abilities.map(a => a.ability.name).join(', ')}</p>
            <h4 className="mt-4">Base Stats</h4>
            {generateStatBar(pokemon1.stats[0].base_stat, pokemon2.stats[0].base_stat)}
            {generateStatBar(pokemon1.stats[1].base_stat, pokemon2.stats[1].base_stat)}
            {generateStatBar(pokemon1.stats[2].base_stat, pokemon2.stats[2].base_stat)}
          </div>
          <div className="flex flex-col items-center space-y-2 w-80">
            <img src={pokemon2.sprites.front_default} alt={pokemon2.name} width={100} />
            <h3 className="text-2xl font-bold">{pokemon2.name}</h3>
            <p><strong>Weight:</strong> {pokemon2.weight}</p>
            <p><strong>Height:</strong> {pokemon2.height}</p>
            <p><strong>Abilities:</strong> {pokemon2.abilities.map(a => a.ability.name).join(', ')}</p>
            <h4 className="mt-4">Base Stats</h4>
            {generateStatBar(pokemon2.stats[0].base_stat, pokemon1.stats[0].base_stat)}
            {generateStatBar(pokemon2.stats[1].base_stat, pokemon1.stats[1].base_stat)}
            {generateStatBar(pokemon2.stats[2].base_stat, pokemon1.stats[2].base_stat)}
          </div>
        </div>
      </div>
    
      )}

      {/* Battle Simulation */}
      {pokemon1 && pokemon2 && (
        <>
          <button
            onClick={simulateBattle}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded mt-4"
          >
            Simulate Battle
          </button>

          {battleLog.length > 0 && (
            <div className="bg-gray-700 p-4 rounded mt-4 text-white">
              <h4 className="text-xl font-bold">Battle Log</h4>
              <ul>
                {battleLog.map((log, idx) => (
                  <li key={idx}>{log}</li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      

      {/* Display Pokémon List */}
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-4">
        {currentPokemonView}
      </div>
    </div>
  );
}

export default App;
