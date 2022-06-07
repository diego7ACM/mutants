import { App } from "../app";
import { startConnection } from "../database";
import supertest,{SuperTest,Test} from "supertest";
import { dna } from "./user-mocks";
import "jest";

let requestWithSupertest:SuperTest<Test> ;

beforeAll(async () => {
  const server = new App(3000);
  await startConnection();
  requestWithSupertest = supertest(server.getApp());
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
      .send(dna);
    expect(res.status).toEqual(200);
    expect(res.type).toEqual(expect.stringContaining("json"));
    expect(res.body).toHaveProperty("dna")
  });
});

