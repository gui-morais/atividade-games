import app from "../src/app"
import supertest from "supertest";
import prisma from "../src/config/database";

beforeEach(async () => {
    await prisma.game.deleteMany();
    await prisma.console.deleteMany();
})

const server = supertest(app);

describe("GET /games", () => {
    it("should respond with a empry array when no games are registered", async () => {
        const response = await server.get("/games");

        expect(response.body).toEqual([]);
    })
})