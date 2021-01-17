const { loadFeature, defineFeature } = require('jest-cucumber')
const feature = loadFeature('./tests/integration/general.feature')

const ESIClient = require('../../../index')

defineFeature(feature, test => {
    test('Querying a public endpoint', ({ given, when, then }) => {
        given("I have initialised the client", () => {
            this.esiClient = new ESIClient("https://esi.evetech.net/latest")
        })

        when("I make a valid route and request", async () => {
            this.result = await this.esiClient.request("/status/", "GET")
        })

        then("I should get a valid response back", () => {
            console.info(this.result)
            expect(this.result).toBeDefined();
            expect(typeof this.result.data.players).toBe("number")
        })
    })

    test('Querying a secure endpoint', ({ given, when, then }) => {
        given('I have initialised the client with valid credentials', () => {

        });

        when('I make a valid route and request to a secure endpoint', () => {

        });

        then('I should get a valid response back', () => {

        });
    });
})