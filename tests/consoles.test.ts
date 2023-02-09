import app from "../src/app"
import supertest from "supertest";
import prisma from "../src/config/database";
import { createConsole } from "./factories";
import { faker } from "@faker-js/faker";
import httpStatus from "http-status";

beforeEach(async () => {
    await prisma.game.deleteMany();
    await prisma.console.deleteMany();
})

const server = supertest(app);

describe("GET /consoles", () => {
    it("should respond with a empty array when no consoles are registered", async () => {
        const response = await server.get("/consoles");

        expect(response.body).toEqual([]);
    });

    it("should respond with a array with console datas", async () => {
        for(let i=1;i<=3;i++) {
            await createConsole();
        }

        const response = await server.get("/consoles");

        expect(response.body).toEqual(expect.arrayContaining([
            expect.objectContaining({
                id: expect.any(Number),
                name: expect.any(String)
            })
        ]));
    });
})

describe("GET /consoles/:id", () => {
    it("should respond with the console data if id is correct", async () => {
        const console = await createConsole();

        const response = await server.get("/consoles/"+console.id);

        expect(response.body).toEqual(console);
    });

    it("should respond with status 404 when id isn't correct", async () => {
        const fakeId = Math.floor(faker.datatype.number());
        const response = await server.get("/consoles/"+fakeId);

        expect(response.status).toBe(httpStatus.NOT_FOUND);
    })
});

describe("POST /consoles", () => {
    it("should respond with status 201 when data is correct", async () => {
        const response = await server.post("/consoles").send({
            name: faker.company.name()
        })

        expect(response.status).toBe(httpStatus.CREATED);
    });

    it("should respond with status 422 when data is incorrect", async () => {
        const response = await server.post("/consoles");

        expect(response.status).toBe(httpStatus.UNPROCESSABLE_ENTITY);
    });

    it("should response with status 409 when another registered console has the same name", async () => {
        const console = await createConsole();

        const response = await server.post("/consoles/").send({
            name: console.name
        });

        expect(response.status).toBe(httpStatus.CONFLICT);
    })
})