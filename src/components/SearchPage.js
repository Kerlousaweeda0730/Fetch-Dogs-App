import React, { useState, useEffect, useCallback } from 'react';
import './SearchPage.css';

function MatchedDogModal({ dog, onClose }) {
  if (!dog) return null;

  return (
      <div className="modal-overlay">
          <div className="modal-content">
              <h3>Meet Your Match!</h3>
              <img src={dog.img} alt={dog.name} className="modal-dog-image" />
              <p><strong>Name:</strong> {dog.name}</p>
              <p><strong>Breed:</strong> {dog.breed}</p>
              <p><strong>Age:</strong> {dog.age}</p>
              <p><strong>Location:</strong> {dog.zip_code}</p>
              <button onClick={onClose}>Close</button>
          </div>
      </div>
  );
}

function SearchPage() {
  const [dogs, setDogs] = useState([]);
  const [error, setError] = useState(null);
  const [breedFilter, setBreedFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState('asc');
  const [dogsPerPage] = useState(25);
  const [favorites, setFavorites] = useState([]);
  const [breeds, setBreeds] = useState([]);
  const [selectedBreed, setSelectedBreed] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [matchedDog, setMatchedDog] = useState(null);

  const fetchDogIDs = useCallback(async () => {
    try {
      let queryParams = `?size=${dogsPerPage}&from=${(currentPage - 1) * dogsPerPage}`;
      queryParams += breedFilter ? `&breeds=${breedFilter}` : '';
      queryParams += `&sort=breed:${sortOrder}`;

      const response = await fetch(`https://frontend-take-home-service.fetch.com/dogs/search${queryParams}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      fetchDogDetails(data.resultIds);
    } catch (err) {
      setError(err.message);
    }
  }, [breedFilter, currentPage, sortOrder, dogsPerPage]);

  const fetchDogDetails = async (dogIds) => {
    try {
      const response = await fetch('https://frontend-take-home-service.fetch.com/dogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dogIds),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const dogsData = await response.json();
      setDogs(dogsData);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchBreeds = async () => {
    try {
      const response = await fetch('https://frontend-take-home-service.fetch.com/dogs/breeds', {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const breedsData = await response.json();
      setBreeds(breedsData);
    } catch (error) {
      setError(error.message);
    }
  };

  useEffect(() => {
    fetchDogIDs();
    fetchBreeds();
  }, [fetchDogIDs, breedFilter, currentPage, sortOrder, dogsPerPage]);

  const handleFavoriteToggle = (dogId) => {
    setFavorites(prevFavorites => {
      const newFavorites = prevFavorites.includes(dogId)
        ? prevFavorites.filter(id => id !== dogId)
        : [...prevFavorites, dogId];
      return newFavorites;
    });
  };

  const generateMatch = async () => {
    try {
        const response = await fetch('https://frontend-take-home-service.fetch.com/dogs/match', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(favorites),
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.status}`);
        }

        const matchData = await response.json();
        const matchedDogDetails = dogs.find(dog => dog.id === matchData.match);
        if (matchedDogDetails) {
            setMatchedDog(matchedDogDetails);
            setIsModalOpen(true);
        } else {
            setError('Matched dog not found in the current list');
        }
    } catch (err) {
        setError(err.message);
    }
  };

  function handleNextPage() {
    setCurrentPage(prevPage => prevPage + 1);
  }

  const handlePreviousPage = () => {
    setCurrentPage(prevPage => prevPage - 1);
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="search-page">
      <div className="logo-container">
        <img src="/fetch.png" alt="Fetch Logo" className="search-logo" />
      </div>
      <h1>Dog Search</h1>
      <div className="filter-sort-match">
        <div className="filter-sort">
          {/* Breed Dropdown */}
          <select 
            value={selectedBreed}
            onChange={(e) => setSelectedBreed(e.target.value)}
            className="breed-dropdown"
          >
            <option value="">All Breeds</option>
            {breeds.map((breed) => (
              <option key={breed} value={breed}>{breed}</option>
            ))}
          </select>
          {/* Apply Filter Button */}
          <button onClick={() => {
            setBreedFilter(selectedBreed); // Update the breed filter
            setCurrentPage(1); // Reset the page to the first one
            fetchDogIDs(); // Fetch the dogs again with the updated filter
          }}>Apply Filter</button>
          {/* Sorting Dropdown */}
          <select onChange={(e) => setSortOrder(e.target.value)} value={sortOrder}>
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
          {/* Find a Match Button */}
          <button className="match-button" onClick={generateMatch}>Find a Match</button>
        </div>
      </div>

      {isModalOpen && <MatchedDogModal dog={matchedDog} onClose={() => setIsModalOpen(false)} />}

      {/* Dog List */}
      <ul className="dog-list">
        {dogs.map((dog) => (
          <li key={dog.id} className="dog-card">
            <img src={dog.img} alt={dog.name} className="dog-image" />
            <div className="dog-details">
              <h3 className="dog-name">{dog.name}</h3>
              <p className="dog-breed">Breed: {dog.breed}</p>
              <p className="dog-age">Age: {dog.age}</p>
              <p className="dog-zip">Zip Code: {dog.zip_code}</p>
              <label className="dog-favorite">
                Favorite:
                <input
                  type="checkbox"
                  checked={favorites.includes(dog.id)}
                  onChange={() => handleFavoriteToggle(dog.id)}
                />
              </label>
            </div>
          </li>
        ))}
      </ul>
  
      {/* Pagination */}
      <div className="pagination">
        <button onClick={handlePreviousPage} disabled={currentPage === 1}>Previous</button>
        <span className="page-number">Page {currentPage}</span>
        <button onClick={handleNextPage}>Next</button>
      </div>  
    </div>
  );
}

export default SearchPage;
