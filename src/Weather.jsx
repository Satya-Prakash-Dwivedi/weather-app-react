import React, { useEffect, useState } from 'react'
import {Search , Heart, HeartOff, MapPin, Wind, Droplets, Sun} from 'lucide-react'


// Replace with your API key from openweathermap

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY

const BASE_URL = 'https://api.openweathermap.org/data/2.5'


function Weather() {
    const [city, setCity] = useState('')
    const [currentWeather, setCurrentWeather] = useState(null)
    const [forecast, setForecast] = useState(null)
    const [favorites ,setFavorites] = useState(() => {
        const saved = localStorage.getItem('favoriteLocations');
        return saved ? JSON.parse(saved) : []
    });
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        localStorage.setItem('favoriteLocations', JSON.stringify(favorites));
    },[favorites]);

    const fetchWeatherData = async(searchCity) => {
        setLoading(true)
        setError(null)
        try {
            
            // Fetch current weather
            const currentResponse = await fetch(`${BASE_URL}/weather?q=${searchCity}&appid=${API_KEY}&units=metric`);
            
            if(!currentResponse.ok) throw new Error('city not found')
            const currentData = await
        currentResponse.json();

        // Fetch 5-day forecast
        const forecastResponse = await fetch(`${BASE_URL}/forecast?q=${searchCity}&appid=${API_KEY}&units=metric`);

        const forecastData = await forecastResponse.json();

        setCurrentWeather(currentData)
        setForecast(forecastData)
        setCity('');
        } catch (err) {
            setError('Failed to fetch weather data. Please check the city name and try again');
        }
        finally{
            setLoading(false)
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if(!city.trim()) return;
        fetchWeatherData(city);
    }

    const toggleFavorite = (cityName) => {
        if(favorites.includes(cityName)){
            setFavorites(favorites.filter(fav => fav != cityName));
        }
        else{
            setFavorites([...favorites, cityName]);
        }
    };

    const getForecastDays = () => {
        if(!forecast) return[];
        const dailyData = {};

        forecast.list.forEach(item => {
            const date = new Date(item.dt * 1000).toLocaleDateString();
            if(!dailyData[date]){
                dailyData[date] = item;
            }
        });

        return Object.values(dailyData).slice(0, 5);
    };

  return (
    <div className='max-w-4xl mx-auto p-6'>
        <h1 className='text-3xl font-bold mb-6 text-center text-gray-800'>Weather Dashboard</h1>

    {/* Search Form */}
    <form onSubmit={handleSearch} className='mb-6'>
        <div className='flex gap-2'>
            <input type="text" 
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder='Enter city name...'
            className='flex-1 px-4 py-2 border rounded-lg focus: outline-none focus:border-blue-500'
            />
            <button
            type='submit'
            className='px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none flex items-center gap-2'
            disabled={loading}
            >
                <Search size={20} />
                {loading ? 'Searching...' : 'Search'}
            </button>
        </div>
    </form>

    {/* Error Message */}
    {error && (
      <div   className="p-4 mb-6 bg-red-100 text-red-700 rounded-lg">{error}
      </div>
    )}

    {/* Favorites */}
    {favorites.length > 0 && (
        <div className='mb-6'>
            <h2 className='text-xl font-semibold mb-2'>Favorite Locations</h2>
            <div className='flex flex-wrap gap-2'>{
                favorites.map(fav => (
                    <button
                    key={fav}
                    onClick={() => fetchWeatherData(fav)}
                    className='px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center gap-2'
                    >
                         <MapPin size={16} />
                         {fav}
                    </button>
                ))
                }
            </div>
        </div>
    )}

    {/* Current Weather  */}
    {
        currentWeather && (
            <div className='mb-6 p-6 bg-white rounded-lg shadow-lg'>
                <div className='flex justify-between items-start'>
                    <div>
                        <h2 className='text-2xl font-bold mb-2'>
                            {currentWeather.name}, {currentWeather.country}
                        </h2>
                        <div className='text-4xl font-bold mb-4 '>
                            {Math.round(currentWeather.main.temp)}°C
                        </div>
                        <div className='text-gray-600'>
                            {currentWeather.weather[0].description}
                        </div>
                    </div>
                <button
                onClick={() => toggleFavorite
                    (currentWeather.name)
                }
                className='p-2 hover:bg-gray-100 rounded-full' 
                >
                    {favorites.includes(currentWeather.name) ? (
                        <Heart size={24} className='text-red-500 fill-current' />
                    ) : (
                        <HeartOff size={24} className='text-gray-400' />
                    )}
                </button>
                </div>

                <div className='mt-4 grid grid-cols-3 gap-4'>
                    <div className='flex items-center gap-2'>
                    <Wind size={20} className='text-gray-500' />
                    <span>{currentWeather.wind.speed} m/s</span>
                    </div>
                    <div className='flex items-center gap-2'>
                    <Droplets size={20} className='text-gray-500' />
                    <span>{currentWeather.main.humidity}%</span>
                    </div>
                    <div className='flex items-center gap-2'>
                        <Sun size={20} className='text-gray-500' />
                        <span>{Math.round(currentWeather.main.feels_like)}°C feels like</span>
                    </div>
                </div>
             </div>
        )}

        {/* 5-Day Forecast  */}
        {
            forecast && (
                <div>
                    <h2 className='text-xl font-semibold mb-4'>5-Day Forecast</h2>
                    <div className='grid grid-cols-1 md:grid-cols-5 gap-4'>
                    {getForecastDays().map((day) => (
                        <div
                        key={day.dt}
                        className='p-4 bg-white rounded-lg shadow-lg'>
                            <div className='text-sm text-gray-600 mb-2'>
                        {new Date(day.dt * 1000).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                        })}
                            </div>
                            <div className='text-2xl font-bold mb-2'>
                                {Math.round(day.main.temp)}°C
                            </div>
                            <div className='text-sm text-gray-600'>
                                {day.weather[0].description}
                            </div>
                        </div>
                    ))}
                    </div>
                </div>
            )}
    </div>
  );
};

export default Weather