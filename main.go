package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"

	"frontendmasters.com/movies/data"
	"frontendmasters.com/movies/handlers"
	"frontendmasters.com/movies/logger"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

func initializeLogger() *logger.Logger {
	logInstance, err := logger.NewLogger("movie.log")
	// logInstance.Error("Hello from the Error system", nil)
	if err != nil {
		log.Fatalf("Failed to initialice logger $v", err)
	}
	defer logInstance.Close()
	return logInstance
}




func main() {

	// Log Initializer
	logInstance := initializeLogger()

	// Load .env file, this mergest .env into the os env variables
	if err := godotenv.Load(); err != nil {
		log.Printf("No .env file found or failed to load: %v", err)
	}

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



	// Initialize Data Repository for Movies
	movieRepo, err := data.NewMovieRepository(db, logInstance)
	if err != nil {
		log.Fatalf(("Failed to initialize repository"))
	}

	//Handlers
	movieHandler := handlers.NewMovieHandler(movieRepo, logInstance)

	http.HandleFunc("/api/movies/top/", movieHandler.GetTopMovies)
	http.HandleFunc("/api/movies/random/", movieHandler.GetRandomMovies)
	http.HandleFunc("/api/movies/search/", movieHandler.SearchMovies)
	http.HandleFunc("/api/movies/", movieHandler.GetMovie) // api/movies/140
	http.HandleFunc("/api/genres/", movieHandler.GetGenres)


	// Handler for static files (frontend)
	http.Handle("/", http.FileServer(http.Dir("public")))
	fmt.Println("Serving the files")

	const addr = ":8080"
	err = http.ListenAndServe(addr, nil)
	if err != nil {
		log.Fatalf("Server failed: %v", err)
		logInstance.Error("Server failed", err)
	}

}
