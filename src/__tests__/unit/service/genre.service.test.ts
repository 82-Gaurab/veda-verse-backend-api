import mongoose from "mongoose";
import { GenreService } from "../../../service/genre.service";
import { GenreRepository } from "../../../repository/genre.repository";
import { IGenre } from "../../../models/genre.model";
import { HttpError } from "../../../error/http-error";

// --- Mocks ---
jest.mock("../../../repository/genre.repository");

describe("GenreService Unit Tests", () => {
  let genreService: GenreService;
  const repo = {
    create: jest.spyOn(GenreRepository.prototype, "create"),
    getAllGenres: jest.spyOn(GenreRepository.prototype, "getAllGenres"),
    getAllGenresPaginated: jest.spyOn(
      GenreRepository.prototype,
      "getAllGenresPaginated",
    ),
    getGenreById: jest.spyOn(GenreRepository.prototype, "getGenreById"),
    deleteGenre: jest.spyOn(GenreRepository.prototype, "deleteGenre"),
    updateGenre: jest.spyOn(GenreRepository.prototype, "updateGenre"),
  };

  const fakeGenre: Partial<IGenre> = {
    _id: new mongoose.Types.ObjectId(),
    name: "Fantasy",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    genreService = new GenreService();
  });

  // CREATE GENRE
  it("should create a new genre", async () => {
    const genreData = { name: "Sci-Fi" };
    repo.create.mockResolvedValue({
      ...genreData,
      _id: new mongoose.Types.ObjectId(),
    } as any);

    const genre = await genreService.createGenre(genreData);
    expect(repo.create).toHaveBeenCalledWith(genreData);
    expect(genre.name).toBe(genreData.name);
  });

  // GET ALL GENRES
  it("should get all genres", async () => {
    repo.getAllGenres.mockResolvedValue([fakeGenre as any]);

    const genres = await genreService.getAllGenres();
    expect(repo.getAllGenres).toHaveBeenCalled();
    expect(genres).toHaveLength(1);
    expect(genres[0].name).toBe(fakeGenre.name);
  });

  // GET ALL GENRES PAGINATED
  it("should get all genres paginated with default page/size", async () => {
    repo.getAllGenresPaginated.mockResolvedValue({
      genres: [fakeGenre as any],
      total: 1,
    });

    const result = await genreService.getAllGenresPaginated();
    expect(repo.getAllGenresPaginated).toHaveBeenCalledWith(1, 10, undefined);
    expect(result.genres).toHaveLength(1);
    expect(result.pagination.page).toBe(1);
    expect(result.pagination.size).toBe(10);
    expect(result.pagination.totalItems).toBe(1);
    expect(result.pagination.totalPages).toBe(1);
  });

  it("should get all genres paginated with custom page/size/search", async () => {
    repo.getAllGenresPaginated.mockResolvedValue({
      genres: [fakeGenre as any],
      total: 5,
    });

    const result = await genreService.getAllGenresPaginated("2", "2", "Fan");
    expect(repo.getAllGenresPaginated).toHaveBeenCalledWith(2, 2, "Fan");
    expect(result.pagination.page).toBe(2);
    expect(result.pagination.size).toBe(2);
    expect(result.pagination.totalItems).toBe(5);
    expect(result.pagination.totalPages).toBe(3);
  });

  // GET GENRE BY ID
  it("should get a genre by ID", async () => {
    repo.getGenreById.mockResolvedValue(fakeGenre as any);

    const genre = await genreService.getGenreById("genre123");
    expect(repo.getGenreById).toHaveBeenCalledWith("genre123");
    expect(genre.name).toBe(fakeGenre.name);
  });

  it("should throw 404 if genre not found by ID", async () => {
    repo.getGenreById.mockResolvedValue(null);

    await expect(genreService.getGenreById("missing")).rejects.toThrow(
      new HttpError(404, "Genre not found"),
    );
  });

  // UPDATE GENRE
  it("should update a genre", async () => {
    const updateData = { name: "Updated Fantasy" };
    repo.getGenreById.mockResolvedValue(fakeGenre as any);
    repo.updateGenre.mockResolvedValue({ ...fakeGenre, ...updateData } as any);

    const updated = await genreService.updateGenre("genre123", updateData);
    expect(repo.getGenreById).toHaveBeenCalledWith("genre123");
    expect(repo.updateGenre).toHaveBeenCalledWith("genre123", updateData);
    expect(updated!.name).toBe(updateData.name);
  });

  it("should throw 404 if genre to update not found", async () => {
    repo.getGenreById.mockResolvedValue(null);

    await expect(
      genreService.updateGenre("missing", { name: "X" }),
    ).rejects.toThrow(new HttpError(404, "Genre not found"));
  });

  // DELETE GENRE
  it("should delete a genre", async () => {
    repo.getGenreById.mockResolvedValue(fakeGenre as any);
    repo.deleteGenre.mockResolvedValue(true);

    const deleted = await genreService.deleteGenre("genre123");
    expect(repo.getGenreById).toHaveBeenCalledWith("genre123");
    expect(repo.deleteGenre).toHaveBeenCalledWith("genre123");
    expect(deleted).toBe(true);
  });

  it("should throw 404 if genre to delete not found", async () => {
    repo.getGenreById.mockResolvedValue(null);

    await expect(genreService.deleteGenre("missing")).rejects.toThrow(
      new HttpError(404, "Genre not found"),
    );
  });
});
