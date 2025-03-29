import { faker } from "@faker-js/faker";

/**
 * Creates a user object with random data using the Faker library.
 *
 * @returns {Object} A user object with randomly generated data.
 */
function createFakeUser() {
  const user = {
    username: faker.internet.username().slice(0, 16),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    gender: faker.helpers.arrayElement(["male", "female"]),
    isAdmin: faker.datatype.boolean(),
  };

  return user;
}

export { createFakeUser };
