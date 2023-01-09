import _ from "lodash";
import { faker } from "@faker-js/faker";

const _fakeContainers = (n = 100) => Array(n).fill(0).map((_, idx) => ({
    "#": idx,
    id: faker.database.mongodbObjectId(),
    name: faker.science.chemicalElement().name,
    creator: faker.internet.userName(),
    created: faker.date.past().toDateString(),
    barcode: faker.mersenne.rand(),
    organization: faker.company.companyName(),
    location: faker.address.city(),
    lab: faker.company.companyName(),
    runCount: faker.random.numeric(2),
    aliquotCount: faker.random.numeric(2),
    contents: faker.science.chemicalElement(),
    price: faker.commerce.price(),
    mass: `${faker.random.numeric(2)} ${faker.science.unit()}`
}));

export const fakeContainers = () => {
    const containers = _fakeContainers(5000);
    return {
        columns: Object.keys(containers[0]).map((c) => ({
            width: 120,
            label: _.capitalize(c),
            dataKey: c,
            id: c,
        })),
        data: containers
    };
}
