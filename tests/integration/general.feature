Feature: ESIClient Queries
 
Scenario: Querying a public endpoint
    Given I have initialised the client
    When I make a valid route and request 
    Then I should get a valid response back
