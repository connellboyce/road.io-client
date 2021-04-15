# Deployment Developer Notes

### Heroku
- Heroku allows developers to easily deploy projects from their GitHub.
    - We first made an account at [Heroku](https://signup.heroku.com/t/platform?c=70130000001xDpdAAE&gclid=Cj0KCQjwpdqDBhCSARIsAEUJ0hOuC4n1JM03GocEh09ho7ETcp0q4JdqaecO2Z2qWqrsCixRBB6bdJ0aAmMlEALw_wcB).
    - Once we had logged in, we selected the option to create a new application.
    - For our deployment method we chose GitHub which utilizes OAuth and GitHub environments.
    - We are then prompted to select our repository.
    - Specifically for the frontend, since it requires "create-react-app" to be run in order to have the node modules, we also had to provide a Buildpack for create-react-app from [this GitHub repository](https://github.com/mars/create-react-app-buildpack).
    - Once all of these things were configured, we manually deployed the app and enabled automatic deploys.    

### Domain & DNS
 - The deployment is configured to use the domain roadio.codes
 - Name.com name servers handle translation of the public domain to a private Heroku domain, and from there Heroku handles translation to the destination IP address.
