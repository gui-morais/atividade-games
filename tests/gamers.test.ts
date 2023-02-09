import app from "../src/app"
import supertest from "supertest";
import prisma from "../src/config/database";
import { createConsole, createGame } from "./factories";
import { faker } from "@faker-js/faker";
import httpStatus from "http-status";

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

    it("should respond with a array with console datas", async () => {
        const console = await createConsole();
        for(let i=1;i<=3;i++) {
            await createGame(console.id);
        }

        const response = await server.get("/games");

        expect(response.body).toEqual(expect.arrayContaining([
            expect.objectContaining({
                id: expect.any(Number),
                title: expect.any(String),
                consoleId: expect.any(Number)
            })
        ]));
    });
})

describe("GET /games/:id", () => {
    it("should respond with status 404 when id isn't correct", async () => {
        const fakeId = Math.floor(faker.datatype.number());
        const response = await server.get("/games/"+fakeId);

        expect(response.status).toBe(httpStatus.NOT_FOUND);
    })

    it("should respond with the console data if id is correct", async () => {
        const console = await createConsole();
        const game = await createGame(console.id);

        const response = await server.get("/games/"+game.id);

        expect(response.body).toEqual(game);
    })

})

describe("POST /games", () => {
    it("should response with status 409 when another registered game has the same name", async () => {
        const console = await createConsole();
        const game = await createGame(console.id);

        const response = await server.post("/games/").send({
            title: game.title,
            consoleId: game.id
        });

        expect(response.status).toBe(httpStatus.CONFLICT);
    })

    it("should response with status 409 when the console does not exist", async () => {

        const response = await server.post("/games/").send({
            title: faker.name.firstName(),
            consoleId: Math.floor(faker.datatype.number())
        });

        expect(response.status).toBe(httpStatus.CONFLICT);
    })

    it("should respond with status 201 when data is correct", async () => {
        const console = await createConsole();

        const response = await server.post("/games/").send({
            title: faker.name.firstName(),
            consoleId: console.id
        });

        expect(response.status).toBe(httpStatus.CREATED);
    })

})