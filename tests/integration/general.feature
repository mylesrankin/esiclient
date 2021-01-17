Feature: ESIClient Queries
 
Scenario: Querying a public endpoint
    Given I have initialised the client
    When I make a valid route and request 
    Then I should get a valid response back

Scenario: Querying a public endpoint with throttling
    Given I have initialised the client
    When I make a large batch of requests
    Then I should be throttled when limits are exceeded


Scenario: Querying a secure endpoint
    Given I have initialised the client with valid credentials
    When I make a valid route and request to a secure endpoint
    Then I should get a valid response back