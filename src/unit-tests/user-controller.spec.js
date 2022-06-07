"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("../app");
const database_1 = require("../database");
const supertest_1 = __importDefault(require("supertest"));
const user_mocks_1 = require("./user-mocks");
require("jest");
let requestWithSupertest;
beforeAll(async () => {
    const server = new app_1.App(3000);
    await (0, database_1.startConnection)();
    requestWithSupertest = (0, supertest_1.default)(server.getApp());
});
describe("Get all stats", () => {
    it("GET /stats should show all stats", async () => {
        const res = await requestWithSupertest.get("/stats");
        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining("json"));
        expect(res.body).toHaveProperty("length");
    });
});
describe("Create dna", () => {
    it("POST /mutant should create one dna", async () => {
        const res = await requestWithSupertest
            .post("/mutant")
            .send(user_mocks_1.dna);
            expect(res.status).toEqual(200);
            expect(res.type).toEqual(expect.stringContaining("json"));
            expect(res.body).toHaveProperty("dna")
    });
});
