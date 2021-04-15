# Backend Developer Notes

### Spring Boot
- Why Spring Boot?
    - Spring Boot allows Road.io's backend to be run on an embedded Tomcat server. This benefits the program because now it is able to exist as a URL which the frontend will make calls to.
- What is Spring Boot?
    - In the words of Spring's website: "Spring Boot makes it easy to create stand-alone, production-grade Spring based Applications that you can 'just run'."
    - Spring Boot exists to minimize startup time to create a Spring framework program such as the Road.io backend.

### Architecture
- The Road.io backend utilizes Spring Boot's components for an architecture to support dependency injection.
- Currently, there is only one implemented service class per interface, but the architecture is maintained for scalability and clarity.
- This architecture contains
    - Controllers: Classes which handle requests to the backend
    - Services: Interfaces which are injected into the controllers
    - Service Implementations: Classes which contain the logic for the controllers
    
### API Consumption
- The Road.io application currently consumes two APIs.
    - [HERE API](https://developer.here.com/documentation/geocoding-search-api/api-reference-swagger.html)
    - [NREL API](https://developer.nrel.gov/)
- These APIs take keys which are stored in the environment variables of the machine running the program.
    - The program will fail to run if the machine running the application does not possess valid API keys.
- Cross-Origin Requests are enabled to allow the project to function properly.
- At the moment, the backend serves as an aggregator between the actual APIs and the frontend. This allows Road.io to request specific URLs and content from the frontend and the returns have the ability to be manipulated if deemed necessary.

### WebFlux
- Road.io utilizes WebFlux to make its API requests.
- The .block() method is utilized to account for the non-reactive nature of the backend. This forces the backend to wait until it has a response or has timed out before attemping to return any values.
- The WebFlux return casting is set to String as there is no current need to cast the responses to custom models. If the need were to arise, Road.io has the capacity to allow for this.

### Testing
- The backend is tested with a combination of Mockito and JUnit
- These tests are checked for coverage using JaCoCo as a dependency in the pom.
    - The projects resides at 94% test coverage.
- When testing controllers, the tests mock a service, use a doReturn to give a mocked response when certain parameters are provided, and then will verify the number of times method(s) are called and ensure that the received response is the same as the expected.
- When this Mockito is done, JUnit is used for Assert functions to check for things like notNull, equals, contains, and more.