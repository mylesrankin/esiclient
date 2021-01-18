const { loadFeature, defineFeature } = require('jest-cucumber')
const feature = loadFeature('./tests/integration/general.feature')
/**
 * @jest-environment node
 */

const ESIClient = require('../../../index')

defineFeature(feature, test => {
    test('Querying a public endpoint', ({ given, when, then }) => {
        given("I have initialised the client", () => {
            this.esiClient = new ESIClient("https://esi.evetech.net/latest", {})
        })

        when("I make a valid route and request", async () => {
            this.result = await this.esiClient.request("/status/", "GET", {})
        })

        then("I should get a valid response back", () => {
            expect(this.result).toBeDefined();
            expect(typeof this.result.data.players).toBe("number")
        })
    })

    // test('Querying a secure endpoint', ({ given, when, then }) => {
    //     given('I have initialised the client with valid credentials', () => {
    //         const credentials = {
    //             "access_token": "xxxxxxx",
    //             "token_type": "Bearer",
    //             "expires_in": 1200,
    //             "refresh_token": "xxxxxxxx"
    //         }
    //         this.esiClient = new ESIClient("https://esi.evetech.net/latest", { credentials })
    //     });

    //     when('I make a valid route and request to a secure endpoint', async () => {
    //         this.result = await this.esiClient.request(
    //             "/oauth/verify",
    //             "GET",
    //             { authRequired: true, urlOverride: "https://login.eveonline.com" }
    //         )
    //     });

    //     then('I should get a valid response back', () => {
    //         expect(typeof this.result.data.CharacterID).toEqual("number")
    //         expect(this.result).toBeDefined();
    //     });
    // });
})