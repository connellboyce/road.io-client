# Frontend Developer Notes

### React
- Why Create-React-App?
  - React is Facebook's widely-used, open source js library for building UIs. It helps to keep the app organized into components, and manage their state.
  - Similar to Spring Boot, Create-React-App simplifies configuration and enables the developers to jump straight to styling and functionality.

### Components 
- The frontend is divided into three components:

- App.js
  - The entry point of the applicaiton, containing some text and animation for the landing page.
- Map.js
  - The core part of the UI is filled by an interactive map set up here. HERE maps scripts are loaded from index.html and accessed in this component. Upon rendering, Map.js makes a synchronous request to the backend to obtain the HERE API key. The map is configured and added to the component's state. The component's methods are passed as props to DataBox.js, which is rendered alongside the map.
  - displayRoute() handles an entire route response, and adds both the route line and markers onto the map.
  - getCgStations() handles a set of points of interest, turns them into markers, creates a range circle, and adds them onto the map.
- DataBox.js
  - This component renders a box containing input fields and serves as the main place for user input. 
  - Autocomplete...
  - One method fires when the submit button is clicked, gathering up the user's input, validating it by calling a second method, and making a request to the appropriate backend API. After recieving a response, this is passed off to one of the two Map.js methods.  
    - Input Validation...

### Other Libraries
- testing-library and Mock Service Worker are lightly used for some tests.
