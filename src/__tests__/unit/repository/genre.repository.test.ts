import mongoose from "mongoose";
import { GenreModel } from "../../../models/genre.model";
import { GenreRepository } from "../../../repository/genre.repository";

describe("Genre Repository Unit Tests", () => {
  let genreRepo: GenreRepository;
  let testGenreId: string;

  beforeAll(async () => {
    // Connect to test database (avoid multiple connects)
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect("mongodb://127.0.0.1:27017/testdb");
    }
    await GenreModel.deleteMany({});
    genreRepo = new GenreRepository();
  });

  afterEach(async () => {
    // Clean up genres after each test
    await GenreModel.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  const getGenreData = (overrides = {}) => ({
    name: "Test Genre 123",
    ...overrides,
  });

  // 1. Create Genre
  test("should create a new genre", async () => {
    const genre = await genreRepo.create(getGenreData());
    expect(genre).toBeDefined();
    expect(genre.name).toBe("Test Genre 123");
    testGenreId = genre._id.toString();
  });

  // 2. Get Genre By ID
  test("should get a genre by ID", async () => {
    const genre = await genreRepo.create(getGenreData());
    const found = await genreRepo.getGenreById(genre._id.toString());
    expect(found).toBeDefined();
    expect(found?._id.toString()).toBe(genre._id.toString());
  });

  // 3. Get Genre By ID - Not Found
  test("should return null when genre ID does not exist", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const found = await genreRepo.getGenreById(fakeId);
    expect(found).toBeNull();
  });

  // 4. Get All Genres
  test("should get all genres", async () => {
    await genreRepo.create(getGenreData({ name: "Genre 1" }));
    await genreRepo.create(getGenreData({ name: "Genre 2" }));
    const genres = await genreRepo.getAllGenres();
    expect(Array.isArray(genres)).toBe(true);
    expect(genres.length).toBe(2);
  });

  // 5. Get All Genres Paginated
  test("should get all genres paginated with and without search", async () => {
    await genreRepo.create(getGenreData({ name: "Action" }));
    await genreRepo.create(getGenreData({ name: "Adventure" }));

    const result = await genreRepo.getAllGenresPaginated(1, 10);
    expect(result).toBeDefined();
    expect(Array.isArray(result.genres)).toBe(true);
    expect(result.total).toBe(2);

    const searchResult = await genreRepo.getAllGenresPaginated(1, 10, "Action");
    expect(searchResult.genres.length).toBe(1);
    expect(searchResult.genres[0].name).toBe("Action");

    const noMatchResult = await genreRepo.getAllGenresPaginated(
      1,
      10,
      "Nonexistent",
    );
    expect(noMatchResult.genres.length).toBe(0);
    expect(noMatchResult.total).toBe(0);
  });

  // 6. Update Genre
  test("should update a genre", async () => {
    const genre = await genreRepo.create(getGenreData());
    const updated = await genreRepo.updateGenre(genre._id.toString(), {
      name: "Updated Genre",
    });
    expect(updated).toBeDefined();
    expect(updated?.name).toBe("Updated Genre");
  });

  // 7. Delete Genre
  test("should delete a genre by ID", async () => {
    const genre = await genreRepo.create(getGenreData());
    const result = await genreRepo.deleteGenre(genre._id.toString());
    expect(result).toBe(true);

    const deleted = await genreRepo.getGenreById(genre._id.toString());
    expect(deleted).toBeNull();
  });

  // 8. Get Genres by Multiple IDs
  test("should get genres by multiple IDs", async () => {
    const genre1 = await genreRepo.create(getGenreData({ name: "G1" }));
    const genre2 = await genreRepo.create(getGenreData({ name: "G2" }));
    const genres = await genreRepo.getGenresByIds([
      genre1._id.toString(),
      genre2._id.toString(),
    ]);
    expect(genres.length).toBe(2);
    expect(genres.map((g) => g.name)).toEqual(
      expect.arrayContaining(["G1", "G2"]),
    );
  });

  // 9. Get Genres by Names
  test("should get genres by multiple names", async () => {
    await genreRepo.create(getGenreData({ name: "Horror" }));
    await genreRepo.create(getGenreData({ name: "Comedy" }));

    const genres = await genreRepo.getGenresByNames(["Horror", "Comedy"]);
    expect(genres.length).toBe(2);
    expect(genres.map((g) => g.name)).toEqual(
      expect.arrayContaining(["Horror", "Comedy"]),
    );
  });
});
