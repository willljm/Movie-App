import React, { useEffect, useState } from 'react'
import { Carrusel } from './carrusel'

export const PopularsMovie = () => {
    const [Movies, setMovies] = useState([])
    const [pages, setPages] = useState(1)
    const [totalPages, setTotalpages] = useState()
    const [filter, setFilter] = useState("")
    const [selectedMovie, setSelectedMovie] = useState(null)
    const [actors, setActors] = useState([])
    const [trailerKey, setTrailerKey] = useState(null)
    const [showTrailer, setShowTrailer] = useState(false)
    const [carouselMovies, setCarouselMovies] = useState([])
    const [searchTerm, setSearchTerm] = useState("")
    const [mediaType, setMediaType] = useState('movie'); // 'movie' o 'tv'
    const [favorites, setFavorites] = useState([]); // Para la lista de favoritos
    const [showFavorites, setShowFavorites] = useState(false); // Para mostrar la página de favoritos
    const [showNews, setShowNews] = useState(false); // Para la sección de novedades
    
    useEffect(() => {
        const savedFavorites = localStorage.getItem('favorites');
        if (savedFavorites) {
            setFavorites(JSON.parse(savedFavorites));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('favorites', JSON.stringify(favorites));
    }, [favorites]);

    useEffect(() => {
        GetMovies()
    }, [pages, filter, searchTerm, mediaType, showNews])

    const GetMovies = async () => {
        try {
            let url;
            if (searchTerm) {
                url = `https://api.themoviedb.org/3/search/${mediaType}?api_key=d0c9f48906c0503c033778bb3aa582a1&query=${searchTerm}&page=${pages}`;
            } else if (showNews) {
                const endpoint = mediaType === 'tv' ? 'on_the_air' : 'upcoming';
                url = `https://api.themoviedb.org/3/${mediaType}/${endpoint}?api_key=d0c9f48906c0503c033778bb3aa582a1&page=${pages}`;
            } else {
                url = `https://api.themoviedb.org/3/${mediaType}/popular?api_key=d0c9f48906c0503c033778bb3aa582a1&page=${pages}&with_genres=${filter}`;
            }
            
            const peticion = await fetch(url);
            const data = await peticion.json();
            const formattedResults = data.results.map(item => ({
                ...item,
                title: mediaType === 'tv' ? item.name : item.title,
                release_date: mediaType === 'tv' ? item.first_air_date : item.release_date,
                media_type: mediaType
            }));
            
            setMovies(formattedResults);
            setTotalpages(data.total_pages);
        } catch (error) {
            console.error("Error al obtener contenido:", error);
        }
    }

    const GetCarouselMovies = async () => {
        try {
            const url = `https://api.themoviedb.org/3/movie/popular?api_key=d0c9f48906c0503c033778bb3aa582a1&page=1`
            const peticion = await fetch(url)
            const data = await peticion.json()
            setCarouselMovies(data.results)
        } catch (error) {
            console.error("Error al obtener películas para el carrusel:", error)
        }
    }

    const getActors = async (movieId) => {
        try {
            const response = await fetch(
                `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=d0c9f48906c0503c033778bb3aa582a1`
            )
            const data = await response.json()
            setActors(data.cast.slice(0, 5))
        } catch (error) {
            console.error("Error al obtener actores:", error)
        }
    }

    const getTrailer = async (movieId) => {
        try {
            const response = await fetch(
                `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=d0c9f48906c0503c033778bb3aa582a1`
            )
            const data = await response.json()
            const trailer = data.results.find(
                (video) => video.type === "Trailer" && video.site === "YouTube"
            )
            if (trailer) {
                setTrailerKey(trailer.key)
            }
        } catch (error) {
            console.error("Error al obtener el trailer:", error)
        }
    }

    useEffect(() => {
        GetCarouselMovies()
    }, [])

    useEffect(() => {
        if (selectedMovie) {
            getActors(selectedMovie.id)
            getTrailer(selectedMovie.id)
        }
    }, [selectedMovie])

    const previewPage = () => {
        if (pages > 1) {
            setPages(pages - 1)
        }
    }
    
    const nextPage = () => {
        if (pages < totalPages) {
            setPages(pages + 1)
        }
    }

    const cambiarGenero = (Id) => {
        setFilter(Id); 
    }

    // Función para manejar favoritos
    const toggleFavorite = (item) => {
        setFavorites(prev => {
            const exists = prev.find(fav => fav.id === item.id);
            if (exists) {
                return prev.filter(fav => fav.id !== item.id);
            } else {
                return [...prev, item];
            }
        });
    }

    return (
        <div className="bg-black min-h-screen">
            <nav className="fixed w-full z-50 bg-black/30 backdrop-blur-md border-b border-gray-800/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        <div className="flex items-center">
                            <div className="text-purple-600 font-bold text-4xl tracking-wider hover:text-purple-500 transition-colors duration-300">
                                MovieApp
                            </div>
                        </div>

                        <div className="hidden md:block">
                            <div className="ml-10 flex items-center space-x-8">
                                <a
                                    onClick={() => {
                                        setShowFavorites(false);
                                        setShowNews(false);
                                        setMediaType('movie');
                                        setFilter("");
                                        setSearchTerm("");
                                        setPages(1);
                                    }}
                                    className="cursor-pointer text-gray-300 hover:text-white hover:bg-white/10 px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 outline-none"
                                >
                                    Películas
                                </a>
                                <a
                                    onClick={() => {
                                        setShowFavorites(false);
                                        setShowNews(false);
                                        setMediaType('tv');
                                        setFilter("");
                                        setSearchTerm("");
                                        setPages(1);
                                    }}
                                    className="cursor-pointer text-gray-300 hover:text-white hover:bg-white/10 px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 outline-none"
                                >
                                    Series
                                </a>
                                <a
                                    onClick={() => {
                                        setShowFavorites(false);
                                        setShowNews(true);
                                    }}
                                    className="cursor-pointer text-gray-300 hover:text-white hover:bg-white/10 px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 outline-none"
                                >
                                    Novedades
                                </a>
                                <a
                                    onClick={() => {
                                        setShowFavorites(true);
                                        setShowNews(false);
                                    }}
                                    className="cursor-pointer text-gray-300 hover:text-white hover:bg-white/10 px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 outline-none"
                                >
                                    Mi Lista
                                </a>
                            </div>
                        </div>

                        <div className="flex items-center space-x-6">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Buscar..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-gray-800/90 text-white pl-10 pr-4 py-2 rounded-full w-64
                                            placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600
                                            transition-all duration-300"
                                />
                                <svg className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <button className="text-gray-300 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all duration-300">
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                            </button>
                            <div className="relative group">
                                <img 
                                    className="h-10 w-10 rounded-full cursor-pointer ring-2 ring-purple-500/50 hover:ring-purple-500 transition-all duration-300"
                                    src="https://i.pravatar.cc/100" 
                                    alt="Perfil"
                                />
                                <div className="absolute right-0 w-2 h-2 bg-green-500 rounded-full bottom-0 border-2 border-black"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <Carrusel mandandoPeliculas={carouselMovies}/>
            <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
                <div className="mt-6 flex flex-wrap gap-3">
                    <button className='bg-gray-800 hover:bg-purple-600 text-white px-4 py-2 rounded-full transition-colors' 
                            onClick={() => cambiarGenero(28)}>
                        Acción
                    </button>
                    <button className='bg-gray-800 hover:bg-purple-600 text-white px-4 py-2 rounded-full transition-colors' 
                            onClick={() => cambiarGenero(27)}>
                        Terror
                    </button>
                    <button className='bg-gray-800 hover:bg-purple-600 text-white px-4 py-2 rounded-full transition-colors' 
                            onClick={() => cambiarGenero(35)}>
                        Comedia
                    </button>
                    <button className='bg-gray-800 hover:bg-purple-600 text-white px-4 py-2 rounded-full transition-colors' 
                            onClick={() => cambiarGenero(878)}>
                        Ciencia Ficción
                    </button>
                    <button className='bg-gray-800 hover:bg-purple-600 text-white px-4 py-2 rounded-full transition-colors' 
                            onClick={() => cambiarGenero(18)}>
                        Drama
                    </button>
                    <button className='bg-gray-800 hover:bg-purple-600 text-white px-4 py-2 rounded-full transition-colors' 
                            onClick={() => cambiarGenero(10752)}>
                        Guerra
                    </button>
                    <button className='bg-gray-800 hover:bg-purple-600 text-white px-4 py-2 rounded-full transition-colors' 
                            onClick={() => cambiarGenero(99)}>
                        Documental
                    </button>
                    <button className='bg-gray-800 hover:bg-purple-600 text-white px-4 py-2 rounded-full transition-colors' 
                            onClick={() => cambiarGenero(53)}>
                        Suspenso
                    </button>
                    <button className='bg-gray-800 hover:bg-purple-600 text-white px-4 py-2 rounded-full transition-colors' 
                            onClick={() => cambiarGenero(99)}>
                        Documental
                    </button>
                </div>
    
                <div className="mt-8 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
                    {(showFavorites ? favorites : Movies).map((item) => (
                        <div 
                            key={item.id} 
                            className="group relative transition-transform hover:scale-105 cursor-pointer"
                            onClick={() => setSelectedMovie(item)}
                        >
                            <div className="overflow-hidden rounded-lg">
                                <img
                                    alt={item.title}
                                    src={`https://image.tmdb.org/t/p/w500/` + item.poster_path}
                                    className="w-full h-[400px] object-cover transition-transform duration-300 group-hover:opacity-75"
                                />
                            </div>
                            <div className="mt-4 space-y-2">
                                <h1 className="text-xl font-semibold text-white">
                                    {item.title}
                                </h1>
                                <p className="text-sm text-gray-400 line-clamp-2">{item.overview}</p>
                                <p className="text-sm text-purple-400">{item.release_date}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Trailer por encima del modal */}
            {trailerKey && showTrailer && (
                <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-[60]">
                    <div className="relative w-full max-w-6xl">
                        <button 
                            className="absolute -top-10 right-0 text-gray-400 hover:text-white"
                            onClick={() => setShowTrailer(false)}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <div className="w-full aspect-video">
                            <iframe
                                className="w-full h-full rounded-lg"
                                src={`https://www.youtube.com/embed/${trailerKey}`}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Mejorado */}
            {selectedMovie && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-900 rounded-lg max-w-6xl w-full p-8 relative">
                        <button 
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                            onClick={() => {
                                setSelectedMovie(null)
                                setTrailerKey(null)
                                setActors([])
                                setShowTrailer(false)
                            }}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        
                        <div className="flex flex-col gap-8">
                            <div className="flex flex-col md:flex-row gap-8">
                                <div className="flex flex-col gap-4">
                                    <img
                                        src={`https://image.tmdb.org/t/p/w500/${selectedMovie.poster_path}`}
                                        alt={selectedMovie.title}
                                        className="w-full md:w-72 h-[450px] object-cover rounded-lg"
                                    />
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleFavorite(selectedMovie);
                                        }}
                                        className="flex items-center justify-center gap-2 w-full bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg transition-colors duration-300"
                                    >
                                        <svg 
                                            className="w-5 h-5" 
                                            fill={favorites.some(fav => fav.id === selectedMovie.id) ? "currentColor" : "none"} 
                                            stroke="currentColor" 
                                            viewBox="0 0 24 24"
                                        >
                                            <path 
                                                strokeLinecap="round" 
                                                strokeLinejoin="round" 
                                                strokeWidth="2" 
                                                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" 
                                            />
                                        </svg>
                                        {favorites.some(fav => fav.id === selectedMovie.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                                    </button>
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowTrailer(true);
                                        }}
                                        className="flex items-center justify-center gap-2 w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg transition-colors duration-300"
                                    >
                                        <svg 
                                            className="w-5 h-5" 
                                            fill="none" 
                                            stroke="currentColor" 
                                            viewBox="0 0 24 24"
                                        >
                                            <path 
                                                strokeLinecap="round" 
                                                strokeLinejoin="round" 
                                                strokeWidth="2" 
                                                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                                            />
                                            <path 
                                                strokeLinecap="round" 
                                                strokeLinejoin="round" 
                                                strokeWidth="2" 
                                                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                        Ver Trailer
                                    </button>
                                </div>
                                
                                <div className="flex-1 space-y-8">
                                    <div>
                                        <h2 className="text-4xl font-bold text-white mb-3">{selectedMovie.title}</h2>
                                        <p className="text-purple-400 text-lg">{selectedMovie.release_date}</p>
                                    </div>
                                    
                                    <p className="text-gray-300 text-lg leading-relaxed">{selectedMovie.overview}</p>
                                    
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-2xl font-semibold text-white mb-4">Reparto Principal</h3>
                                            <div className="flex flex-wrap gap-6">
                                                {actors.map((actor) => (
                                                    <div key={actor.id} className="flex items-center gap-3">
                                                        <img 
                                                            src={`https://image.tmdb.org/t/p/w200${actor.profile_path}`}
                                                            alt={actor.name}
                                                            className="w-14 h-14 rounded-full object-cover"
                                                        />
                                                        <div>
                                                            <p className="text-white font-medium">{actor.name}</p>
                                                            <p className="text-gray-400">{actor.character}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-3 gap-6">
                                            <div className="bg-gray-800 p-5 rounded-lg">
                                                <p className="text-purple-400 text-base">Puntuación</p>
                                                <p className="text-white text-xl font-bold">{selectedMovie.vote_average}/10</p>
                                            </div>
                                            <div className="bg-gray-800 p-5 rounded-lg">
                                                <p className="text-purple-400 text-base">Votos</p>
                                                <p className="text-white text-xl font-bold">{selectedMovie.vote_count}</p>
                                            </div>
                                            <div className="bg-gray-800 p-5 rounded-lg">
                                                <p className="text-purple-400 text-base">Popularidad</p>
                                                <p className="text-white text-xl font-bold">{selectedMovie.popularity.toFixed(0)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className='flex justify-center items-center gap-8 py-8'>
                <button 
                    className='px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full transition-colors'
                    onClick={previewPage}>
                    Anterior
                </button>
                <span className="text-white">
                    Página {pages} de {totalPages}
                </span>
                <button 
                    className='px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full transition-colors'
                    onClick={nextPage}>
                    Siguiente
                </button>
            </div>
        </div>
    )
}