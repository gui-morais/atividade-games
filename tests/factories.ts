import prisma from "config/database";
import {faker} from "@faker-js/faker";

export async function createConsole() {
    return prisma.console.create({
        data: {
            name: faker.company.name()
        }
    })
}

export async function createGame(id: number) {
    return prisma.game.create({
        data: {
            title: faker.name.firstName(),
            consoleId: id
        }
    })
}