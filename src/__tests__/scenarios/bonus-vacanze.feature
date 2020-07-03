Feature: Bonus Vacanze
    Collects all scenarios regarding the interaction
    of an authenticated Citizen with Bonus functions api

    Scenario: DSU is not eligible
        Given a citizen with an ineligible dsu
        When she starts an eligibility check
        Then the service return success
        And she receives a message
        And the message body contains "supera la soglia"
        And the message subject contains "completato le verifiche"

    Scenario: DSU is eligible
        Given a citizen with an eligible dsu
        When she starts an eligibility check
        Then the service return success
        And she receives a message
        And the message body contains "il tuo nucleo familiare ha diritto"
        And the message subject contains "completato le verifiche"

    Scenario: A citizen activate a bonus
        Given a citizen with an eligible dsu
        When she starts an eligibility check
        And she receives a message
        And she starts the bonus activation procedure
        Then the bonus activation service returns success
        And every family member receives a message