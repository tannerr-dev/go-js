# Build a Fullstack App with Vanilla JS and Go
# Frontend Masters
## Trainer: Maximiliano Firtman @firt (X) - firt.dev

You can follow along the workshop with instructions delivered by the trainer.
In the assets folders, you will find a copy of the slides and the final project.

## A-Backend

### A1 - Init

Run `go mod init frontendmasters.com/reelingit` to create the module.

Install the dependencies

```
go get github.com/joho/godotenv
go get github.com/lib/pq
```

Create the *main.go* file.

```go
package main 

func main() {
    // Serve static files
    http.Handle("/", http.FileServer(http.Dir("public")))

    // Start server
    const addr = ":8080"
    if err := http.ListenAndServe(addr, nil); err != nil {
        log.Fatalf("Server failed: %v", err)
    }
}
```

Create a test *index.html*.

### A2 - Logger

Create a logger package with a *logger.go* file

```go
package logger

import (
	"log"
	"os"
)

type Logger struct {
	infoLogger  *log.Logger
	errorLogger *log.Logger
	file        *os.File
}

// NewLogger creates a new logger with output to both file and stdout
func NewLogger(logFilePath string) (*Logger, error) {
	file, err := os.OpenFile(logFilePath, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		return nil, err
	}

	return &Logger{
		infoLogger:  log.New(os.Stdout, "INFO: ", log.Ldate|log.Ltime|log.Lshortfile),
		errorLogger: log.New(file, "ERROR: ", log.Ldate|log.Ltime|log.Lshortfile),
		file:        file,
	}, nil
}

// Info logs informational messages to stdout
func (l *Logger) Info(msg string) {
	l.infoLogger.Printf("%s", msg)
}

// Error logs error messages to file
func (l *Logger) Error(msg string, err error) {
	l.errorLogger.Printf("%s: %v", msg, err)
}

// Close closes the log file
func (l *Logger) Close() {
	l.file.Close()
}
```

Now, change *main.go* with:

```go
func main() {
	// Initialize logger
	logInstance := initializeLogger()

	http.Handle("/", http.FileServer(http.Dir("public")))

	// Start server
	const addr = ":8080"
	logInstance.Info("Server starting on " + addr)
	if err := http.ListenAndServe(addr, nil); err != nil {
		logInstance.Error("Server failed to start", err)
		log.Fatalf("Server failed: %v", err)
	}
}

func initializeLogger() *logger.Logger {
	logInstance, err := logger.NewLogger("movie-service.log")
	if err != nil {
		log.Fatalf("Failed to initialize logger: %v", err)
	}
	defer logInstance.Close()
	return logInstance
}

```

### A3 - Models

Create the *models* package with the following files:

*genre.go*
```go
package models

type Genre struct {
	ID   int   
	Name string 
}
```

*actor.go*
```go
package models

type Actor struct {
	ID        int     
	FirstName string  
	LastName  string  
	ImageURL  *string 
}

```

*movie.go*
```go
package models

type Movie struct {
	ID          int      
	TMDB_ID     int      
	Title       string   
	Tagline     *string  
	ReleaseYear int      
	Genres      []Genre  
	Overview    *string  
	Score       *float32 
	Popularity  *float32 
	Keywords    []string 
	Language    *string  
	PosterURL   *string  
	TrailerURL  *string  
	Casting     []Actor  
}

```

### A4 - Basic Handlers

Create the *handlers* package with a *movies_handlers.go* file.

```go
package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"frontendmasters.com/movies/logger"
	"frontendmasters.com/movies/models"
)

type MovieHandler struct {
}

// Utility functions
func (h *MovieHandler) writeJSONResponse(w http.ResponseWriter, data interface{}) error {
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(data); err != nil {
		h.logger.Error("Failed to encode response", err)
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return err
	}
	return nil
}

func (h *MovieHandler) GetTopMovies(w http.ResponseWriter, r *http.Request) {
    movies := []models.Movie{
		{
			ID:          1,
			TMDB_ID:     101,
			Title:       "The Hacker",
			ReleaseYear: 2022,
			Genres:      []models.Genre{{ID: 1, Name: "Thriller"}},
			Keywords:    []string{"hacking", "cybercrime"},
			Casting:     []models.Actor{{ID: 1, Name: "Jane Doe"}},
		},
		{
			ID:          2,
			TMDB_ID:     102,
			Title:       "Space Dreams",
			ReleaseYear: 2020,
			Genres:      []models.Genre{{ID: 2, Name: "Sci-Fi"}},
			Keywords:    []string{"space", "exploration"},
			Casting:     []models.Actor{{ID: 2, Name: "John Star"}},
		},
		{
			ID:          3,
			TMDB_ID:     103,
			Title:       "The Lost City",
			ReleaseYear: 2019,
			Genres:      []models.Genre{{ID: 3, Name: "Adventure"}},
			Keywords:    []string{"jungle", "treasure"},
			Casting:     []models.Actor{{ID: 3, Name: "Lara Hunt"}},
		},
	}

	if h.writeJSONResponse(w, movies) == nil {
		h.logger.Info("Successfully served top movies")
	}
}

```

Now setup the handler in *main.go*

```go
    // ...
    movieHandler := handlers.NewMovieHandler {}
	// Set up routes
	http.HandleFunc("/api/movies/top", movieHandler.GetTopMovies)
    // ...
```

### A5 - Install AIR

Check instructions at [https://github.com/air-verse/air](https://github.com/air-verse/air), such as executing

```
go install github.com/cosmtrek/air@latest
```

To customize it, create a *.air.toml* file with

```toml
# .air.toml
root = "."
tmp_dir = "tmp"

[build]
cmd = "go build -o ./tmp/main ./main.go"
bin = "./tmp/main"
include_ext = ["go"]  # Only watch .go files
exclude_dir = ["tmp", "vendor", "node_modules"]
delay = 1000  # ms

[log]
time = true

[misc]
clean_on_exit = true
```

## B-Database

### B1 - Import Data

Set up a Postgres database and get a connection string, then, go to *import/install.go* and insert the string there.

Get into the *import* folder, and run `go run install.go`. That should populate your database with all the data.

### B2 - Create the data interface

Create the *data* package and the *interfaces.go* file

```go
package data

import "frontendmasters.com/movies/models"

type MovieStorage interface {
	GetTopMovies() ([]models.Movie, error)
	GetRandomMovies() ([]models.Movie, error)
	GetMovieByID(id int) (models.Movie, error)
	SearchMoviesByName(name string, order string, genre *int) ([]models.Movie, error)
	GetAllGenres() ([]models.Genre, error)
}
```

### B3 - Create the DB connection

Create a *.env* file in the root folder and add the connection string

```
DATABASE_URL=""
```

Open *main.go* and add this in the *main* function

```go
    // Load .env file
	if err := godotenv.Load(); err != nil {
		log.Printf("No .env file found or failed to load: %v", err)
	}

	// Initialize logger
	logInstance := initializeLogger()

	// Database connection
	dbConnStr := os.Getenv("DATABASE_URL")
	if dbConnStr == "" {
		log.Fatalf("DATABASE_URL not set in environment")
	}
	db, err := sql.Open("postgres", dbConnStr)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()
```

### B4 - Add field metadata to models

Modify the models to add metadata such as with *models/movie.go*

```go
package models

type Movie struct {
	ID          int      `json:"id"`
	TMDB_ID     int      `json:"tmdb_id,omitempty"`
	Title       string   `json:"title"`
	Tagline     *string  `json:"tagline,omitempty"`
	ReleaseYear int      `json:"release_year"`
	Genres      []Genre  `json:"genres"`
	Overview    *string  `json:"overview,omitempty"`
	Score       *float32 `json:"score,omitempty"`
	Popularity  *float32 `json:"popularity,omitempty"`
	Keywords    []string `json:"keywords"`
	Language    *string  `json:"language,omitempty"`
	PosterURL   *string  `json:"poster_url,omitempty"`
	TrailerURL  *string  `json:"trailer_url,omitempty"`
	Casting     []Actor  `json:"casting"`
}
```

### B5 - Create the Movie Repository

Create *data/movie_repository.go

```go
package data

import (
	"database/sql"
	"errors"
	"strconv"

	"frontendmasters.com/movies/logger"
	"frontendmasters.com/movies/models"
	_ "github.com/lib/pq"
)

type MovieRepository struct {
	db     *sql.DB
	logger *logger.Logger
}

func NewMovieRepository(db *sql.DB, log *logger.Logger) (*MovieRepository, error) {
	return &MovieRepository{
		db:     db,
		logger: log,
	}, nil
}

const defaultLimit = 20

func (r *MovieRepository) GetTopMovies() ([]models.Movie, error) {
	// Fetch movies
	query := `
		SELECT id, tmdb_id, title, tagline, release_year, overview, score, 
		       popularity, language, poster_url, trailer_url
		FROM movies
		ORDER BY popularity DESC
		LIMIT $1
	`
	return r.getMovies(query)
}


func (r *MovieRepository) getMovies(query string) ([]models.Movie, error) {
	rows, err := r.db.Query(query, defaultLimit)
	if err != nil {
		r.logger.Error("Failed to query movies", err)
		return nil, err
	}
	defer rows.Close()

	var movies []models.Movie
	for rows.Next() {
		var m models.Movie
		if err := rows.Scan(
			&m.ID, &m.TMDB_ID, &m.Title, &m.Tagline, &m.ReleaseYear,
			&m.Overview, &m.Score, &m.Popularity, &m.Language,
			&m.PosterURL, &m.TrailerURL,
		); err != nil {
			r.logger.Error("Failed to scan movie row", err)
			return nil, err
		}
		movies = append(movies, m)
	}

	return movies, nil
}

var (
	ErrMovieNotFound = errors.New("movie not found")
)
```

Back in *main.go*, initialize the repository after the database creation

```go
	// Initialize repositories
	movieRepo, err := data.NewMovieRepository(db, logInstance)
	if err != nil {
		log.Fatalf("Failed to initialize movie repository: %v", err)
	}
```

Update handlers

```go
type MovieHandler struct {
	storage data.MovieStorage
	logger  *logger.Logger
}

func (h *MovieHandler) handleStorageError(w http.ResponseWriter, err error, context string) bool {
	if err != nil {
		if err == data.ErrMovieNotFound {
			http.Error(w, context, http.StatusNotFound)
			return true
		}
		h.logger.Error(context, err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return true
	}
	return false
}
```

Update handler instance in *main.go* to use the new structure:

```go
movieHandler := handlers.NewMovieHandler(movieRepo, logInstance)	
```

### B6 - Finish the Movie Repository

The final *movie_repository.go* should look like

```go
package data

import (
	"database/sql"
	"errors"
	"strconv"

	"frontendmasters.com/movies/logger"
	"frontendmasters.com/movies/models"
	_ "github.com/lib/pq"
)

type MovieRepository struct {
	db     *sql.DB
	logger *logger.Logger
}

func NewMovieRepository(db *sql.DB, log *logger.Logger) (*MovieRepository, error) {
	return &MovieRepository{
		db:     db,
		logger: log,
	}, nil
}

const defaultLimit = 20

func (r *MovieRepository) GetTopMovies() ([]models.Movie, error) {
	// Fetch movies
	query := `
		SELECT id, tmdb_id, title, tagline, release_year, overview, score, 
		       popularity, language, poster_url, trailer_url
		FROM movies
		ORDER BY popularity DESC
		LIMIT $1
	`
	return r.getMovies(query)
}

func (r *MovieRepository) GetRandomMovies() ([]models.Movie, error) {
	// Fetch movies
	randomQuery := `
		SELECT id, tmdb_id, title, tagline, release_year, overview, score, 
		       popularity, language, poster_url, trailer_url
		FROM movies
		ORDER BY random()
		LIMIT $1
	`
	return r.getMovies(randomQuery)
}

func (r *MovieRepository) getMovies(query string) ([]models.Movie, error) {
	rows, err := r.db.Query(query, defaultLimit)
	if err != nil {
		r.logger.Error("Failed to query movies", err)
		return nil, err
	}
	defer rows.Close()

	var movies []models.Movie
	for rows.Next() {
		var m models.Movie
		if err := rows.Scan(
			&m.ID, &m.TMDB_ID, &m.Title, &m.Tagline, &m.ReleaseYear,
			&m.Overview, &m.Score, &m.Popularity, &m.Language,
			&m.PosterURL, &m.TrailerURL,
		); err != nil {
			r.logger.Error("Failed to scan movie row", err)
			return nil, err
		}
		movies = append(movies, m)
	}

	return movies, nil
}

func (r *MovieRepository) GetMovieByID(id int) (models.Movie, error) {
	// Fetch movie
	query := `
		SELECT id, tmdb_id, title, tagline, release_year, overview, score, 
		       popularity, language, poster_url, trailer_url
		FROM movies
		WHERE id = $1
	`
	row := r.db.QueryRow(query, id)

	var m models.Movie
	err := row.Scan(
		&m.ID, &m.TMDB_ID, &m.Title, &m.Tagline, &m.ReleaseYear,
		&m.Overview, &m.Score, &m.Popularity, &m.Language,
		&m.PosterURL, &m.TrailerURL,
	)
	if err == sql.ErrNoRows {
		r.logger.Error("Movie not found", ErrMovieNotFound)
		return models.Movie{}, ErrMovieNotFound
	}
	if err != nil {
		r.logger.Error("Failed to query movie by ID", err)
		return models.Movie{}, err
	}

	// Fetch related data
	if err := r.fetchMovieRelations(&m); err != nil {
		return models.Movie{}, err
	}

	return m, nil
}

func (r *MovieRepository) SearchMoviesByName(name string, order string, genre *int) ([]models.Movie, error) {
	orderBy := "popularity DESC"
	switch order {
	case "score":
		orderBy = "score DESC"
	case "name":
		orderBy = "title"
	case "date":
		orderBy = "release_year DESC"
	}

	genreFilter := ""
	if genre != nil {
		genreFilter = ` AND ((SELECT COUNT(*) FROM movie_genres 
								WHERE movie_id=movies.id 
								AND genre_id=` + strconv.Itoa(*genre) + `) = 1) `
	}

	// Fetch movies by name
	query := `
		SELECT id, tmdb_id, title, tagline, release_year, overview, score, 
		       popularity, language, poster_url, trailer_url
		FROM movies
		WHERE (title ILIKE $1 OR overview ILIKE $1) ` + genreFilter + `
		ORDER BY ` + orderBy + `
		LIMIT $2
	`
	rows, err := r.db.Query(query, "%"+name+"%", defaultLimit)
	if err != nil {
		r.logger.Error("Failed to search movies by name", err)
		return nil, err
	}
	defer rows.Close()

	var movies []models.Movie
	for rows.Next() {
		var m models.Movie
		if err := rows.Scan(
			&m.ID, &m.TMDB_ID, &m.Title, &m.Tagline, &m.ReleaseYear,
			&m.Overview, &m.Score, &m.Popularity, &m.Language,
			&m.PosterURL, &m.TrailerURL,
		); err != nil {
			r.logger.Error("Failed to scan movie row", err)
			return nil, err
		}
		movies = append(movies, m)
	}

	return movies, nil
}

func (r *MovieRepository) GetAllGenres() ([]models.Genre, error) {
	query := `SELECT id, name FROM genres ORDER BY id`
	rows, err := r.db.Query(query)
	if err != nil {
		r.logger.Error("Failed to query all genres", err)
		return nil, err
	}
	defer rows.Close()

	var genres []models.Genre
	for rows.Next() {
		var g models.Genre
		if err := rows.Scan(&g.ID, &g.Name); err != nil {
			r.logger.Error("Failed to scan genre row", err)
			return nil, err
		}
		genres = append(genres, g)
	}
	return genres, nil
}

// fetchMovieRelations fetches genres, actors, and keywords for a movie
func (r *MovieRepository) fetchMovieRelations(m *models.Movie) error {
	// Fetch genres
	genreQuery := `
		SELECT g.id, g.name 
		FROM genres g
		JOIN movie_genres mg ON g.id = mg.genre_id
		WHERE mg.movie_id = $1
	`
	genreRows, err := r.db.Query(genreQuery, m.ID)
	if err != nil {
		r.logger.Error("Failed to query genres for movie "+strconv.Itoa(m.ID), err)
		return err
	}
	defer genreRows.Close()
	for genreRows.Next() {
		var g models.Genre
		if err := genreRows.Scan(&g.ID, &g.Name); err != nil {
			r.logger.Error("Failed to scan genre row", err)
			return err
		}
		m.Genres = append(m.Genres, g)
	}

	// Fetch actors
	actorQuery := `
		SELECT a.id, a.first_name, a.last_name, a.image_url
		FROM actors a
		JOIN movie_cast mc ON a.id = mc.actor_id
		WHERE mc.movie_id = $1
	`
	actorRows, err := r.db.Query(actorQuery, m.ID)
	if err != nil {
		r.logger.Error("Failed to query actors for movie "+strconv.Itoa(m.ID), err)
		return err
	}
	defer actorRows.Close()
	for actorRows.Next() {
		var a models.Actor
		if err := actorRows.Scan(&a.ID, &a.FirstName, &a.LastName, &a.ImageURL); err != nil {
			r.logger.Error("Failed to scan actor row", err)
			return err
		}
		m.Casting = append(m.Casting, a)
	}

	// Fetch keywords
	keywordQuery := `
		SELECT k.word
		FROM keywords k
		JOIN movie_keywords mk ON k.id = mk.keyword_id
		WHERE mk.movie_id = $1
	`
	keywordRows, err := r.db.Query(keywordQuery, m.ID)
	if err != nil {
		r.logger.Error("Failed to query keywords for movie "+strconv.Itoa(m.ID), err)
		return err
	}
	defer keywordRows.Close()
	for keywordRows.Next() {
		var k string
		if err := keywordRows.Scan(&k); err != nil {
			r.logger.Error("Failed to scan keyword row", err)
			return err
		}
		m.Keywords = append(m.Keywords, k)
	}

	return nil
}

var (
	ErrMovieNotFound = errors.New("movie not found")
)

```

### B7 - Finish the handlers

The final *movies_handler.go* file should look like

```go
package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"frontendmasters.com/movies/data"
	"frontendmasters.com/movies/logger"
	"frontendmasters.com/movies/models"
)

type MovieHandler struct {
	storage data.MovieStorage
	logger  *logger.Logger
}

// Utility functions
func (h *MovieHandler) writeJSONResponse(w http.ResponseWriter, data interface{}) error {
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(data); err != nil {
		h.logger.Error("Failed to encode response", err)
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return err
	}
	return nil
}

func (h *MovieHandler) handleStorageError(w http.ResponseWriter, err error, context string) bool {
	if err != nil {
		if err == data.ErrMovieNotFound {
			http.Error(w, context, http.StatusNotFound)
			return true
		}
		h.logger.Error(context, err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return true
	}
	return false
}

func (h *MovieHandler) parseID(w http.ResponseWriter, idStr string) (int, bool) {
	id, err := strconv.Atoi(idStr)
	if err != nil {
		h.logger.Error("Invalid ID format", err)
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return 0, false
	}
	return id, true
}

func (h *MovieHandler) GetTopMovies(w http.ResponseWriter, r *http.Request) {
	movies, err := h.storage.GetTopMovies()

	if h.handleStorageError(w, err, "Failed to get movies") {
		return
	}
	if h.writeJSONResponse(w, movies) == nil {
		h.logger.Info("Successfully served top movies")
	}
}

func (h *MovieHandler) GetRandomMovies(w http.ResponseWriter, r *http.Request) {
	movies, err := h.storage.GetRandomMovies()
	if h.handleStorageError(w, err, "Failed to get movies") {
		return
	}
	if h.writeJSONResponse(w, movies) == nil {
		h.logger.Info("Successfully served random movies")
	}
}

func (h *MovieHandler) SearchMovies(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query().Get("q")
	order := r.URL.Query().Get("order")
	genreStr := r.URL.Query().Get("genre")

	var genre *int
	if genreStr != "" {
		genreInt, ok := h.parseID(w, genreStr)
		if !ok {
			return
		}
		genre = &genreInt
	}

	var movies []models.Movie
	var err error
	if query != "" {
		movies, err = h.storage.SearchMoviesByName(query, order, genre)
	}
	if h.handleStorageError(w, err, "Failed to get movies") {
		return
	}
	if h.writeJSONResponse(w, movies) == nil {
		h.logger.Info("Successfully served movies")
	}
}

func (h *MovieHandler) GetMovie(w http.ResponseWriter, r *http.Request) {
	idStr := r.URL.Path[len("/api/movies/"):]
	id, ok := h.parseID(w, idStr)
	if !ok {
		return
	}

	movie, err := h.storage.GetMovieByID(id)
	if h.handleStorageError(w, err, "Failed to get movie by ID") {
		return
	}
	if h.writeJSONResponse(w, movie) == nil {
		h.logger.Info("Successfully served movie with ID: " + idStr)
	}
}

func (h *MovieHandler) GetGenres(w http.ResponseWriter, r *http.Request) {
	genres, err := h.storage.GetAllGenres()
	if h.handleStorageError(w, err, "Failed to get genres") {
		return
	}
	if h.writeJSONResponse(w, genres) == nil {
		h.logger.Info("Successfully served genres")
	}
}

func NewMovieHandler(storage data.MovieStorage, log *logger.Logger) *MovieHandler {
	return &MovieHandler{
		storage: storage,
		logger:  log,
	}
}
```

### B7 - Update the handlers

In *main.go* all the handlers for the API should look like:

```go
	// Initialize handlers
	movieHandler := handlers.NewMovieHandler(movieRepo, logInstance)
	// authHandler := handlers.NewAuthHandler(userStorage, jwt, logInstance)

	// Set up routes
	http.HandleFunc("/api/movies/random", movieHandler.GetRandomMovies)
	http.HandleFunc("/api/movies/top", movieHandler.GetTopMovies)
	http.HandleFunc("/api/movies/search", movieHandler.SearchMovies)
	http.HandleFunc("/api/movies/", movieHandler.GetMovie)
	http.HandleFunc("/api/genres", movieHandler.GetGenres)
	http.HandleFunc("/api/account/register", movieHandler.GetGenres)
	http.HandleFunc("/api/account/authenticate", movieHandler.GetGenres)
```

## C-Frontend

### C1 - Create the HTML

Create `public.html`

```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ReelingIt - Movies</title>
    <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;700&display=swap" rel="stylesheet">
    <link rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,0,0" />
    <link rel="stylesheet" href="/styles.css">
    <meta name="theme-color" content="#56bce8">
    <link rel="manifest" href="app.webmanifest">
    <link rel="icon" href="/images/icon.png" type="image/png">
    <script src="/app.js" type="module" defer></script>
    <base href="/">
</head>

<body>
    <header>
        <h1>
            <a href="/" class="navlink"><img src="/images/logo.png" height="35" alt="ReelingIt"></a>
        </h1>
        <nav>
            <ul>
                <li><a href="/" class="navlink">Movies</a></li>
                <li><a href="/account/favorites" class="navlink">Favorites</a></li>
                <li><a href="/account/watchlist" class="navlink">Watchlist</a></li>
                <li><a href="/account/" class="navlink">My Account</a></li>
            </ul>
        </nav>
        <div>
            <form onsubmit="app.search(event)">
                <input type="search" placeholder="Search movies">
            </form>
        </div>
    </header>

    <main>
    </main>

    <footer>
        <p>© ReelingIt - FrontendMasters.com</p>
    </footer>
         
</body>

</html>
```

### C2 - Initialize the client-side app

Create `app.js`

```js
window.app = { 
    search: (event) => {
        event.preventDefault();
        const keywords = document.querySelector("input[type=search]").value;
        
    },    
}

window.addEventListener("DOMContentLoaded", () => {

})
```

### C3 - Add a Manifest file

Add the *app.webmanifest* file to the project

```json
{
    "name": "ReelingIt",
    "short_name": "ReelingIt",
    "theme_color": "#43281C",
    "display": "browser",
    "background_color": "#56bce8",
    "description": "The ultimate app for movie lovers: discover trailers, reviews, showtimes, and more. Experience cinema like never before!",    "icons": [
        {
            "src": "images/icon.png",
            "sizes": "1024x1024",
            "type": "image/png"
        }
    ]
}
```

### C4 - Create the API Service

Create *services/API.js* file:

```js
export const API = {
    baseURL: '/api/',
    getTopMovies: async () => {
        return await API.fetch("movies/top");
    },
    getRandomMovies: async () => {
        return await API.fetch("movies/random");
    },
    getMovieById: async (id) => {
        return await API.fetch(`/movies/${id}`);
    },
    searchMovies: async (q, order, genre) => {
        return await API.fetch(`/movies/search`, {q, order, genre})
    },
    getGenres: async () => {
        return await API.fetch("genres");
    },
    fetch: async (service, args) => {
        try {
            const queryString = args ? new URLSearchParams(args).toString() : "";
            const response = await fetch(API.baseURL + service + '?' + queryString);
            const result = await response.json();
            return result;
        } catch (e) {
            console.error(e);
            app.showError();
        }
    }
}

export default API;
```

## D-Web Components

### D1 - HomePage template

Create a template in the *index.html*

```html
<template id="template-home">
    <section class="vertical-scroll" id="top-10">
        <h2>This Week's Top 10</h2>
        <ul>
            <animated-loading data-elements="5"
                data-width="150px" data-height="220px">
            </animated-loading> 
        </ul>
    </section>
    <section class="vertical-scroll" id="random">
        <h2>Something to watch today</h2>
        <ul>
            <animated-loading data-elements="5"
                data-width="150px" data-height="220px">
            </animated-loading> 
        </ul>
    </section>
</template>
```

### D2 - MovieItem Component

Create the *components* folder and *MovieItem.js* file

```js
export class MovieItemComponent extends HTMLElement {
    constructor(movie) {
        super();
        this.movie = movie;
    }

    connectedCallback() {
        this.innerHTML = `
                <a href="#">
                    <article>
                        <img src="${this.movie.poster_url}" alt="${this.movie.title} Poster">
                        <p>${this.movie.title} (${this.movie.release_year})</p>
                    </article>
                </a>
            `
    }
}

customElements.define("movie-item", MovieItemComponent);
```

### D3 - HomePage Component

Create components/*HomePage.js*

```js
import API from "../services/API.js";
import { MovieItemComponent } from "./MovieItem.js";

export default class HomePage extends HTMLElement {

    async render() {
        const topMovies = await API.getTopMovies();
        renderMoviesInList(topMovies, this.querySelector("#top-10 ul"));

        const randomMovies = await API.getRandomMovies();
        renderMoviesInList(randomMovies, this.querySelector("#random ul"));

        function renderMoviesInList(movies, ul) {
            ul.innerHTML = "";
            movies.forEach(movie => {
                const li = document.createElement("li");
                li.appendChild(new MovieItemComponent(movie));
                ul.appendChild(li);
            });    
        }
    }

    connectedCallback() {
        const template = document.getElementById("template-home");
        const content = template.content.cloneNode(true);
        this.appendChild(content);  

        this.render();
    }
}
customElements.define("home-page", HomePage);
```

### D4 - Animated Loading

Create the *components/AnimatedLoading.js* file:

```js
class AnimatedLoading extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        let qty = this.dataset.elements ?? 1;
        let width = this.dataset.width ?? "100px";
        let height = this.dataset.height ?? "10px";
        for (let i=0; i<qty; i++) {
            const wrapper = document.createElement('div');
            wrapper.setAttribute('class', 'loading-wave');    
            wrapper.style.width = width;
            wrapper.style.height = height;        
            wrapper.style.margin = "10px";
            wrapper.style.display = "inline-block";
            this.appendChild(wrapper);
        }
    }
}

customElements.define('animated-loading', AnimatedLoading);
```

### D5 - Movie Details

Add a new template to *index.html*

```html
    <template id="template-movie-details">
        <article id="movie">
            <h2><animated-loading elements="2"></animated-loading></h2>
            <h3></h3>
            <header>
                <img src="" alt="Poster">
                <youtube-embed id="trailer" data-url=""></youtube-embed>
                <section id="actions">
                    <dl id="metadata">
                    </dl>
                    <button>Add to Favorites</button>
                    <button>Add to Watchlist</button>    
                </section>
            </header>
            <ul id="genres"></ul>
            <p id="overview"></p>
            <ul id="cast"></ul>
        </article>
    </template>
```

Create the *components/MovieDetailsPage.js* file:

```js
import API from "../services/API.js";

export default class MovieDetailsPage extends HTMLElement {
    
    movie = null;

    async render(id) {
        try {
            this.movie = await API.getMovieById(id);
        } catch (e) {
            app.showError();
            return;
        }
        const template = document.getElementById("template-movie-details");
        const content = template.content.cloneNode(true);
        this.appendChild(content);  

        this.querySelector("h2").textContent = this.movie.title;
        this.querySelector("h3").textContent = this.movie.tagline;
        this.querySelector("img").src = this.movie.poster_url;
        this.querySelector("#trailer").dataset.url = this.movie.trailer_url;
        this.querySelector("#overview").textContent = this.movie.overview;
        this.querySelector("#metadata").innerHTML = `                        
            <dt>Release Date</dt>
            <dd>${this.movie.release_year}</dd>                        
            <dt>Score</dt>
            <dd>${this.movie.score} / 10</dd>                        
            <dt>Original languae</dt>
            <dd>${this.movie.language}</dd>                        
        `;

        const ulGenres = this.querySelector("#genres");
        ulGenres.innerHTML = "";
        this.movie.genres.forEach(genre => {
            const li = document.createElement("li");
            li.textContent = genre.name;
            ulGenres.appendChild(li);
        });

        const ulCast = this.querySelector("#cast");
        ulCast.innerHTML = "";
        this.movie.casting.forEach(actor => {
            const li = document.createElement("li");
            li.innerHTML = `
                <img src="${actor.image_url ?? '/images/generic_actor.jpg'}" alt="Picture of ${actor.last_name}">
                <p>${actor.first_name} ${actor.last_name}</p>
            `;
            ulCast.appendChild(li);
        });
    }

    connectedCallback() {
        const id = this.params[0];

        this.render(id);

    }
}
customElements.define("movie-details-page", MovieDetailsPage);
```

### D6 - YouTube Embed Component

Create the *components/YouTubeEmbed.js* file:

```js
export class YouTubeEmbed extends HTMLElement {
    
    static get observedAttributes() {
        return ['data-url'];
    }

    attributeChangedCallback(prop, value) {
        if (prop === 'data-url') {
            const url = this.dataset.url;
            const videoId = url.substring(url.indexOf("?v")+3);
            console.log(videoId);

            this.innerHTML = `
                <iframe width="100%" height="300" src="https://www.youtube.com/embed/${videoId}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
            `;
        }
    }

}

customElements.define("youtube-embed", YouTubeEmbed);
```